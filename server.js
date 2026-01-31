const express = require("express")
const path = require("path")
const P = require("pino")
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys")

const app = express()
app.use(express.json())
app.use(express.static(path.join(__dirname, "public")))

// Admin number
const ADMIN_NUMBER = "254718190267"
const BOT_NAME = "Glen-x-mini"

// Bot variables
let sock = null
let pairingCode = ""
let connectionStatus = "Offline ❌"

// --- Start bot function ---
async function startBot(number) {
    const { state, saveCreds } = await useMultiFileAuthState("session")
    const { version } = await fetchLatestBaileysVersion()

    sock = makeWASocket({
        version,
        logger: P({ level: "silent" }),
        printQRInTerminal: false,
        auth: state,
        browser: [BOT_NAME, "Chrome", "1.0"]
    })

    sock.ev.on("creds.update", saveCreds)

    // Connection updates
    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update

        if (connection === "connecting") connectionStatus = "Connecting..."
        if (connection === "open") {
            connectionStatus = "Connected ✅"
            if (!sock.authState.creds.registered) {
                try {
                    await new Promise(r => setTimeout(r, 4000))
                    pairingCode = await sock.requestPairingCode(number)
                    connectionStatus = "Pairing code ready 🔥"
                } catch {
                    pairingCode = "Error requesting code. Retry."
                    connectionStatus = "Disconnected ❌"
                }
            } else {
                pairingCode = "Already paired ✅"
            }
        }

        if (connection === "close") {
            connectionStatus = "Disconnected ❌"
            const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
            if (shouldReconnect) setTimeout(() => startBot(number), 5000)
            else pairingCode = "Logged out. Restart server."
        }
    })

    // --- Message Handler (brain) ---
    sock.ev.on("messages.upsert", async (msg) => {
        const message = msg.messages[0]
        if (!message.message) return
        const text = message.message.conversation || ""
        const from = message.key.remoteJid

        if (message.key.fromMe) return

        // Only admin commands
        if (from.endsWith("@s.whatsapp.net") && from.includes(ADMIN_NUMBER)) {
            if (text.toLowerCase() === "!restart") {
                await sock.sendMessage(from, { text: "Restarting bot..." })
                process.exit(0)
            }
            if (text.toLowerCase() === "!status") {
                await sock.sendMessage(from, { text: `Status: ${connectionStatus}\nPairing code: ${pairingCode}` })
            }
        }

        // --- Basic bot features ---
        if (text.toLowerCase() === "!ping") {
            await sock.sendMessage(from, { text: "Pong! 🏓" })
        }
        if (text.toLowerCase() === "!hello") {
            await sock.sendMessage(from, { text: "Hello! I'm Glen-x-mini 🤖" })
        }
        if (text.toLowerCase() === "!joke") {
            await sock.sendMessage(from, { text: "Why did the AI cross the road? To automate the chicken! 🐔" })
        }
    })
}

// --- API to start pairing ---
app.post("/pair", async (req, res) => {
    const { number } = req.body
    if (!number) return res.json({ error: "Number is required" })
    await startBot(number)
    res.json({ message: "Pairing started" })
})

// --- API to get status ---
app.get("/status", (req, res) => {
    res.json({ code: pairingCode, status: connectionStatus })
})

app.listen(process.env.PORT || 3000, () => console.log("🌍 Server running"))
