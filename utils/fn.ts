import { ethers } from 'ethers';
import fs from 'fs';
import prompts from './prompts';
import config from './config';


const hint = function (hintString: string = '', targetLength: number = 6) {
    if (0 < targetLength) {
        console.log(`\n--------- --------- ${hintString.padEnd(targetLength, ' ')} --------- ---------`);
    } else {
        console.log(`\n--------- --------- ${hintString} --------- ---------`);
    }
}

const hi = function (hintString: string) {
    hint(hintString, 0);
}

function touchDir(p: string) {
    const _arr = p.split('/');
    const _pos = _arr[0] === '' ? 1 : 0;
    for (let i = _pos; i < _arr.length; i++) {
        const _p = _arr.slice(0, i + 1).join('/');

        if (!fs.existsSync(_p)) {
            fs.mkdirSync(_p);
        }
    }
}

/**
 * Get wallets from a BIP39 mnemonic
 */
async function deriveWallets(n: number = 20): Promise<ethers.HDNodeWallet[]> {
    hi('Derive Wallet Accounts');

    let wallets: ethers.HDNodeWallet[] = [];

    const words = config['MNEMONIC'].split(' ');

    if (config['MNEMONIC'] && await prompts.askForConfirm(`Mnemonic: ${words.slice(0, 2).join(' ')} ... ${words.slice(-2).join(' ')}`)) {
        const passphrase = await prompts.askForPassphrase();
        const baseWallet = ethers.HDNodeWallet.fromPhrase(config['MNEMONIC'], passphrase);
        const baseAccount = baseWallet.deriveChild(0);

        if (await prompts.askForConfirm(`BASE_Wallet: ${baseAccount.address}`)) {
            const accountIndex = await prompts.askForAccountIndex();
            const account0 = baseWallet.deriveChild(accountIndex);
            if (await prompts.askForConfirm(`Account#0: ${account0.address}`)) {
                for (let i = accountIndex; i < accountIndex + n; i++) {
                    wallets.push(baseWallet.deriveChild(i));
                }
            }
        }
    }

    console.log('');
    return wallets;
}


// /**
//  * Convert a message hash to an Ethereum Signed Message hash
//  * 
//  * @param {string} messageHash
//  * @return {string}
//  * 
//  * @see https://eips.ethereum.org/EIPS/eip-191
//  */
// function toEthSignedMessageHash(messageHash: string): string {
//     return ethers.utils.solidityKeccak256(
//         ['string', 'bytes32'],
//         ['\x19Ethereum Signed Message:\n32', messageHash]
//     );
// }

export default {
    hint: hint,
    hi: hi,

    touchDir: touchDir,
    deriveWallets: deriveWallets,
    // toEthSignedMessageHash: toEthSignedMessageHash,
}

