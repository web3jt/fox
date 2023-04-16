import fn from './utils/fn';

async function main() {
    const wallets = await fn.deriveWallets(3);
    for (const wallet of wallets) {
        const address = wallet.address;
        const privKey = wallet.privateKey;
        const _arr = privKey.split('');

        console.log(`${address}: ${_arr.slice(0, 6).join('')} --- ${_arr.slice(6, -4).join('')} --- ${_arr.slice(-4).join('')}`);
    }
}

main();
