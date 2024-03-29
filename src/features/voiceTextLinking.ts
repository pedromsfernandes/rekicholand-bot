import Discord, { ChannelType, PermissionsBitField } from 'discord.js';
import { BOT_NAME } from '../constants';

const cleanName = (name: string | undefined) => (name ? name.replace('#', '').replace(' ', '-').toLowerCase() : undefined);

const onJoinChannel = async (newState: Discord.VoiceState) => {
  let channelRole;
  const name = `${cleanName(newState.channel?.name)}-text`;
  // User is first to join channel
  if (newState.channel?.members.size === 1) {
    channelRole = await newState.guild.roles.create({
      reason: 'role to access text chat',
      name,
    });
    const botRole = newState.guild.roles.cache.find(
      (role) => role.name.toLowerCase() === BOT_NAME.toLowerCase(),
    );

    const permissionOverwrites:  
    | Discord.OverwriteResolvable[]
    | Discord.Collection<string, Discord.OverwriteResolvable> = [
      { id: newState.channel.guild.roles.everyone, deny: [PermissionsBitField.Flags.ViewChannel] },
      { id: channelRole, allow: [PermissionsBitField.Flags.ViewChannel] },
    ];

    if (botRole) permissionOverwrites.push({ id: botRole, allow: [PermissionsBitField.Flags.ViewChannel] });

    newState.guild.channels.create({
      name,
      reason: 'Voice exclusive text chat',
      parent: newState.channel.parent,
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
      (channel) => channel.name === name && channel.type === ChannelType.GuildText,
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

const onVoiceStateUpdate = (
  oldState: Discord.VoiceState,
  newState: Discord.VoiceState,
) => {
  if (newState.channelId === null) {
    onLeaveChannel(oldState);
  } else if (oldState.channelId === null) {
    onJoinChannel(newState);
  } else if (oldState.channelId !== newState.channelId) {
    onChangeChannel(oldState, newState);
  }
};

export default onVoiceStateUpdate;
