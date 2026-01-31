const makeWASocket = require('@whiskeysockets/baileys').default;
const { useMultiFileAuthState, Browsers } = require('@whiskeysockets/baileys');

async function startPairing() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth');
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    browser: Browsers.macOS('Glenx-mini')
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, pairingCode } = update;
    if (pairingCode) {
      console.log('Pairing code:', pairingCode);
    }
    if (connection === 'open') {
      console.log('Connected!');
    }
  });

  sock.ev.on('creds.update', saveCreds);
  return sock;
}
module.exports = startPairing;
