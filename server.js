const express = require("express")
const path = require("path")
const P = require("pino")
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys")

const app = express()
const PORT = process.env.PORT || 3000

const OWNER_NUMBER = "254718190267"
const BOT_NAME = "Glen-x-mini"

let pairingCode = "Starting bot..."
let connectionStatus = "Starting..."
let sock

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("session")
    const { version } = await fetchLatestBaileysVersion()

    sock = makeWASocket({
        version,
        logger: P({ level: "silent" }),
        printQRInTerminal: false,
        auth: state,
        browser: [BOT_NAME, "Chrome", "1.0"],
        connectTimeoutMs: 60000,
        defaultQueryTimeoutMs: 0,
        keepAliveIntervalMs: 10000
    })

    sock.ev.on("creds.update", saveCreds)

    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update

        if (connection === "connecting") {
            connectionStatus = "Connecting to WhatsApp..."
            console.log(connectionStatus)
        }

        if (connection === "open") {
            connectionStatus = "Connected ✅"
            console.log("✅ WhatsApp Connected")

            if (!sock.authState.creds.registered) {
                try {
                    await new Promise(r => setTimeout(r, 5000))
                    pairingCode = await sock.requestPairingCode(OWNER_NUMBER)
                    console.log("🔥 Pairing Code:", pairingCode)
                } catch (err) {
                    console.log("Pairing Error:", err)
                    pairingCode = "Error generating code. Restart server."
                }
            } else {
                pairingCode = "Already paired ✅"
            }
        }

        if (connection === "close") {
            connectionStatus = "Disconnected ❌"
            console.log("❌ Connection closed.")

            const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut

            if (shouldReconnect) {
                console.log("🔄 Reconnecting...")
                setTimeout(startBot, 5000)
            } else {
                pairingCode = "Logged out. Delete session & restart."
            }
        }
    })
}

startBot()

app.use(express.static(path.join(__dirname, "public")))

app.get("/code", (req, res) => {
    res.json({ code: pairingCode, status: connectionStatus })
})

app.listen(PORT, () => console.log("🌍 Server running on port", PORT))
