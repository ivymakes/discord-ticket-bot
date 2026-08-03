require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection } = require('discord.js');

if (!process.env.DISCORD_TOKEN) {
  console.error('Missing DISCORD_TOKEN in your .env file. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
for (const file of fs.readdirSync(commandsPath).filter((f) => f.endsWith('.js'))) {
  const command = require(path.join(commandsPath, file));
  if (command?.data?.name) {
    client.commands.set(command.data.name, command);
  }
}

const eventsPath = path.join(__dirname, 'events');
for (const file of fs.readdirSync(eventsPath).filter((f) => f.endsWith('.js'))) {
  const event = require(path.join(eventsPath, file));
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

client.login(process.env.DISCORD_TOKEN);

process.on('unhandledRejection', (err) => console.error('Unhandled promise rejection (bot is still running):', err));
