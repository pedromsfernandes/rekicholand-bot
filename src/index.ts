import Discord, { DMChannel } from 'discord.js';
import Commands from './commands';
import { ICommand } from './commands/types';
import { PREFIX } from './constants';

import onVoiceStateUpdate from './features/voiceTextLinking';

require('dotenv').config();

const client = new Discord.Client();
const commands = new Discord.Collection<string, ICommand>();

Object.entries(Commands).forEach(([, command]) => {
  commands.set(command.name, command);
});

client.on('voiceStateUpdate', onVoiceStateUpdate);

client.on('message', (message) => {
  if (!message.content.startsWith(PREFIX) || message.author.bot) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const commandName = args?.shift()?.toLowerCase();

  if (commandName === undefined) return;

  const command = commands.get(commandName)
    || commands.find((cmd) => (cmd.aliases ? cmd.aliases.includes(commandName) : false));

  if (!command) return;

  if (command?.guildOnly && message.channel.type === 'dm') {
    message.reply("I can't execute that command inside DMs!");
    return;
  }

  if (command?.permissions && !(message.channel instanceof DMChannel)) {
    const authorPerms = message.channel.permissionsFor(message.author);
    if (!authorPerms || !authorPerms.has(command.permissions)) {
      message.reply('You can not do this!');
      return;
    }
  }

  if (command?.args && !args.length) {
    let reply = "You didn't provide any arguments!";

    if (command.usage) {
      reply += `\nThe proper usage would be: \`${PREFIX} ${command.name} ${command.usage}\``;
    }

    message.reply(reply);
    return;
  }

  try {
    command?.execute(message, args);
  } catch (error) {
    message.reply("Sorry, I couldn't fulfill this command!");
  }
});

client.login(process.env.CLIENT_TOKEN);
