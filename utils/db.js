const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'tickets.json');

function ensureFile() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, '[]', 'utf8');
  }
}

function readAll() {
  ensureFile();
  const raw = fs.readFileSync(DB_PATH, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error('tickets.json was invalid JSON, starting fresh:', err);
    return [];
  }
}

function writeAll(tickets) {
  fs.writeFileSync(DB_PATH, JSON.stringify(tickets, null, 2), 'utf8');
}

function createTicket(ticket) {
  const tickets = readAll();
  tickets.push(ticket);
  writeAll(tickets);
  return ticket;
}

function getTicketByChannel(channelId) {
  return readAll().find((t) => t.channelId === channelId) || null;
}

function getOpenTicketByUser(userId) {
  return readAll().find((t) => t.userId === userId && t.status === 'open') || null;
}

function updateTicket(channelId, updates) {
  const tickets = readAll();
  const index = tickets.findIndex((t) => t.channelId === channelId);
  if (index === -1) return null;
  tickets[index] = { ...tickets[index], ...updates };
  writeAll(tickets);
  return tickets[index];
}

function removeTicket(channelId) {
  const tickets = readAll();
  const filtered = tickets.filter((t) => t.channelId !== channelId);
  writeAll(filtered);
}

module.exports = {
  readAll,
  createTicket,
  getTicketByChannel,
  getOpenTicketByUser,
  updateTicket,
  removeTicket,
};
