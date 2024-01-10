import axios from 'axios';
import prompts from 'prompts';
import * as ecc from 'tiny-secp256k1';
import * as bitcoin from 'bitcoinjs-lib';
import { Payment } from 'bitcoinjs-lib';
import { toXOnly } from 'bitcoinjs-lib/src/psbt/bip371';
import * as bip39 from 'bip39';
import BIP32Factory, { BIP32Interface } from 'bip32';
import { Networks as BitcoinNetworks } from "@cmdcode/tapscript";
import { Buff } from "@cmdcode/buff-utils";
import { Address, Signer, Networks, Tap, Tx } from '@cmdcode/tapscript';

import CONFIG from './config';
import ASK from './prompts';
import fn from './fn';


import { BitcoinWallet, UTXO } from './types';


const bip32 = BIP32Factory(ecc);
bitcoin.initEccLib(ecc);

export const ELECTRS_API_BASE_URL = {
  BITCOIN: CONFIG.ELECTRS_API_BASE_URL?.BITCOIN || 'https://blockstream.info/api',
  TESTNET: CONFIG.ELECTRS_API_BASE_URL?.TESTNET || 'https://blockstream.info/testnet/api',
  REGTEST: CONFIG.ELECTRS_API_BASE_URL?.REGTEST || 'http://127.0.0.1:3000',
}

export const BUFFER_MARKER = Buffer.from('ord', 'utf8');
export const BUFFER_MIMETYPE_TEXT = Buffer.from('text/plain;charset=utf-8', 'utf8');
export const BUFFER_MIMETYPE_TEXT_SHORT = Buffer.from('text/plain', 'utf8');

export const BUFFER_MIMETYPE = {
  TEXT: Buffer.from('text/plain;charset=utf-8', 'utf8'),
  TEXT_SHORT: Buffer.from('text/plain', 'utf8'),
}


/**
 * Ask for a string
 */
export const askForBitcoinNetwork = async function (message_: string = "Select Bitcoin Network"): Promise<bitcoin.networks.Network> {
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
      return bitcoin.networks.bitcoin;
    case 'testnet':
      return bitcoin.networks.testnet;
    case 'regtest':
      return bitcoin.networks.regtest;
  }
}


export const getNetworkTitle = function (network_: bitcoin.networks.Network): BitcoinNetworks {
  switch (network_) {
    case bitcoin.networks.bitcoin:
      return 'main';
    case bitcoin.networks.testnet:
      return 'testnet';
    case bitcoin.networks.regtest:
      return 'regtest';
    default:
      throw new Error('Invalid Bitcoin Network');
  }
}


export const deriveWallets = async function (amount_: number = undefined, network_: bitcoin.networks.Network = undefined): Promise<BitcoinWallet[]> {
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

function initInscribeGroup(
  pubkey_: Buff,
  network_: bitcoin.networks.Network,
) {
  const networkName = getNetworkTitle(network_);

  const initScript = [pubkey_, "OP_CHECKSIG"];
  const initTapleaf = Tap.encodeScript(initScript);
  const [initTPubkey, initCBlock] = Tap.getPubKey(pubkey_, { target: initTapleaf });
  const initAddress = Address.p2tr.fromPubKey(initTPubkey, networkName);
  return { initScript, initTapleaf, initTPubkey, initCBlock, initAddress };
}


function textInscribeGroup(
  pubkey_: Buff,
  text_: String,
  network_: bitcoin.networks.Network,
  mimetype_: Buffer = BUFFER_MIMETYPE.TEXT_SHORT,
) {
  const networkName = getNetworkTitle(network_);
  const bufferText = Buffer.from(text_, 'utf8');

  const inscriptionScript = [
    pubkey_,
    "OP_CHECKSIG",
    "OP_0",
    "OP_IF",
    BUFFER_MARKER,
    "01",
    mimetype_,
    "OP_0",
    bufferText,
    "OP_ENDIF",
  ];

  const inscriptionTapleaf = Tap.encodeScript(inscriptionScript);
  const [inscriptionTPubkey, inscriptionCBlock] = Tap.getPubKey(pubkey_, { target: inscriptionTapleaf });
  const inscriptionAddress = Address.p2tr.fromPubKey(inscriptionTPubkey, networkName);
  return { inscriptionScript, inscriptionTapleaf, inscriptionTPubkey, inscriptionCBlock, inscriptionAddress };
}

export async function getUTXOs(
  p2trAddress_: String,
  network_: bitcoin.networks.Network,
  options_: { confirmedOnly?: boolean, minValue?: number } = { confirmedOnly: false },
): Promise<UTXO[]> {
  const apiBaseUrl = getElectrsApiBaseUrl(network_);
  const url = `${apiBaseUrl}/address/${p2trAddress_}/utxo`;

  const response = await axios.get(url);
  if (200 !== response.status) {
    throw new Error(`Failed to fetch UTXOs for ${p2trAddress_}`);
  }

  const utxos = response.data;

  const array: UTXO[] = [];
  for (const utxo of utxos) {
    if (options_.confirmedOnly && !utxo.status.confirmed) continue;
    if (options_.minValue && options_.minValue > utxo.value) continue;

    array.push({
      tx: utxo.txid,
      index: utxo.vout,
      value: utxo.value,
      confirmed: utxo.status.confirmed,
    });
  }

  // sort array by value
  array.sort((a, b) => a.value - b.value);

  return array;
}

function getElectrsApiBaseUrl(network_: bitcoin.networks.Network) {
  switch (network_) {
    case bitcoin.networks.bitcoin:
      return ELECTRS_API_BASE_URL.BITCOIN;
    case bitcoin.networks.testnet:
      return ELECTRS_API_BASE_URL.TESTNET;
    case bitcoin.networks.regtest:
      return ELECTRS_API_BASE_URL.REGTEST;
    default:
      throw new Error(`Invalid Bitcoin Network`);
  }
}

export default {
  askForBitcoinNetwork: askForBitcoinNetwork,
  getNetworkTitle: getNetworkTitle,
  deriveWallets: deriveWallets,

  initInscribeGroup: initInscribeGroup,
  textInscribeGroup: textInscribeGroup,

  getUTXOs: getUTXOs,
}
