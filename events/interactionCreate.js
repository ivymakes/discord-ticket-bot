const { openTicket, claimTicket, closeTicket } = require('../handlers/ticketManager');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    try {
      if (interaction.isChatInputCommand()) {
        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) return;
        await command.execute(interaction);
        return;
      }

      if (interaction.isButton()) {
        if (interaction.customId === 'ticket_open') return openTicket(interaction);
        if (interaction.customId === 'ticket_claim') return claimTicket(interaction);
        if (interaction.customId === 'ticket_close') return closeTicket(interaction);
      }
    } catch (err) {
      console.error('Error handling interaction:', err);
      const errorMessage = 'Something went wrong handling that.';
      if (interaction.deferred || interaction.replied) {
        await interaction.followUp({ content: errorMessage, ephemeral: true }).catch(() => null);
      } else {
        await interaction.reply({ content: errorMessage, ephemeral: true }).catch(() => null);
      }
    }
  },
};
