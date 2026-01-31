const startPairing = require('./pair');
const connectDB = require('./mongodb');
const settings = require('./settings');
const admins = require('./admin.json');
const linked = require('./number.json');
const fs = require('fs');

(async () => {
  await connectDB();
  const sock = await startPairing();

  sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0];
    if (!msg.message || msg.key.fromMe) return;
    const from = msg.key.remoteJid;
    const text = msg.message.conversation?.trim();

    if (text === settings.prefix + 'link') {
      if (!linked.includes(from)) {
        linked.push(from);
        fs.writeFileSync('./number.json', JSON.stringify(linked, null, 2));
        await sock.sendMessage(from, { text: `${settings.botName}: Linking successful ✅` });
        for (const admin of admins) {
          await sock.sendMessage(admin + '@s.whatsapp.net', { text: `New user linked: ${from}` });
        }
      }
    }

    if (text === settings.prefix + 'menu') {
      await sock.sendMessage(from, { text: 'Menu:\n.link - link your account\n.menu - show commands' });
    }

    if (text === settings.prefix + 'about') {
      await sock.sendMessage(from, { text: `${settings.botName} is a mini WhatsApp bot for linking notifications.` });
    }
  });
})();
