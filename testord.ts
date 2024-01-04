import * as ecc from 'tiny-secp256k1';
import * as bitcoin from 'bitcoinjs-lib';
import { Buff, Bytes } from '@cmdcode/buff';
import { util } from '@cmdcode/crypto-tools';
import { Address, Signer, Tap, Tx } from '@cmdcode/tapscript';
import ask4bit from './utils/interact-bitcoin';
import ASK from './utils/prompts';


import { keys } from '@cmdcode/crypto-tools';

bitcoin.initEccLib(ecc);

// const { Buff, Bytes } = require('@cmdcode/buff')

const ec = new TextEncoder();
const dc = new TextDecoder();

const bytesToHex = function (uint8Array_: Uint8Array): string {
  const hexArray = Array.from(uint8Array_).map((byte) => byte.toString(16).padStart(2, '0'));
  return hexArray.join('');
}

const bufferToUint8Array = function (buffer_: Buffer): Uint8Array {
  return new Uint8Array(buffer_.buffer, buffer_.byteOffset, buffer_.byteLength);
}


const MARKER = Buffer.from('ord');
const MIMETYPE = Buffer.from('text/plain;charset=utf-8');
const DATA = Buffer.from('Hello World');


async function main() {
  const network = await ask4bit.askForBitcoinNetwork();
  const wallets = await ask4bit.deriveWallets(1, network);
  const wallet = wallets[0];

  console.log();
  console.log(`            path:`, wallet.path);
  console.log('p2pkh  (Legacy) :', wallet.p2pkh.address);
  console.log('p2wpkh (SegWit) :', wallet.p2wpkh.address);
  console.log('p2sh   (P2SH)   :', wallet.p2sh.address);
  console.log('p2tr   (Taproot):', wallet.p2tr.address);


  const psbt = new bitcoin.Psbt({ network: network });

  const hexData = DATA.toString("hex");
  const publicKeyHex = wallet.p2trInternalKey.toString("hex");

  console.log('hexData:', hexData);
  console.log('publicKeyHex:', publicKeyHex);

  const script = [
    wallet.p2trInternalKey.toString('hex'),
    'OP_CHECKSIG',
    'OP_0',
    'OP_IF',
    MARKER.toString('hex'),
    '01',
    MIMETYPE.toString('hex'),
    'OP_0',
    DATA.toString('hex'), // ? splitByNChars(hexData, 1040).join(" ")
    'OP_ENDIF'
  ];

  console.log('script:', script);

  let inscribeLockScript = bitcoin.script.fromASM(script.join(' '));

  const scriptTree = {
    output: inscribeLockScript,
  };

  const inscribeLockRedeem = {
    output: inscribeLockScript,
    redeemVersion: 192,
  };

  const inscribeP2tr = bitcoin.payments.p2tr({
    internalPubkey: wallet.p2trInternalKey,
    scriptTree,
    network: network,
    redeem: inscribeLockRedeem,
  });

  const tapLeafScript = {
    leafVersion: inscribeLockRedeem.redeemVersion!,
    script: inscribeLockRedeem.output || Buffer.from(""),
    controlBlock: inscribeP2tr.witness![inscribeP2tr.witness!.length - 1],
  };

  psbt.addInput({
    hash: '20fde13f462cd7821d427623e9f159323a604d02812b6a08118bb1532c179240',
    index: 0,
    witnessUtxo: {
      script: inscribeP2tr.output!,
      value: 300000000,
    },
    tapInternalKey: wallet.p2trInternalKey,
    tapLeafScript: [tapLeafScript],
  });

  psbt.addOutput({
    address: 'bcrt1phhwlknpnauxgzs59pdempdn2ccc4l73yj98ckgyn2af6rw6wcehs7tcyzg',
    value: 299000000,
  });


  psbt.signInput(0, wallet.p2trSigner);

  psbt.finalizeAllInputs();

  const finalTx = psbt.extractTransaction(true);

  const finalTxHex = finalTx.toHex();

  console.log(finalTxHex);

  const finalTxSize = finalTxHex.length / 2;
  console.log(`\n    final size: ${finalTxSize}\n`);

  // let inscribeLockScript = bitcoin.script.fromASM(
  //   `${publicKeyHex} OP_CHECKSIG OP_0 OP_IF ${Buffer.from("ord").toString(
  //     "hex"
  //   )} OP_1 ${Buffer.from("text/plain;charset=utf-8").toString(
  //     "hex"
  //   )} OP_0 ${splitByNChars(hexData, 1040).join(" ")} OP_ENDIF`
  // );
  // inscribeLockScript = Buffer.from(
  //   inscribeLockScript.toString("hex").replace("6f726451", "6f72640101"),
  //   "hex"
  // );

  // const scriptTree: Taptree = {
  //   output: inscribeLockScript,
  // };

  // console.log();
  // console.log();
  // console.log();
  // console.log(wallet.keyPair.privateKey);
  // // console.log(wallet.p2trInternalKey.toString('hex'));

  // const seckey = keys.get_seckey(wallet.keyPair.privateKey.toString('hex'));

  // console.log('seckey:', bytesToHex(seckey));

  // const pubkey = bufferToUint8Array(wallet.p2trInternalKey);

  // console.log('pubkey:', bytesToHex(pubkey));


  // const marker = ec.encode(MARKET);
  // const mimetype = ec.encode(MIMETYPE);
  // const data = ec.encode(DATA);

  // console.log('marker:', bytesToHex(marker));
  // console.log('mimetype:', bytesToHex(mimetype));
  // console.log('data:', bytesToHex(data));

  // const script = [pubkey, 'OP_CHECKSIG', 'OP_0', 'OP_IF', marker, '01', mimetype, 'OP_0', data, 'OP_ENDIF'];

  // const tapleaf = Tap.encodeScript(script);

  // console.log('tapleaf:', tapleaf);

  // const [tpubkey, cblock] = Tap.getPubKey(pubkey, { target: tapleaf });

  // console.log('tpubkey:', tpubkey);
  // console.log('cblock:', cblock);

  // const address = Address.p2tr.fromPubKey(tpubkey, 'regtest');

  // console.log('address:', address);


  // const txdata = Tx.create({
  //   vin: [{
  //     txid: '9e71476b2af0cbb5435f4a10f95400ea7738d90ba61a3072e6797ee5e5aaae20',
  //     vout: 0,
  //     prevout: {
  //       value: 300_000_000,
  //       scriptPubKey: ['OP_1', tpubkey]
  //     },
  //   }],
  //   vout: [{
  //     // We are leaving behind 1000 sats as a fee to the miners.
  //     value: 299_999_000,
  //     // This is the new script that we are locking our funds to.
  //     scriptPubKey: Address.toScriptPubKey('bcrt1q6zpf4gefu4ckuud3pjch563nm7x27u4ruahz3y'),
  //   }]
  // });

  // const sig = Signer.taproot.sign(seckey, txdata, 0, { extension: tapleaf });

  // txdata.vin[0].witness = [sig, script, cblock];

  // console.dir(txdata, { depth: null });

  // const isValid = Signer.taproot.verify(txdata, 0, { pubkey, throws: true });

  // console.log('tx hex:', Tx.encode(txdata).hex);

  // console.log('\n\nisValid:', isValid);
}

main();
