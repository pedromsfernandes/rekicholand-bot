import Discord, { Channel } from 'discord.js';

require('dotenv').config();

const client = new Discord.Client();

const BOT_NAME = 'RekichoLand-bot';

const cleanName = (name: string | undefined) => (name ? name.replace('#', '').replace(' ', '-').toLowerCase() : undefined);

client.on('voiceStateUpdate', async (oldState, newState) => {
  let name = '';

  // User joined channel
  if (oldState.channelID === null && newState.channelID) {
    let channelRole;
    name = `${cleanName(newState.channel?.name)}-text`;
    // User is first to join channel
    if (newState.channel?.members.size === 1) {
      channelRole = await newState.guild.roles.create({
        reason: 'role to access text chat',
        data: {
          name,
        },
      });
      const botRole = newState.guild.roles.cache.find(
        (role) => role.name === BOT_NAME,
      );

      const permissionOverwrites:
      | Discord.OverwriteResolvable[]
      | Discord.Collection<string, Discord.OverwriteResolvable>
      | undefined = [
        { id: newState.channel.guild.roles.everyone, deny: 'VIEW_CHANNEL' },
        { id: channelRole, allow: 'VIEW_CHANNEL' },
      ];

      if (botRole) permissionOverwrites.push({ id: botRole, allow: 'VIEW_CHANNEL' });

      newState.guild.channels.create(name, {
        reason: 'Voice exclusive text chat',
        parent: newState.channel.parent as Channel,
        permissionOverwrites,
      });

      newState.member?.roles.add(channelRole);
    } else {
      channelRole = newState.guild.roles.cache.find(
        (role) => role.name === name,
      );
    }

    if (channelRole) newState.member?.roles.add(channelRole);
  } else if (newState.channelID === null) /* User left channel */ {
    name = `${cleanName(oldState.channel?.name)}-text`;
    const channelRole = newState.guild.roles.cache.find(
      (role) => role.name === name,
    );
    if (channelRole) newState.member?.roles.remove(channelRole);
    //  Channel is now empty
    if (oldState.channel?.members.size === 0) {
      channelRole?.delete();
      const textChannel = newState.guild.channels.cache.find(
        (channel) => channel.name === name && channel.isText(),
      );
      textChannel?.delete();
    }
  }
});

client.login(process.env.CLIENT_TOKEN);
