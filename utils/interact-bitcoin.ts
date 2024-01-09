import prompts from 'prompts';
import * as ecc from 'tiny-secp256k1';
import * as bitcoin from 'bitcoinjs-lib';
import { Payment } from 'bitcoinjs-lib';
import { toXOnly } from 'bitcoinjs-lib/src/psbt/bip371';
import * as bip39 from 'bip39';
import BIP32Factory, { BIP32Interface } from 'bip32';

import CONFIG from './config';
import ASK from './prompts';
import fn from './fn';


import { BitcoinNetwork, BitcoinWallet } from './types';


const bip32 = BIP32Factory(ecc);
bitcoin.initEccLib(ecc);





/**
 * Ask for a string
 */
export const askForBitcoinNetwork = async function (message_: string = "Select Bitcoin Network"): Promise<BitcoinNetwork> {
  const response = await prompts({
    type: 'select',
    name: 'network',
    message: message_,
    choices: [
      { title: 'Bitcoin', value: 'bitcoin' },
      { title: 'Testnet', value: 'testnet' },
      { title: 'Regtest', value: 'regtest' },
    ]
  });

  switch (response.network) {
    case 'bitcoin':
      return {
        name: 'main',
        network: bitcoin.networks.bitcoin
      };
    case 'testnet':
      return {
        name: 'testnet',
        network: bitcoin.networks.testnet
      };
    case 'regtest':
      return {
        name: 'regtest',
        network: bitcoin.networks.regtest
      };
  }
}



export const deriveWallets = async function (amount_: number = undefined, network_: BitcoinNetwork = undefined): Promise<BitcoinWallet[]> {
  const wallets: BitcoinWallet[] = [];

  fn.hi('Derive Bitcoin Wallet Accounts');

  const MNEMONIC = CONFIG['MNEMONIC'];

  const WORDS = MNEMONIC.split(' ');
  if (12 !== WORDS.length) {
    console.log('INVALID MNEMONIC')
    process.exit(0);
  }

  const VALID = bip39.validateMnemonic(MNEMONIC);
  if (!VALID) {
    console.log('INVALID MNEMONIC')
    process.exit(0);
  }

  const network = network_ || await askForBitcoinNetwork();

  if (!await ASK.askForConfirm(`Mnemonic: ${WORDS.slice(0, 2).join(' ')} ... ${WORDS.slice(-2).join(' ')}`)) {
    console.log('ABANDEND MNEMONIC')
    process.exit(0);
  }

  const passphrase = await ASK.askForPassphrase();
  const seed = await bip39.mnemonicToSeed(MNEMONIC, passphrase);
  const root: BIP32Interface = bip32.fromSeed(seed);

  const accountIndexStart = await ASK.askForNumber('Account#_', '0');
  const amount = amount_ || await ASK.askForNumber('How many accounts would you like to derive', '20');

  for (let i = 0; i < amount; i++) {
    const index = accountIndexStart + i;

    const path = `m/86'/0'/0'/0/${index}`;
    const keyPair = root.derivePath(path);

    const publicKey = keyPair.publicKey;
    const publicKeyXOnly = toXOnly(publicKey);

    const p2pkh: Payment = bitcoin.payments.p2pkh({ pubkey: publicKey, network: network.network });
    const p2wpkh: Payment = bitcoin.payments.p2wpkh({ pubkey: publicKey, network: network.network });
    const p2sh: Payment = bitcoin.payments.p2sh({ redeem: p2wpkh, network: network.network });
    const p2tr: Payment = bitcoin.payments.p2tr({ internalPubkey: publicKeyXOnly, network: network.network });

    const p2trSigner = keyPair.tweak(
      bitcoin.crypto.taggedHash('TapTweak', publicKeyXOnly),
    );

    wallets.push({
      path: path,
      keyPair: keyPair,
      p2pkh: p2pkh,
      p2wpkh: p2wpkh,
      p2sh: p2sh,
      p2tr: p2tr,
      p2trInternalKey: publicKeyXOnly,
      p2trSigner: p2trSigner,
    });
  }

  if (0 < wallets.length) {
    return wallets;
  }

  console.log('');
  process.exit(0);
}

export default {
  deriveWallets: deriveWallets,
  askForBitcoinNetwork: askForBitcoinNetwork,
}
