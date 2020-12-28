import Discord from 'discord.js';
import { ICommand } from './types';

const ReactionRoles: ICommand = {
  name: 'reaction-roles',
  aliases: ['rr'],
  description: 'Reaction Roles',
  guildOnly: true,
  args: true,
  usage: 'Hello',
  permissions: 'ADMINISTRATOR',
  subCommands: new Discord.Collection<string, ICommand>(),
  execute(message, args) {
    console.log('Hey!');
  },
};

export default ReactionRoles;
