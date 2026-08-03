const { SlashCommandBuilder } = require('discord.js');
const { addUserToTicket } = require('../handlers/ticketManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('add')
    .setDescription('Add a user to the current ticket')
    .addUserOption((option) => option.setName('user').setDescription('User to add').setRequired(true)),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    await addUserToTicket(interaction, user);
  },
};
