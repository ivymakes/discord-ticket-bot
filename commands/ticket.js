const { SlashCommandBuilder } = require('discord.js');
const { openTicket } = require('../handlers/ticketManager');

module.exports = {
  data: new SlashCommandBuilder().setName('ticket').setDescription('Open a support ticket'),

  async execute(interaction) {
    await openTicket(interaction);
  },
};
