import { MessageReaction, PartialMessageReaction, PartialUser, User } from "discord.js";
import { findReactionRolesMessageByDiscordId, findRoleByEmoji } from "../db/queries";

const addReactionRole = async (messageReaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) => {
  if (user.bot) return;

  const rolesMessage = await findReactionRolesMessageByDiscordId(messageReaction.message.id);

  if (rolesMessage) {
    const role = await findRoleByEmoji(messageReaction.emoji.name!);

    if (role) {
      const member = await messageReaction.message.guild?.members.fetch(user.id);
      const guildRole = await messageReaction.message.guild?.roles.fetch(role.dId);

      if (guildRole) member?.roles.add(guildRole);
    }
  }
};

const removeReactionRole = async (
  messageReaction: MessageReaction | PartialMessageReaction,
  user: User | PartialUser
) => {
  if (user.bot) return;

  const rolesMessage = await findReactionRolesMessageByDiscordId(messageReaction.message.id);

  if (rolesMessage) {
    const role = await findRoleByEmoji(messageReaction.emoji.name!);

    if (role) {
      const member = await messageReaction.message.guild?.members.fetch(user.id);
      const guildRole = await messageReaction.message.guild?.roles.fetch(role.dId);

      if (guildRole) member?.roles.remove(guildRole);
    }
  }
};

const onReactionRemove = (messageReaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) => {
  removeReactionRole(messageReaction, user);
};

export { addReactionRole, onReactionRemove };
