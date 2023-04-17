import { ethers } from 'ethers';
import fn from './utils/fn';
import prompts from './utils/prompts';

async function main() {
    const wallets = await fn.deriveWallets(0);
    const needBalance = await prompts.askForConfirm('Check Balance');
    let provider: ethers.JsonRpcProvider;
    if (needBalance) {
        provider = await fn.getProvider();
    }
    console.log('');

    for (const wallet of wallets) {
        const address = wallet.address;
        if (needBalance) {
            const balance = await provider.getBalance(address);
            console.log(`${address}: ${ethers.formatUnits(balance, 'ether')}E`);
        } else {
            console.log(address);
        }
    }

    console.log('');
}

main();
