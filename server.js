const express = require("express")
const path = require("path")
const P = require("pino")
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys")

const app = express()
const PORT = process.env.PORT || 3000

const OWNER_NUMBER = "254718190267"
const BOT_NAME = "Glen-x-mini"

let pairingCode = "Starting bot..."
let sock

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("session")

    sock = makeWASocket({
        logger: P({ level: "silent" }),
        printQRInTerminal: false,
        auth: state,
        browser: [BOT_NAME, "Chrome", "1.0"]
    })

    sock.ev.on("creds.update", saveCreds)

    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update

        if (connection === "open") {
            console.log("✅ WhatsApp Connected")

            // Request pairing code ONLY if not registered
            if (!sock.authState.creds.registered) {
                try {
                    pairingCode = await sock.requestPairingCode(OWNER_NUMBER)
                    console.log("🔥 Pairing Code:", pairingCode)
                } catch (err) {
                    console.log("Pairing Error:", err)
                    pairingCode = "Error generating code. Restart server."
                }
            }
        }

        if (connection === "close") {
            const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
            console.log("❌ Connection closed. Reconnecting:", shouldReconnect)
            if (shouldReconnect) startBot()
            else pairingCode = "Logged out. Delete session folder and restart."
        }
    })
}

startBot()

app.use(express.static(path.join(__dirname, "public")))

app.get("/code", (req, res) => {
    res.json({ code: pairingCode })
})

app.listen(PORT, () => console.log("🌍 Server running on port", PORT))
