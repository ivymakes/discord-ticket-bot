const { SlashCommandBuilder } = require('discord.js');
const { removeUserFromTicket } = require('../handlers/ticketManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remove')
    .setDescription('Remove a user from the current ticket')
    .addUserOption((option) => option.setName('user').setDescription('User to remove').setRequired(true)),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    await removeUserFromTicket(interaction, user);
  },
};
