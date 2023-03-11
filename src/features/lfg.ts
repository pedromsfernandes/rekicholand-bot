import { differenceInHours } from "date-fns";
import { MessageReaction, PartialMessageReaction, TextChannel } from "discord.js";

const LFG_MESSAGE = "👀";
const LFG_COUNT = 4;

const successMessagesCache = new Map<string, Date>();

const clearOldMessages = () => {
  const messagesToDelete = Array.from(successMessagesCache.keys()).filter(
    (messageId) => differenceInHours(new Date(), successMessagesCache.get(messageId) as Date) >= 2
  );

  messagesToDelete.forEach((messageId) => successMessagesCache.delete(messageId));
};

const checkIfReadyForGame = async (messageReaction: MessageReaction | PartialMessageReaction) => {
  const { message } = messageReaction;
  let neededReactions = LFG_COUNT;

  if (
    message.content !== LFG_MESSAGE ||
    differenceInHours(new Date(), message.createdAt) >= 2 ||
    successMessagesCache.has(message.id)
  )
    return;

  const readyReactions = message.reactions.cache.find((reaction) => reaction.emoji.name === LFG_MESSAGE);

  if (!(readyReactions && readyReactions.count)) {
    return;
  }

  if (readyReactions.users.cache.find((user) => user.id === message.author?.id)) {
    neededReactions += 1;
  }

  if (readyReactions.count === neededReactions) {
    const users = new Set(readyReactions.users.cache.map((u) => `<@${u.id}>`));
    users.add(`<@${message.author?.id}>`);
    (message.channel as TextChannel).send(`${[...users].join(" ")} Let's go!`);
    successMessagesCache.set(message.id, new Date());
  }

  clearOldMessages();
};

export default checkIfReadyForGame;
