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
  const WORDS = CONFIG['MNEMONIC'].split(' ');
  if (12 !== WORDS.length) return;

  const mnemonic = `${WORDS.slice(0, 2).join(' ')} ... ${WORDS.slice(-2).join(' ')}`;
  if (!await prompts.askForConfirm(`Mnemonic: ${mnemonic}`)) return;

  const passphrase = await prompts.askForPassphrase();
  const seed = await bip39.mnemonicToSeed(CONFIG['MNEMONIC'], passphrase);
  const root = bip32.fromSeed(seed);

  for (let i = 0; i < 3; i++) {
    console.log(`\n--- ${i} ---`);
    const path = `m/86'/0'/0'/${i}/0`;
    const keyPair = root.derivePath(path);

    const wif = keyPair.toWIF();
    const publicKey = keyPair.publicKey;
    const publicKeyXOnly = toXOnly(publicKey);

    const p2pkh = bitcoin.payments.p2pkh({ pubkey: publicKey });
    const p2wpkh = bitcoin.payments.p2wpkh({ pubkey: publicKey });
    const p2sh = bitcoin.payments.p2sh({ redeem: p2wpkh });
    const p2tr = bitcoin.payments.p2tr({ internalPubkey: publicKeyXOnly });

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
