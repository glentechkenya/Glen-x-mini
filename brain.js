function processMessage(msg, client, botNumber) {
    const text = msg.body.toLowerCase();

    if (text === 'hello') {
        msg.reply('👋 Hi! I am Glen-x-mini.');
    } else if (text === 'help') {
        msg.reply('Available commands:\n- hello\n- help\n- ping\n- about');
    } else if (text === 'ping') {
        msg.reply('🏓 pong!');
    } else if (text === 'about') {
        msg.reply(`🤖 Glen-x-mini bot\nConnected to: ${botNumber}`);
    } else {
        msg.reply('❓ Unknown command. Type "help" for options.');
    }
}

module.exports = { processMessage };
