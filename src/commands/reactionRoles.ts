import Discord, { TextChannel } from "discord.js";
import { eq } from "drizzle-orm/expressions";
import { PREFIX } from "../constants";
import { db } from "../db/client";
import { findReactionRolesMessage, findRoleByName, findRolesByGuild } from "../db/queries";
import { Message, messagesTable, rolesTable } from "../db/schema";
import { ICommand } from "./types";

const updateRolesMessage = async (message: Discord.Message, rolesMessage: Message) => {
  if (message.guild?.id == undefined) {
    return;
  }

  const roles = await findRolesByGuild(message.guild.id);

  const rolesStr = roles.map((role) => `${role.emoji} - ${role.name}`).join("\n");

  const messageStr = `Hey! In the following lines, you'll see a list of emojis and roles. Be sure to react with the appropriate emojis if you want to be given their roles!\n\n${rolesStr}`;

  const channel = (await message.client.channels.fetch(rolesMessage.channel)) as TextChannel;
  const mes = await channel.messages.fetch(rolesMessage.dId);
  await mes.edit(messageStr);
  roles.forEach(({ emoji }) => {
    mes.react(emoji);
  });
};

const RenameRole: ICommand = {
  name: "rename",
  aliases: ["rn"],
  description: "Rename reaction role",
  args: true,
  guildOnly: true,
  usage: "<old_name> <new_name>",
  async execute(message, args) {
    if (args.length !== 2) {
      message.reply(`You must provide exactly 2 arguments: ${this.usage}`);
      return;
    }

    if (message.guild === null) {
      message.reply(`This feature only works in guild channels`);
      return;
    }

    const [oldName, newName] = args;
    const role = await findRoleByName(oldName);

    if (!role) {
      message.reply("Role not found!");
      return;
    }

    await db.update(rolesTable).set({ name: newName }).where(eq(rolesTable.id, role.id));

    const dRole = await message.guild.roles.fetch(role.dId);
    await dRole?.setName(newName);

    const reactionRolesMessage = await findReactionRolesMessage(message.guild.id);

    if (reactionRolesMessage) {
      await updateRolesMessage(message, reactionRolesMessage);
    }

    message.react("✅");
  },
};

const AddRole: ICommand = {
  name: "add",
  description: "Add reaction role",
  args: true,
  guildOnly: true,
  usage: "<role> <emoji>",
  async execute(message, args) {
    if (args.length !== 2) {
      message.reply(`You must provide exactly 2 arguments: ${this.usage}`);
      return;
    }

    if (message.guild === null) {
      message.reply(`This feature only works in guild channels`);
      return;
    }

    const [name, emoji] = args;

    const role = await findRoleByName(name);

    if (role) {
      message.reply("That role already exists!");
      return;
    }

    const newRole = await message.guild.roles.create({
      reason: "reaction role",
      name,
    });

    await db.insert(rolesTable).values({
      dId: newRole.id,
      name,
      emoji,
      guild: message.guild.id,
    });

    const rolesMessage = await findReactionRolesMessage(message.guild.id);

    if (rolesMessage) {
      await updateRolesMessage(message, rolesMessage);
    }

    message.react("✅");
  },
};

const RemoveRole: ICommand = {
  name: "remove",
  description: "Remove reaction role",
  aliases: ["rm"],
  args: true,
  guildOnly: true,
  usage: "<role>",
  async execute(message, args) {
    const [name] = args;
    const role = await findRoleByName(name);

    if (message.guild === null) {
      message.reply(`This feature only works in guild channels`);
      return;
    }

    if (role) {
      const dRole = await message.guild?.roles.fetch(role.dId);
      await dRole?.delete();
      await db.delete(rolesTable).where(eq(rolesTable.id, role.id));

      const rolesMessage = await findReactionRolesMessage(message.guild.id);

      if (rolesMessage) {
        const channel = (await message.client.channels.fetch(rolesMessage.channel)) as TextChannel;
        const mes = await channel.messages.fetch(rolesMessage.dId);
        const reaction = mes.reactions.cache.find((react) => react.emoji.name === role.emoji);
        reaction?.remove();
        await updateRolesMessage(message, rolesMessage);
      }

      message.react("✅");
    }
  },
};

