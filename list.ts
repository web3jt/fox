import { ethers } from 'ethers';
import config from './utils/config';
import fn from './utils/fn';

async function main() {
    const provider = new ethers.JsonRpcProvider(config['HTTP_PROVIDERS']['GOERLI']);

    const wallets = await fn.deriveWallets(3);
    for (const wallet of wallets) {
        const address = wallet.address;
        const balance = await provider.getBalance(address);

        console.log(`${address}: ${ethers.formatUnits(balance, 'ether')}E`);
    }
}

main();
