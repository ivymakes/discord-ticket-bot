// Non-secret settings live here instead of .env — easier to edit, and you can
// add comments. Keep actual secrets (token, IDs tied to login) in .env.

module.exports = {
  // Role(s) that can see/claim tickets and get pinged when one opens.
  // Right-click a role -> Copy Role ID. Add as many as you want.
  supportRoleIds: [
    '123456789012345678',
    '876543210987654321',
  ],

  // Channel category tickets get created under. Right-click the category -> Copy Category ID.
  // Leave as null to create ticket channels at the top level of the server instead.
  ticketCategoryId: null,

  // Channel where the closed-ticket transcript gets posted. Right-click the channel -> Copy Channel ID.
  transcriptChannelId: null,
};
