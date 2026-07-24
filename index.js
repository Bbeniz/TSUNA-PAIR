const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, delay } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');

// NUMERO DU BOT - NE PAS TOUCHER
const NUMERO = '243960262558' 

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    
    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        auth: state,
        browser: ['Tsuna-Bot', 'Chrome', '1.0.0']
    });

    sock.ev.on('creds.update', saveCreds);
    
    // Génère le code de couplage si pas encore connecté
    if (!sock.authState.creds.registered) {
        await delay(3000);
        try {
            const code = await sock.requestPairingCode(NUMERO);
            console.log(`\n==================================`);
            console.log(`  TON CODE DE COUPLAGE : ${code}`);
            console.log(`  Va sur WhatsApp du 243960262558`);
            console.log(`  Paramètres > Appareils liés > Lier avec le code`);
            console.log(`==================================\n`);
        } catch (err) {
            console.log("Erreur code de couplage:", err);
        }
    }
    
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'open') {
            console.log('Bot connecté avec succès ✅');
        }
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Connexion fermée. Reconnexion...', shouldReconnect);
            if (shouldReconnect) startBot();
        }
    });
}

startBot();
