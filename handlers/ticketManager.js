const {
  ChannelType,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const db = require('../utils/db');
const { buildTranscript } = require('../utils/transcript');
const config = require('../config');

function ticketControlsRow(claimed) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('ticket_claim')
      .setLabel(claimed ? 'Claimed' : 'Claim')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(claimed),
    new ButtonBuilder().setCustomId('ticket_close').setLabel('Close').setStyle(ButtonStyle.Danger),
  );
}

function panelRow() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('ticket_open').setLabel('Open Ticket').setStyle(ButtonStyle.Primary).setEmoji('🎫'),
  );
}

async function openTicket(interaction) {
  const existing = db.getOpenTicketByUser(interaction.user.id);
  if (existing) {
    const channel = interaction.guild.channels.cache.get(existing.channelId);
    return interaction.reply({
      content: channel ? `You already have an open ticket: ${channel}` : 'You already have an open ticket.',
      ephemeral: true,
    });
  }

  await interaction.deferReply({ ephemeral: true });

  const supportRoleIds = (config.supportRoleIds || []).filter((roleId) => {
    const valid = interaction.guild.roles.cache.has(roleId);
    if (!valid) console.warn(`Skipping supportRoleIds entry "${roleId}" — no matching role found in this server.`);
    return valid;
  });
  const categoryId = config.ticketCategoryId || null;

  const overwrites = [
    { id: interaction.guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
    {
      id: interaction.user.id,
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
    },
    { id: interaction.client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
  ];

  for (const roleId of supportRoleIds) {
    overwrites.push({
      id: roleId,
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
    });
  }

  const channelName = `ticket-${interaction.user.username}`.toLowerCase().slice(0, 90);

  const channel = await interaction.guild.channels.create({
    name: channelName,
    type: ChannelType.GuildText,
    parent: categoryId || undefined,
    permissionOverwrites: overwrites,
  });

  db.createTicket({
    channelId: channel.id,
    userId: interaction.user.id,
    claimedBy: null,
    status: 'open',
    createdAt: Date.now(),
  });

  const embed = new EmbedBuilder()
    .setTitle('New Ticket')
    .setDescription(`Thanks for reaching out, ${interaction.user}. Staff will be with you shortly.\n\nDescribe your issue below.`)
    .setColor(0x5865f2)
    .setTimestamp();

  const pingContent = supportRoleIds.length > 0 ? supportRoleIds.map((id) => `<@&${id}>`).join(' ') : undefined;

  await channel.send({
    content: pingContent,
    embeds: [embed],
    components: [ticketControlsRow(false)],
  });

  await interaction.editReply(`Ticket created: ${channel}`);
}

async function claimTicket(interaction) {
  const ticket = db.getTicketByChannel(interaction.channel.id);
  if (!ticket) {
    return interaction.reply({ content: 'This channel is not an active ticket.', ephemeral: true });
  }

  const supportRoleIds = config.supportRoleIds || [];
  const isSupport = supportRoleIds.length === 0 || supportRoleIds.some((id) => interaction.member.roles.cache.has(id));
  if (!isSupport) {
    return interaction.reply({ content: "You don't have permission to claim tickets.", ephemeral: true });
  }

  if (ticket.claimedBy) {
    return interaction.reply({ content: 'This ticket is already claimed.', ephemeral: true });
  }

  db.updateTicket(interaction.channel.id, { claimedBy: interaction.user.id });

  const currentName = interaction.channel.name;
  if (!currentName.startsWith('claimed-')) {
    await interaction.channel.setName(`claimed-${currentName}`).catch(() => null);
  }

  await interaction.update({ components: [ticketControlsRow(true)] });
  await interaction.followUp({ content: `Claimed by ${interaction.user}.` });
}

async function closeTicket(interaction) {
  const ticket = db.getTicketByChannel(interaction.channel.id);
  if (!ticket) {
    return interaction.reply({ content: 'This channel is not an active ticket.', ephemeral: true });
  }

  await interaction.reply('Closing this ticket and saving a transcript...');

  const logChannelId = config.transcriptChannelId;
  const logChannel = logChannelId ? interaction.guild.channels.cache.get(logChannelId) : null;

  if (logChannel) {
    const transcript = await buildTranscript(interaction.channel);
    const embed = new EmbedBuilder()
      .setTitle('Ticket Closed')
      .addFields(
        { name: 'Opened by', value: `<@${ticket.userId}>`, inline: true },
        { name: 'Closed by', value: `${interaction.user}`, inline: true },
        { name: 'Claimed by', value: ticket.claimedBy ? `<@${ticket.claimedBy}>` : 'Nobody', inline: true },
      )
      .setColor(0xed4245)
      .setTimestamp();

    await logChannel.send({ embeds: [embed], files: [transcript] }).catch((err) => {
      console.error('Failed to post transcript to log channel:', err);
    });
  }

  db.removeTicket(interaction.channel.id);

  setTimeout(() => {
    interaction.channel.delete().catch((err) => console.error('Failed to delete ticket channel:', err));
  }, 5000);
}

async function addUserToTicket(interaction, targetUser) {
  const ticket = db.getTicketByChannel(interaction.channel.id);
  if (!ticket) {
    return interaction.reply({ content: 'This channel is not an active ticket.', ephemeral: true });
  }

  await interaction.channel.permissionOverwrites.edit(targetUser.id, {
    ViewChannel: true,
    SendMessages: true,
    ReadMessageHistory: true,
  });

  return interaction.reply(`${targetUser} has been added to the ticket.`);
}

async function removeUserFromTicket(interaction, targetUser) {
  const ticket = db.getTicketByChannel(interaction.channel.id);
  if (!ticket) {
    return interaction.reply({ content: 'This channel is not an active ticket.', ephemeral: true });
  }

  await interaction.channel.permissionOverwrites.delete(targetUser.id);

  return interaction.reply(`${targetUser} has been removed from the ticket.`);
}

module.exports = {
  panelRow,
  ticketControlsRow,
  openTicket,
  claimTicket,
  closeTicket,
  addUserToTicket,
  removeUserFromTicket,
};
