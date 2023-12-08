import fn from './utils/fn';
import prompts from './utils/prompts';
import CONFIG from './utils/config';
import * as bitcoin from 'bitcoinjs-lib';
import * as bip39 from 'bip39';
import * as ecc from 'tiny-secp256k1';
import BIP32Factory from 'bip32';

const bip32 = BIP32Factory(ecc);

bitcoin.initEccLib(ecc);


export const toXOnly = (publicKey: Buffer) => {
  return publicKey.subarray(1, 33);
}

async function main() {
  const MNEMONIC = CONFIG['MNEMONIC'];

  const WORDS = MNEMONIC.split(' ');
  if (12 !== WORDS.length) {
    console.log('INVALID MNEMONIC')
    return;
  }

  const VALID = bip39.validateMnemonic(MNEMONIC);
  if (!VALID) {
    console.log('INVALID MNEMONIC')
    return;
  }

  let network = bitcoin.networks.bitcoin;
  if (CONFIG['BITCOIN']['NETWORK'].toLowerCase() === 'testnet') {
    network = bitcoin.networks.testnet;
  } else if (CONFIG['BITCOIN']['NETWORK'].toLowerCase() === 'regtest') {
    network = bitcoin.networks.regtest;
  }

  if (!await prompts.askForConfirm(`Network: ${CONFIG['BITCOIN']['NETWORK']}`)) {
    console.log('STOPPED')
    return;
  }

  if (!await prompts.askForConfirm(`Mnemonic: ${WORDS.slice(0, 2).join(' ')} ... ${WORDS.slice(-2).join(' ')}`)) {
    console.log('ABANDEND MNEMONIC')
    return;
  }

  const passphrase = await prompts.askForPassphrase();
  const seed = await bip39.mnemonicToSeed(MNEMONIC, passphrase);
  const root = bip32.fromSeed(seed);

  for (let i = 0; i < 3; i++) {
    console.log(`\n--- ${i} ---`);
    const path = `m/86'/0'/0'/0/${i}`;
    const keyPair = root.derivePath(path);

    const wif = keyPair.toWIF();
    const publicKey = keyPair.publicKey;
    const publicKeyXOnly = toXOnly(publicKey);

    const p2pkh = bitcoin.payments.p2pkh({ pubkey: publicKey, network: network });
    const p2wpkh = bitcoin.payments.p2wpkh({ pubkey: publicKey, network: network });
    const p2sh = bitcoin.payments.p2sh({ redeem: p2wpkh, network: network });
    const p2tr = bitcoin.payments.p2tr({ internalPubkey: publicKeyXOnly, network: network });

    console.log(`            path:`, path);
    console.log(`             WIF:`, wif);
    console.log('p2pkh  (Legacy) :', p2pkh.address);
    console.log('p2wpkh (SegWit) :', p2wpkh.address);
    console.log('p2sh   (P2SH)   :', p2sh.address);
    console.log('p2tr   (Taproot):', p2tr.address);
  }



  // const privateKey = keyPair.privateKey;
  // const publicKeyHash = bitcoin.crypto.hash160(publicKey);
  // const publicKeyHashXOnly = bitcoin.crypto.hash160(publicKeyXOnly);
  // console.log(`privateKey:`, privateKey.toString('hex'));
  // console.log(`publicKey:`, publicKey.toString('hex'));
  // console.log(`publicKeyXOnly:`, publicKeyXOnly.toString('hex'));
  // console.log(`publicKeyHash:`, publicKeyHash.toString('hex'));
  // console.log(`publicKeyHashXOnly:`, publicKeyHashXOnly.toString('hex'));
  console.log(`\n`);
}

main();
