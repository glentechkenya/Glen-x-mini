const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const brain = require('./brain');

const app = express();
const PORT = process.env.PORT || 3000;

// Paste your number here later
const BOT_NUMBER = "YOUR_NUMBER_HERE"; 

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('ready', () => {
    console.log('✅ Bot connected successful');
});

client.on('message', msg => {
    brain.processMessage(msg, client, BOT_NUMBER);
});

client.initialize();

// Express server for Render
app.get('/', (req, res) => {
    res.send('Glen-x-mini WhatsApp bot is running!');
});

app.listen(PORT, () => {
    console.log(`🌐 Web server running on port ${PORT}`);
});
