import { differenceInHours } from "date-fns";
import { MessageReaction, PartialMessageReaction } from "discord.js";

const LFG_MESSAGE = "👀";
const LFG_COUNT = 4;

const checkIfReadyForGame = async (messageReaction: MessageReaction | PartialMessageReaction) => {
  const { message } = messageReaction;
  let neededReactions = LFG_COUNT;

  if (message.content !== LFG_MESSAGE || differenceInHours(new Date(), message.createdAt) >= 2) return;

  const readyReactions = message.reactions.cache.find(
    (reaction) => reaction.emoji.name === LFG_MESSAGE
  );

  if (!(readyReactions && readyReactions.count)) {
    return;
  }

  if (
    readyReactions.users.cache.find((user) => user.id === message.author?.id)
  ) {
    neededReactions += 1;
  }

  if (readyReactions.count === neededReactions) {
    const users = new Set(readyReactions.users.cache.map((u) => `<@${u.id}>`));
    users.add(`<@${message.author?.id}>`);
    message.channel.send(`${[...users].join(" ")} Let's go!`);
  }
};

export default checkIfReadyForGame;
