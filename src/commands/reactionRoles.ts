import "reflect-metadata";
import Discord, { TextChannel } from "discord.js";
import { PREFIX } from "../constants";
import { ICommand } from "./types";
import Role from "../entities/Role";
import Message from "../entities/Message";

const AddRole: ICommand = {
  name: "add",
  description: "Add reaction role",
  args: true,
  usage: "<role> <emoji>",
  async execute(message, args) {
    console.log(args);
    const [name, emoji] = args;
    const role = await message.guild?.roles.create({
      reason: "reaction role",
      data: {
        name,
      },
    });
    Role.create({
      dId: role?.id,
      name,
      emoji,
      guild: message.guild?.id,
    }).save();

    message.react("✅");
  },
};

const RemoveRole: ICommand = {
  name: "remove",
  description: "Remove reaction role",
  args: true,
  usage: "<role>",
  async execute(message, args) {
    const [name] = args;
    const role = await Role.findOne({
      where: {
        name,
      },
    });

    if (role) {
      const dRole = await message.guild?.roles.fetch(role.dId);
      dRole?.delete();
      role?.remove();

      message.react("✅");
    }
  },
};

const PublishRoles: ICommand = {
  name: "publish",
  description: "Publish message with reaction roles",
  args: true,
  usage: "<channel_name>",
  async execute(message, args) {
    const [name] = args;
    const targetChannel = message.guild?.channels.cache.find(
      (channel) => channel.name === name
    ) as TextChannel;

    const roles = await Role.find({ guild: message.guild?.id });
    const rolesStr = roles
      .map((role) => `${role.emoji} - ${role.name}`)
      .join("\n");

    const rolesMessage = await targetChannel.send(
      `Hey! In the following lines, you'll see a list of emojis and roles. Be sure to react with the appropriate emojis if you want to be given their roles!\n\n${rolesStr}`
    );

    await Message.create({
      dId: rolesMessage.id,
      channel: targetChannel.id,
      guild: message.guild?.id,
      type: "reaction-roles",
    }).save();

    // targetChannel.messages.fetch();
  },
};

const ListRoles: ICommand = {
  name: "list",
  aliases: ["ls"],
  description: "List reaction roles",
  args: false,
  async execute(message) {
    const roles = await Role.find({ guild: message.guild?.id });

    if (roles.length === 0) {
      await message.reply("There are no reaction roles!");
      return;
    }

    const rolesStr = roles
      .map((role) => `${role.emoji} - ${role.name}`)
      .join("\n");

    await message.reply(
      `Here's a list of current reaction roles:\n\n${rolesStr}`
    );
  },
};

const ResetRoles: ICommand = {
  name: "reset",
  description: "Reset reaction roles",
  args: false,
  async execute(message) {
    const roles = await Role.find({ guild: message.guild?.id });
    await Role.remove(roles);
    message.react("✅");
  },
};

const Commands = {
  AddRole,
  RemoveRole,
  PublishRoles,
  ListRoles,
  ResetRoles,
};

const ReactionRoles: ICommand = {
  name: "reaction-roles",
  aliases: ["rr"],
  description: "Reaction Roles",
  guildOnly: true,
  args: true,
  usage: "Hello",
  permissions: "ADMINISTRATOR",
  subCommands: new Discord.Collection<string, ICommand>(
    Object.values(Commands).map((command) => [command.name, command])
  ),
  execute(message, args) {
    console.log("Hey!");
    const commandName = args?.shift()?.toLowerCase();
    if (commandName === undefined) return;

    const command =
      this.subCommands!.get(commandName) ||
      this.subCommands!.find((cmd) =>
        cmd.aliases ? cmd.aliases.includes(commandName) : false
      );

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
