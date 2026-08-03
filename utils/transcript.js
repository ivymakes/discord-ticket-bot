const { AttachmentBuilder } = require('discord.js');

async function buildTranscript(channel) {
  const messages = [];
  let lastId;

  while (true) {
    const options = { limit: 100 };
    if (lastId) options.before = lastId;

    const batch = await channel.messages.fetch(options);
    if (batch.size === 0) break;

    messages.push(...batch.values());
    lastId = batch.last().id;

    if (batch.size < 100) break;
  }

  messages.reverse();

  const lines = messages.map((msg) => {
    const timestamp = new Date(msg.createdTimestamp).toISOString().replace('T', ' ').slice(0, 19);
    let line = `[${timestamp}] ${msg.author.tag}: ${msg.content || '(no text content)'}`;

    if (msg.attachments.size > 0) {
      const links = msg.attachments.map((a) => a.url).join(', ');
      line += `\n  attachments: ${links}`;
    }

    return line;
  });

  const header = `Transcript for #${channel.name}\nGenerated: ${new Date().toISOString()}\n${'='.repeat(50)}\n\n`;
  const body = lines.length > 0 ? lines.join('\n') : '(no messages)';

  return new AttachmentBuilder(Buffer.from(header + body, 'utf8'), {
    name: `transcript-${channel.name}.txt`,
  });
}

module.exports = { buildTranscript };
