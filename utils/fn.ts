import { ethers } from 'ethers';
import { Payment } from 'bitcoinjs-lib';
import { toXOnly } from 'bitcoinjs-lib/src/psbt/bip371';
import CryptoJS from 'crypto-js';
import Arweave from 'arweave';
import { JWKInterface } from 'arweave/web/lib/wallet';

import fs from 'fs';
import path from 'path';
import prompts from './prompts';
import CONFIG from './config';

import * as ecc from 'tiny-secp256k1';
import * as bitcoin from 'bitcoinjs-lib';
import BIP32Factory, { BIP32Interface } from 'bip32';
import { Signer } from 'bip32/types/bip32';
import * as bip39 from 'bip39';
import { get } from 'http';


const bip32 = BIP32Factory(ecc);

bitcoin.initEccLib(ecc);


const sleep = async function (ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


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

const touchDir = function (p: string) {
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
 * AES encrypt / decrypt
 */
export const aesEncrypt = function (data: string, key: string): string {
  return CryptoJS.AES.encrypt(data, key).toString();
}

export const aesDecrypt = function (ciphertext: string, key: string): string {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (e) {
    return undefined;
  }
}



const provider = new ethers.JsonRpcProvider(CONFIG.EVM_NETWORKS[CONFIG.EVM.NETWORK]);

const getProvider = async function () {
  hi('EVM Network');
  const selected = CONFIG.EVM.NETWORK;
  const confirm = await prompts.askForConfirm(`Use ${selected} network?`);

  if (confirm) {
    return new ethers.JsonRpcProvider(CONFIG.EVM_NETWORKS[selected])
  }

  console.log('');
  process.exit(0);
}



/**
 * Get wallets from a BIP39 mnemonic
 */
const deriveWallets = async function (amount: number = 20): Promise<ethers.HDNodeWallet[]> {
  hi('Derive Wallet Accounts');

  let wallets: ethers.HDNodeWallet[] = [];

  const words = CONFIG['MNEMONIC'].split(' ');

  if (CONFIG['MNEMONIC'] && await prompts.askForConfirm(`Mnemonic: ${words.slice(0, 2).join(' ')} ... ${words.slice(-2).join(' ')}`)) {
    const passphrase = await prompts.askForPassphrase();
    const baseWallet = ethers.HDNodeWallet.fromPhrase(CONFIG['MNEMONIC'], passphrase);
    const baseAccount = baseWallet.deriveChild(0);

    if (await prompts.askForConfirm(`Wallet #0: ${baseAccount.address}`)) {
      const accountIndex = await prompts.askForNumber('Account#_', '0');
      const accountStart = baseWallet.deriveChild(accountIndex);
      if (await prompts.askForConfirm(`Account#${accountIndex}: ${accountStart.address}`)) {
        if (0 === amount) {
          amount = await prompts.askForNumber('How many accounts would you like to derive');
        }

        for (let i = accountIndex; i < accountIndex + amount; i++) {
          wallets.push(baseWallet.deriveChild(i));
        }
      }
    }
  }

  if (0 < wallets.length) {
    return wallets;
  }

  console.log('');
  process.exit(0);
}


const getBitcoinNetwork = function () {
  let network = bitcoin.networks.bitcoin;
  if (CONFIG['BITCOIN']['NETWORK'].toLowerCase() === 'testnet') {
    network = bitcoin.networks.testnet;
  } else if (CONFIG['BITCOIN']['NETWORK'].toLowerCase() === 'regtest') {
    network = bitcoin.networks.regtest;
  }
  return network;
}

const askForBitcoinNetwork = async function () {
  if (!await prompts.askForConfirm(`Network: ${CONFIG['BITCOIN']['NETWORK']}`)) process.exit(0);

  return getBitcoinNetwork();
}

interface BitcoinWallet {
  path: string,
  keyPair: BIP32Interface,
  p2pkh: Payment,
  p2wpkh: Payment,
  p2sh: Payment,
  p2tr: Payment,
  p2trInternalKey: Buffer,
  p2trSigner: Signer,
}

const deriveBitcoinWallets = async function (amount: number = 20): Promise<BitcoinWallet[]> {
  const wallets: BitcoinWallet[] = [];

  hi('Derive Bitcoin Wallet Accounts');

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

  const network = getBitcoinNetwork();

  if (!await prompts.askForConfirm(`Network: ${CONFIG['BITCOIN']['NETWORK']}`)) {
    console.log('STOPPED')
    process.exit(0);
  }

  if (!await prompts.askForConfirm(`Mnemonic: ${WORDS.slice(0, 2).join(' ')} ... ${WORDS.slice(-2).join(' ')}`)) {
    console.log('ABANDEND MNEMONIC')
    process.exit(0);
  }

  const passphrase = await prompts.askForPassphrase();
  const seed = await bip39.mnemonicToSeed(MNEMONIC, passphrase);
  const root: BIP32Interface = bip32.fromSeed(seed);

  for (let i = 0; i < amount; i++) {
    const path = `m/86'/0'/0'/0/${i}`;
    const keyPair = root.derivePath(path);

    const publicKey = keyPair.publicKey;
    const publicKeyXOnly = toXOnly(publicKey);

    const p2pkh: Payment = bitcoin.payments.p2pkh({ pubkey: publicKey, network: network });
    const p2wpkh: Payment = bitcoin.payments.p2wpkh({ pubkey: publicKey, network: network });
    const p2sh: Payment = bitcoin.payments.p2sh({ redeem: p2wpkh, network: network });
    const p2tr: Payment = bitcoin.payments.p2tr({ internalPubkey: publicKeyXOnly, network: network });

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



// /**
//  * Convert a message hash to an Ethereum Signed Message hash
//  * 
//  * @param {string} messageHash
//  * @return {string}
//  * 
//  * @see https://eips.ethereum.org/EIPS/eip-191
//  */
// function toEthSignedMessageHash(messageHash: string): string {
//   return ethers.utils.solidityKeccak256(
//     ['string', 'bytes32'],
//     ['\x19Ethereum Signed Message:\n32', messageHash]
//   );
// }




const _getArKey = async function (i_: number, passphrase_: string): Promise<JWKInterface> {
  const f = path.join(__dirname, `../arkeys/${i_}.dat`);

  if (fs.existsSync(f)) {
    const encryptedJSON = fs.readFileSync(f, 'utf8');
    const decryptedJSON = aesDecrypt(encryptedJSON, passphrase_);
    if (decryptedJSON) return JSON.parse(decryptedJSON);
    return undefined;
  }

  const key = await arweave.wallets.generate();
  const keyJSON = JSON.stringify(key);
  const encryptedKey = aesEncrypt(keyJSON, passphrase_);
  fs.writeFileSync(f, encryptedKey, 'utf8');
  return key;
}

interface ArWallet {
  key: JWKInterface,
  address: string,
}

export const getArWallets = async function (amount_: number = undefined): Promise<ArWallet[]> {
  const rlt: ArWallet[] = [];

  hi('--------- --------- generate/load Arweave wallet --------- ---------');
  const passphrase = await prompts.askForPassphrase('Please input passphrase for encrypting/decrypting Arweave wallet');
  const amount = amount_ || await prompts.askForNumber('How many wallets do you want to generate/load', '1');

  for (let i = 0; i < amount; i++) {
    const key = await _getArKey(i, passphrase);
    if (undefined === key) {
      console.log(`Failed to load key #${i} stop here...`);
      return rlt;
    }

    rlt.push({
      key: key,
      address: await arweave.wallets.jwkToAddress(key)
    });
  }

  return rlt;
}


const getGasFeeData = async function () {
  const fee = await provider.getFeeData();

  hint('Current GAS Data');
  console.log(`    Base Fee: ${ethers.formatUnits(fee.gasPrice, "gwei")} GWei`);
  if (undefined !== fee.maxPriorityFeePerGas) console.log(`Priority Fee: ${ethers.formatUnits(fee.maxPriorityFeePerGas, "gwei")} GWei`);
  if (undefined !== fee.maxFeePerGas) console.log(`     Max Fee: ${ethers.formatUnits(fee.maxFeePerGas, "gwei")} GWei`);
  console.log('');

  return fee;
}


const getOverridesByAskGas = async function (base_overrides = {}) {
  const fee = await getGasFeeData();

  const userGas = await prompts.askForGas();
  return {
    ...base_overrides,
    maxPriorityFeePerGas: userGas.priorityFee,
    maxFeePerGas: userGas.maxFee,
  }
}




const arweave = Arweave.init({
  host: CONFIG.ARWEAVE.HOST || 'arweave.net',
  port: CONFIG.ARWEAVE.PORT || 443,
  protocol: CONFIG.ARWEAVE.PROTOCOL || 'https',
});


export default {
  arweave: arweave,
  toXOnly: toXOnly,
  sleep: sleep,
  hint: hint,
  hi: hi,
  touchDir: touchDir,
  getProvider: getProvider,
  deriveWallets: deriveWallets,

  deriveBitcoinWallets: deriveBitcoinWallets,

  // toEthSignedMessageHash: toEthSignedMessageHash,

  getGasFeeData: getGasFeeData,
  getOverridesByAskGas: getOverridesByAskGas,

  getBitcoinNetwork: getBitcoinNetwork,

  askForBitcoinNetwork: askForBitcoinNetwork,
}

