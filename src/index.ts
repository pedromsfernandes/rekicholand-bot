require("dotenv").config();
import Discord, { GatewayIntentBits, GuildChannel, TextChannel } from "discord.js";
import { eq } from "drizzle-orm/expressions";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import stringArgv from "string-argv";
import Commands from "./commands";
import { ICommand } from "./commands/types";
import { PREFIX } from "./constants";
import { db } from "./db/client";
import { messagesTable } from "./db/schema";
import checkIfReadyForGame from "./features/lfg";
import { addReactionRole, onReactionRemove } from "./features/reactionRoles";
import onVoiceStateUpdate from "./features/voiceTextLinking";

const main = async () => {
  await migrate(db, { migrationsFolder: "./migrations" });

  const client = new Discord.Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.GuildVoiceStates,
    ],
  });
  const commands = new Discord.Collection<string, ICommand>();

  Object.entries(Commands).forEach(([, command]) => {
    commands.set(command.name, command);
  });

  client.once("ready", async () => {
    const rolesMessages = await db.select().from(messagesTable).where(eq(messagesTable.type, "reaction-roles"));

    rolesMessages.forEach(async (message) => {
      const guild = await client.guilds.fetch(message.guild);
      const channel = guild.channels.cache.get(message.channel) as TextChannel;
      channel.messages.fetch(message.dId);
    });
  });

  client.on("voiceStateUpdate", onVoiceStateUpdate);

  client.on("messageReactionAdd", (messageReaction, user) => {
    addReactionRole(messageReaction, user);
    checkIfReadyForGame(messageReaction);
  });

  client.on("messageReactionRemove", onReactionRemove);

  client.on("messageCreate", (message) => {
    if (!message.content.startsWith(PREFIX) || message.author.bot) return;

    const args = stringArgv(message.content.slice(PREFIX.length).trim());
    const commandName = args?.shift()?.toLowerCase();

    if (commandName === undefined) return;

    const command =
      commands.get(commandName) || commands.find((cmd) => (cmd.aliases ? cmd.aliases.includes(commandName) : false));

    if (!command) return;

    if (command?.guildOnly && message.channel.isDMBased()) {
      message.reply("I can't execute that command inside DMs!");
      return;
    }

    if (command?.permissions && message.channel instanceof GuildChannel) {
      const authorPerms = message.channel.permissionsFor(message.author);
      if (!authorPerms || !authorPerms.has(command.permissions)) {
        message.reply("You can not do this!");
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
