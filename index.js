const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, delay, Browsers } = require('@whiskeysockets/baileys');
const pino = require('pino');

const NUMERO = '243960262558'

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    
    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        auth: state,
        browser: Browsers.macOS('Chrome') // Ça évite le ban
    });

    sock.ev.on('creds.update', saveCreds);
    
    // On attend que la connexion soit prête avant de demander le code
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'open') {
            console.log('Bot connecté ✅');
        }
        
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Connexion fermée. Reconnexion dans 5s...');
            if (shouldReconnect) {
                await delay(5000);
                startBot();
            }
        }
    });

    // Demander le code seulement si pas enregistré
    if (!state.creds.registered) {
        await delay(10000); // Attendre 10s que WhatsApp soit prêt
        try {
            const code = await sock.requestPairingCode(NUMERO);
            console.log('\n==================================');
            console.log(`CODE POUR 243960262558 : ${code}`);
            console.log('==================================\n');
        } catch (e) {
            console.log('Erreur code:', e);
        }
    }
}

startBot();
