import prompts from 'prompts';

async function askForConfirm(hint: string = 'Confirm'): Promise<boolean> {
    while (true) {
        const response = await prompts({
            type: 'text',
            name: 'value',
            message: `${hint} (y/N)`,
        });

        if (response.value) {
            return response.value.toLowerCase().startsWith('y');
        }
    }
}

async function askForNumber(hint: string = 'Input a number'): Promise<number> {
    while (true) {
        const response = await prompts({
            type: 'number',
            name: 'value',
            message: hint,
        });

        if (response.value) {
            return parseInt(response.value);
        }
    }
}

/**
 * Ask for a BIP39 passphrase
 * 
 * @return {string} passphrase
 * 
 * @see https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki#from-mnemonic-to-seed
 */
async function askForPassphrase(): Promise<string> {
    while (true) {
        const response = await prompts({
            type: 'password',
            name: 'value',
            message: 'BIP39 Passphrase',
            validate: (value: string) => 8 > value.length ? 'Too short' : true
        });

        if (response.value) {
            return response.value;
        }
    }
}

/**
 * Ask for the account index
 * 
 * @returns {string} account index
 */
async function askForAccountIndex(hint: string = 'Account#_'): Promise<number> {
    while (true) {
        const response = await prompts({
            type: 'password',
            name: 'value',
            message: hint,
        });

        if (response.value) {
            return parseInt(response.value);
        }
    }
}

export default {
    askForConfirm: askForConfirm,
    askForNumber: askForNumber,
    askForPassphrase: askForPassphrase,
    askForAccountIndex: askForAccountIndex,
}
