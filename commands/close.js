const { SlashCommandBuilder } = require('discord.js');
const { closeTicket } = require('../handlers/ticketManager');

module.exports = {
  data: new SlashCommandBuilder().setName('close').setDescription('Close the current ticket'),

  async execute(interaction) {
    await closeTicket(interaction);
  },
};
