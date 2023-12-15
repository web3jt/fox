import { ethers } from 'ethers';
import fn from './utils/fn';
import prompts from './utils/prompts';
import * as qrcode from 'qrcode-terminal';

async function main() {
    const wallets = await fn.deriveWallets(0);
    const queryBalance = await prompts.askForConfirm('Query Balance');
    const showQrCode = await prompts.askForConfirm('Show QR Code');
    const showPrivKey = await prompts.askForConfirm('Show Private Key');
    const provider: ethers.JsonRpcProvider = queryBalance ? await fn.getProvider() : undefined;
    console.log('');

    for (const wallet of wallets) {
        const address = wallet.address;
        const balance = queryBalance ? await provider.getBalance(address) : undefined;

        const text: String[] = [address];
        if (showPrivKey) text.push(`${wallet.privateKey.slice(-4)} >>> ${wallet.privateKey.slice(6, -4)} <<< ${wallet.privateKey.slice(2, 6)}`)
        if (undefined !== balance) text.push(`${ethers.formatUnits(balance, 'ether')} E`);

        console.log(text.join(' :: '));

        if (showQrCode) qrcode.generate(address, { small: true });
    }

    console.log('');
}

main();
