const { default: makeWASocket, useMultiFileAuthState, Browsers } = require('@whiskeysockets/baileys');
const pino = require('pino');

const NUMERO = '243960262558'

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    
    // 1. On génère le code direct si pas connecté
    if (!state.creds.registered) {
        const sock = makeWASocket({
            logger: pino({ level: 'fatal' }),
            auth: state,
            browser: Browsers.macOS('Desktop'),
            connectTimeoutMs: 60000
        });
        
        setTimeout(async () => {
            try {
                const code = await sock.requestPairingCode(NUMERO);
                console.log('\n==================================');
                console.log(`  CODE POUR 243960262558 : ${code}`);
                console.log(`  Copie ce code vite sur WhatsApp`);
                console.log('==================================\n');
                await sock.logout(); // On ferme pour éviter l'erreur
            } catch(e) {
                console.log('Erreur:', e);
            }
        }, 3000);
        
        sock.ev.on('creds.update', saveCreds);
        return;
    }
    
    // 2. Si déjà connecté, on lance le bot normal
    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        auth: state,
        browser: Browsers.macOS('Desktop')
    });
    sock.ev.on('creds.update', saveCreds);
    console.log('Bot connecté ✅');
}

startBot();
