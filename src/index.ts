import Discord, { Channel } from 'discord.js';

require('dotenv').config();

const client = new Discord.Client();

const BOT_NAME = 'RekichoLand-bot';

const cleanName = (name: string | undefined) => (name ? name.replace('#', '').replace(' ', '-').toLowerCase() : undefined);

const onJoinChannel = async (newState: Discord.VoiceState) => {
  let channelRole;
  const name = `${cleanName(newState.channel?.name)}-text`;
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
  } else {
    channelRole = newState.guild.roles.cache.find((role) => role.name === name);
  }

  if (channelRole) newState.member?.roles.add(channelRole);
};

const onLeaveChannel = async (oldState: Discord.VoiceState) => {
  const name = `${cleanName(oldState.channel?.name)}-text`;
  const channelRole = oldState.guild.roles.cache.find(
    (role) => role.name === name,
  );
  if (channelRole) await oldState.member?.roles.remove(channelRole);
  //  Channel is now empty
  if (oldState.channel?.members.size === 0) {
    await channelRole?.delete();
    const textChannel = oldState.guild.channels.cache.find(
      (channel) => channel.name === name && channel.isText(),
    );
    await textChannel?.delete();
  }
};

const onChangeChannel = async (
  oldState: Discord.VoiceState,
  newState: Discord.VoiceState,
) => {
  await onLeaveChannel(oldState);
  onJoinChannel(newState);
};

client.on('voiceStateUpdate', async (oldState, newState) => {
  if (newState.channelID === null) {
    onLeaveChannel(oldState);
  } else if (oldState.channelID === null) {
    onJoinChannel(newState);
  } else if (oldState.channelID !== newState.channelID) {
    onChangeChannel(oldState, newState);
  }
});

client.login(process.env.CLIENT_TOKEN);
