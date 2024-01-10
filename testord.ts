import * as ecc from 'tiny-secp256k1';
import * as bitcoin from 'bitcoinjs-lib';
import { Buff, Bytes } from '@cmdcode/buff';
import { util } from '@cmdcode/crypto-tools';
import { Address, Signer, Tap, Tx } from '@cmdcode/tapscript';
import ask4bit from './utils/bitcoin';
import ASK from './utils/prompts';


import { keys } from '@cmdcode/crypto-tools';
import { bufferToString } from 'arweave/node/lib/utils';

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

const bufferToHex = function (buffer_: Buffer): string {
  return bytesToHex(bufferToUint8Array(buffer_));
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

  console.log();
  console.log('keyPair.publicKey:\n  ', wallet.keyPair.publicKey.toString('hex'));

  const hexData = DATA.toString("hex");
  const p2trInternalKeyHex = wallet.p2trInternalKey.toString("hex");

  console.log('hexData:\n  ', hexData);
  console.log('p2trInternalKeyHex:\n  ', p2trInternalKeyHex);

  const script = [
    p2trInternalKeyHex,
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

  console.log('script:\n  ', script);

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

  // console.log('inscribeP2tr:\n  ', inscribeP2tr);
  console.log('inscribeP2tr.hash:\n  ', bufferToHex(inscribeP2tr.hash));
  console.log('inscribeP2tr.address:\n  ', inscribeP2tr.address);
  console.log('inscribeP2tr.pubkey:\n  ', bufferToHex(inscribeP2tr.pubkey));
  console.log('inscribeP2tr.internalPubkey:\n  ', bufferToHex(inscribeP2tr.internalPubkey));
  // console.log('inscribeP2tr.witness:\n  ', inscribeP2tr.witness);
  // console.log('inscribeP2tr.signature:\n  ', inscribeP2tr.signature);


  const tapLeafScript = {
    leafVersion: inscribeLockRedeem.redeemVersion!,
    script: inscribeLockRedeem.output || Buffer.from(""),
    controlBlock: inscribeP2tr.witness![inscribeP2tr.witness!.length - 1],
  };

  // console.log('tapLeafScript:', tapLeafScript);

  console.log('inscribeLockScript / scriptTree.output / tapLeafScript.script:\n  ', bufferToHex(inscribeLockScript));
  console.log('tapLeafScript.controlBlock:\n  ', bufferToHex(tapLeafScript.controlBlock));

  /**
   * @cmdcode/tapscript starts here
   */
  console.log();

  const seckey = keys.get_seckey(wallet.keyPair.privateKey.toString('hex'));

  console.log('seckey:\n  ', bytesToHex(seckey));

  const pubkey = bufferToUint8Array(wallet.p2trInternalKey);

  console.log('pubkey:\n  ', bytesToHex(pubkey));

  const tapleaf = Tap.encodeScript(script);

  console.log('tapleaf:\n  ', tapleaf);

  const [tapkey, cblock] = Tap.getPubKey(pubkey, { target: tapleaf });

  console.log('tapkey:\n  ', tapkey);
  console.log('cblock:\n  ', cblock);

  const inscriptionAddress = Address.p2tr.fromPubKey(tapkey, 'regtest');

  console.log('inscriptionAddress:\n  ', inscriptionAddress);




  const psbt = new bitcoin.Psbt({ network: network });

  // 现在是少了 commit 交易
  // const address = Address.p2tr.fromPubKey(tapkey, 'regtest'); 干啥用的？
  // 和 inscribeP2tr.address 有什么区别？

  // 怎么把 tx id 放在下一步的 reveal 交易 input 里边去

  // 这里需要一个 commit 的 tx id ?
  psbt.addInput({
    hash: '20fde13f462cd7821d427623e9f159323a604d02812b6a08118bb1532c179240',
    index: 1,
    witnessUtxo: {
      script: inscribeP2tr.output!,
      value: 300000000,
    },
    // tapInternalKey: wallet.p2trInternalKey,
    tapLeafScript: [tapLeafScript],
    // tapMerkleRoot: inscribeP2tr.hash,
  });


  psbt.addOutput({
    address: 'bcrt1phhwlknpnauxgzs59pdempdn2ccc4l73yj98ckgyn2af6rw6wcehs7tcyzg',
    value: 299000000,
    tapInternalKey: wallet.p2trInternalKey,
  });


  psbt.signInput(0, wallet.p2trSigner);

  psbt.finalizeAllInputs();

  const finalTx = psbt.extractTransaction(true);

  const finalTxHex = finalTx.toHex();

  console.log(finalTxHex);

  const finalTxSize = finalTxHex.length / 2;
  console.log(`\n    final size: ${finalTxSize}\n`);

  return;










  /**
   * ???
   */
  const txdata = Tx.create({
    vin: [{
      txid: '9e71476b2af0cbb5435f4a10f95400ea7738d90ba61a3072e6797ee5e5aaae20',
      vout: 0,
      prevout: {
        value: 300_000_000,
        scriptPubKey: ['OP_1', tapkey]
      },
    }],
    vout: [{
      // We are leaving behind 1000 sats as a fee to the miners.
      value: 299_999_000,
      // This is the new script that we are locking our funds to.
      scriptPubKey: Address.toScriptPubKey('bcrt1q6zpf4gefu4ckuud3pjch563nm7x27u4ruahz3y'),
    }]
  });

  const sig = Signer.taproot.sign(seckey, txdata, 0, { extension: tapleaf });

  txdata.vin[0].witness = [sig, script, cblock];

  console.dir(txdata, { depth: null });

  const isValid = Signer.taproot.verify(txdata, 0, { pubkey, throws: true });

  console.log('tx hex:', Tx.encode(txdata).hex);

  console.log('\n\nisValid:', isValid);
}

main();
