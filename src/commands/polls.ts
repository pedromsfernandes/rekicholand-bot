import { ICommand } from "./types";

const Polls: ICommand = {
  name: "poll",
  description: "Multi option poll",
  guildOnly: false,
  args: true,
  usage: "<question> <answerX>, ...",
  async execute(message, args) {
    message.delete();
    if (args.length < 3) {
      message.reply("You need to provide a question and at least two answers!");
      return;
    }

    if (args.length > 8) {
      message.reply("You can't provide more than 7 answers!");
      return;
    }

    const [question, ...answers] = args;
    const reactions = ["🇦", "🇧", "🇨", "🇩", "🇪", "🇫", "🇬"];

    const pollMessage = await message.channel.send(
      `${message.author} asks: "${question}"\n\n${answers
        .map((answer, i) => `${reactions[i]} - ${answer}`)
        .join("\n")}`
    );

    reactions.slice(0, answers.length).forEach(async (reaction) => {
      await pollMessage.react(reaction);
    });
  },
};

export default Polls;
