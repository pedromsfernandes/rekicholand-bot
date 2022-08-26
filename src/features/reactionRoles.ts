import { MessageReaction, PartialMessageReaction, PartialUser, User } from 'discord.js';
import Message from '../entities/Message';
import Role from '../entities/Role';

const addReactionRole = async (
  messageReaction: MessageReaction | PartialMessageReaction,
  user: User | PartialUser,
) => {
  if (user.bot) return;

  const rolesMessage = await Message.find({
    dId: messageReaction.message.id,
    type: 'reaction-roles',
  });

  if (rolesMessage) {
    const role = await Role.findOne({ emoji: messageReaction.emoji.name! });

    if (role) {
      const member = await messageReaction.message.guild?.members.fetch(
        user.id,
      );
      const guildRole = await messageReaction.message.guild?.roles.fetch(
        role.dId,
      );

      if (guildRole) member?.roles.add(guildRole);
    }
  }
};

const removeReactionRole = async (
  messageReaction: MessageReaction | PartialMessageReaction,
  user: User | PartialUser,
) => {
  if (user.bot) return;

  const rolesMessage = await Message.find({
    dId: messageReaction.message.id,
    type: 'reaction-roles',
  });

  if (rolesMessage) {
    const role = await Role.findOne({ emoji: messageReaction.emoji.name! });

    if (role) {
      const member = await messageReaction.message.guild?.members.fetch(
        user.id,
      );
      const guildRole = await messageReaction.message.guild?.roles.fetch(
        role.dId,
      );

      if (guildRole) member?.roles.remove(guildRole);
    }
  }
};

const onReactionRemove = (
  messageReaction: MessageReaction | PartialMessageReaction,
  user: User | PartialUser,
) => {
  removeReactionRole(messageReaction, user);
};

export { addReactionRole, onReactionRemove };