const PublishRoles: ICommand = {
  name: "publish",
  description: "Publish message with reaction roles",
  args: true,
  guildOnly: true,
  usage: "<channel_name>",
  async execute(message, args) {
    const [name] = args;
    const targetChannel = message.guild?.channels.cache.find((channel) => channel.name === name) as TextChannel;

    if (!targetChannel) {
      message.reply("That channel does not exist!");
      return;
    }

    if (message.guild === null) {
      message.reply(`This feature only works in guild channels`);
      return;
    }

    const roles = await findRolesByGuild(message.guild.id);
    const rolesStr = roles.map((role) => `${role.emoji} - ${role.name}`).join("\n");

    const messageStr = `Hey! In the following lines, you'll see a list of emojis and roles. Be sure to react with the appropriate emojis if you want to be given their roles!\n\n${rolesStr}`;

    if (roles.length === 0) {
      message.reply("You haven't added any reaction roles yet!");
      return;
    }

    const rolesMessage = await findReactionRolesMessage(message.guild.id);

    if (rolesMessage) {
      message.reply("You have already published the roles!");
      return;
    }

    const newRolesMessage = await targetChannel.send(messageStr);

    roles.forEach(({ emoji }) => {
      newRolesMessage.react(emoji);
    });

    await db.insert(messagesTable).values({
      dId: newRolesMessage.id,
      channel: targetChannel.id,
      guild: message.guild.id,
      type: "reaction-roles",
    });
  },
};

const ListRoles: ICommand = {
  name: "list",
  aliases: ["ls"],
  description: "List reaction roles",
  args: false,
  guildOnly: true,
  async execute(message) {
    if (message.guild === null) {
      message.reply(`This feature only works in guild channels`);
      return;
    }

    const roles = await findRolesByGuild(message.guild.id);

    if (roles.length === 0) {
      await message.reply("There are no reaction roles!");
      return;
    }

    const rolesStr = roles.map((role) => `${role.emoji} - ${role.name}`).join("\n");

    await message.reply(`Here's a list of current reaction roles:\n\n${rolesStr}\n\n`);
  },
};

const ResetRoles: ICommand = {
  name: "reset",
  description: "Reset reaction roles",
  args: false,
  guildOnly: true,
  async execute(message) {
    if (message.guild === null) {
      message.reply(`This feature only works in guild channels`);
      return;
    }

    const deletedRoles = await db.delete(rolesTable).where(eq(rolesTable.guild, message.guild.id)).returning();

    deletedRoles.forEach(async (role) => {
      const dRole = await message.guild?.roles.fetch(role.dId);
      dRole?.delete();
    });

    const rolesMessage = await findReactionRolesMessage(message.guild.id);

    if (rolesMessage) {
      await db.delete(messagesTable).where(eq(messagesTable.id, rolesMessage.id));
      const channel = (await message.client.channels.fetch(rolesMessage.channel)) as TextChannel;
      const mes = await channel.messages.fetch(rolesMessage.dId);
      mes.delete();
    }

    message.react("✅");
  },
};

const Commands = {
  AddRole,
  RemoveRole,
  PublishRoles,
  ListRoles,
  ResetRoles,
  RenameRole,
};

const ReactionRoles: ICommand = {
  name: "reaction-roles",
  aliases: ["rr"],
  description: "Reaction Roles",
  guildOnly: true,
  args: true,
  usage: "Hello",
  permissions: "Administrator",
  subCommands: new Discord.Collection<string, ICommand>(
    Object.values(Commands).map((command) => [command.name, command])
  ),
  execute(message, args) {
    const commandName = args?.shift()?.toLowerCase();
    if (commandName === undefined) return;

    const command =
      this.subCommands!.get(commandName) ||
      this.subCommands!.find((cmd) => (cmd.aliases ? cmd.aliases.includes(commandName) : false));

    if (!command) return;

    if (command?.args && !args.length) {
      let reply = "You didn't provide any arguments!";

      if (command.usage) {
        reply += `\nThe proper usage would be: \`${PREFIX} ${this.name} ${command.name} ${command.usage}\``;
      }

      message.reply(reply);
      return;
    }

    try {
      command?.execute(message, args);
    } catch (error) {
      message.reply("Sorry, I couldn't fulfill this command!");
    }
  },
};

export default ReactionRoles;
