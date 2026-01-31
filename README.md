# Glenx-mini

A lightweight WhatsApp bot built with Baileys, modeled after rg-mini.

## Features
- Pairing code login (no QR)
- `.link` command to link user
- `.menu` command to show available commands
- Admin notification when new user links
- JSON persistence for linked users
- Optional MongoDB integration

## Setup
1. Clone repo
2. Run `npm install`
3. Run `node index.js`
4. Copy pairing code from console into WhatsApp (Settings → Linked Devices → Link with code)

## Deploy on Render
- Create a Node.js Web Service
- Build Command: `npm install`
- Start Command: `npm start`
- Add environment variable `MONGO_URI` if using MongoDB
- Attach persistent disk for `auth/` and `number.json`
