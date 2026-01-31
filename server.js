const express = require("express")
const path = require("path")
const P = require("pino")
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys")

const app = express()
const PORT = process.env.PORT || 3000

const OWNER_NUMBER = "254718190267"
const BOT_NAME = "Glen-x-mini"

let pairingCode = "Not generated yet"
let sock

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("session")

    sock = makeWASocket({
        logger: P({ level: "silent" }),
        printQRInTerminal: false,
        auth: state,
        browser: [BOT_NAME, "Chrome", "1.0"]
    })

    if (!sock.authState.creds.registered) {
        pairingCode = await sock.requestPairingCode(OWNER_NUMBER)
        console.log("Pairing Code:", pairingCode)
    }

    sock.ev.on("creds.update", saveCreds)

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update

        if (connection === "close") {
            const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
            if (shouldReconnect) startBot()
        }

        if (connection === "open") {
            console.log(`${BOT_NAME} connected`)
        }
    })
}

startBot()

// Serve website
app.use(express.static(path.join(__dirname, "public")))

// Endpoint to get pairing code
app.get("/code", (req, res) => {
    res.json({ code: pairingCode })
})

app.listen(PORT, () => console.log("Server running on port", PORT))
