import Discord, { DMChannel, TextChannel } from 'discord.js';
import { createConnection } from 'typeorm';
import stringArgv from 'string-argv';

import path from 'path';
import Commands from './commands';
import { ICommand } from './commands/types';
import { PREFIX, PROD } from './constants';
import { onReactionAdd, onReactionRemove } from './features/reactionRoles';

import onVoiceStateUpdate from './features/voiceTextLinking';
import Message from './entities/Message';
import Role from './entities/Role';

require('dotenv').config();

const main = async () => {
  const conn = await createConnection({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    synchronize: !PROD,
    entities: [Message, Role],
    migrations: PROD ? [path.join(__dirname, './migrations/*')] : undefined,
  });
  await conn.runMigrations();

  const client = new Discord.Client();
  const commands = new Discord.Collection<string, ICommand>();

  Object.entries(Commands).forEach(([, command]) => {
    commands.set(command.name, command);
  });

  client.once('ready', async () => {
    const rolesMessages = await Message.find({
      where: { type: 'reaction-roles' },
    });

    rolesMessages.forEach(async (message) => {
      const guild = await client.guilds.fetch(message.guild);
      const channel = guild.channels.cache.get(message.channel) as TextChannel;
      channel.messages.fetch(message.dId);
    });
  });

  client.on('voiceStateUpdate', onVoiceStateUpdate);

  client.on('messageReactionAdd', onReactionAdd);

  client.on('messageReactionRemove', onReactionRemove);

  client.on('message', (message) => {
    if (!message.content.startsWith(PREFIX) || message.author.bot) return;

    const args = stringArgv(message.content.slice(PREFIX.length).trim());
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
};

main();
