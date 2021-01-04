import Discord, { PermissionString } from 'discord.js';

export interface ICommand {
  name: string;
  description: string;
  args: boolean;
  usage?: string;
  guildOnly: boolean;
  permissions?: PermissionString;
  aliases?: string[];
  subCommands?: Discord.Collection<string, ICommand>;
  execute: (message: Discord.Message, args: string[]) => void;
}
