import { ethers } from 'ethers';
import prompts from './utils/prompts';

const main = async function () {
    const wallet = ethers.Wallet.createRandom();
    const words = wallet.mnemonic?.phrase;
    const account0 = wallet.deriveChild(0);

    if (await prompts.askForConfirm(account0.address)) {
        console.log(words);
    }
}

main();
