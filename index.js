const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, delay } = require('@whiskeysockets/baileys');
const pino = require('pino');

const NUMERO = '243960262558'

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const sock = makeWASocket({
        logger: pino({ level: 'fatal' }),
        auth: state,
        browser: ['Ubuntu', 'Chrome', '20.0.04']
    });

    sock.ev.on('creds.update', saveCreds);
    
    if (!state.creds.registered) {
        await delay(5000);
        const code = await sock.requestPairingCode(NUMERO);
        console.log('\n==================================');
        console.log(`CODE POUR 243960262558 : ${code}`);
        console.log('==================================\n');
    }
    
    sock.ev.on('connection.update', (update) => {
        const { connection } = update;
        if (connection === 'open') console.log('Bot connecté ✅');
        if (connection === 'close') startBot();
    });
}

startBot();
