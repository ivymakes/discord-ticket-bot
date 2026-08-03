const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { panelRow } = require('../handlers/ticketManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('panel')
    .setDescription('Post the ticket panel in this channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('Support Tickets')
      .setDescription('Need help? Click the button below to open a private ticket with staff.')
      .setColor(0x5865f2);

    await interaction.channel.send({ embeds: [embed], components: [panelRow()] });
    await interaction.reply({ content: 'Panel posted.', ephemeral: true });
  },
};
