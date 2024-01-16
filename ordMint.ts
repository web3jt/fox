import * as ecc from 'tiny-secp256k1';
import * as bitcoin from 'bitcoinjs-lib';
import { util } from '@cmdcode/crypto-tools';
import { Address, Signer, Networks, Tap, Tx } from '@cmdcode/tapscript';
import bit from './utils/bitcoin';
import ASK from './utils/prompts';
import { Buff } from "@cmdcode/buff-utils";

import { keys } from '@cmdcode/crypto-tools';



import { UTXO, Inscription } from './utils/types';

bitcoin.initEccLib(ecc);


const ec = new TextEncoder();
const dc = new TextDecoder();


const TEXT = `Let's fuck around...`;

const FEE_RATE = 20;
const ORDINALS_POSTAGE = 546;

const bytesToHex = function (uint8Array_: Uint8Array): string {
  const hexArray = Array.from(uint8Array_).map((byte) => byte.toString(16).padStart(2, '0'));
  return hexArray.join('');
}

// const bufferToUint8Array = function (buffer_: Buffer): Uint8Array {
//   return new Uint8Array(buffer_.buffer, buffer_.byteOffset, buffer_.byteLength);
// }

// const bufferToHex = function (buffer_: Buffer): string {
//   return bytesToHex(bufferToUint8Array(buffer_));
// }


async function main() {
  const inscription: Inscription = {
    mimetype: 'text/plain',
    data: Buffer.from(TEXT, 'utf-8'),
  }

  const txInscribeSize = bit.estTxInscribeSize(inscription, 4);
  const txTransferSize = bit.estTxTransferSize(1, 2);

  const satsInscribe = txInscribeSize * FEE_RATE + ORDINALS_POSTAGE; // fee + postage
  const satsTransfer = txTransferSize * FEE_RATE; // fee only

  console.log('txInscribeSize:', txInscribeSize);
  console.log('txTransferSize:', txTransferSize);



  const network = await bit.askForBitcoinNetwork();
  const wallets = await bit.deriveWallets(1, network);
  const wallet = wallets[0];

  console.log();
  console.log(`            path:`, wallet.path);
  console.log('p2tr   (Taproot):', wallet.p2tr.address);
  console.log();

  const privateKeyHex = wallet.keyPair.privateKey.toString('hex');
  const privateKeyBuff = keys.get_seckey(privateKeyHex);
  const tPublicKeyBuff = keys.get_pubkey(privateKeyHex, true);

  // console.log();
  // console.log('privateKey:\n  ', bytesToHex(privateKeyBuff));
  // console.log('tPublicKey:\n  ', bytesToHex(tPublicKeyBuff));

  const {
    inscriptionScript,
    inscriptionTapleaf,
    inscriptionTPubkey,
    inscriptionCBlock,
    inscriptionAddress,
  } = bit.tapInscribe(tPublicKeyBuff, inscription, network);

  // console.log('inscriptionScript:\n  ', inscriptionScript);
  // console.log('inscriptionTapleaf:\n  ', inscriptionTapleaf);
  // console.log('inscriptionTPubkey:\n  ', inscriptionTPubkey);
  // console.log('inscriptionCBlock:\n  ', inscriptionCBlock);
  // console.log('inscriptionAddress:\n  ', inscriptionAddress);


  const utxos = await bit.getUTXOs(wallet.p2tr.address, network);

  console.log('utxos:', utxos);

  const utxoTransfer = utxos[0];

  console.log('utxoTransfer:', utxoTransfer);


  const psbt = new bitcoin.Psbt({ network: network });

  psbt.addInput({
    hash: utxoTransfer.tx,
    index: utxoTransfer.index,
    witnessUtxo: {
      script: wallet.p2tr.output!,
      value: utxoTransfer.value,
    },
    tapInternalKey: wallet.p2trInternalKey,
  });

  psbt.addOutput({
    address: inscriptionAddress,
    value: satsInscribe,
    script: bitcoin.payments.p2tr({ address: inscriptionAddress, network: network }).output!,
  });

  psbt.addOutput({
    address: wallet.p2tr.address,
    value: utxoTransfer.value - satsInscribe - satsTransfer,
    tapInternalKey: wallet.p2trInternalKey,
  });

  psbt.signInput(0, wallet.p2trSigner);
  psbt.finalizeAllInputs();

  const finalTx = psbt.extractTransaction(true);
  const finalTxHex = finalTx.toHex();
  const finalTxId = finalTx.getId();

  console.log(`--------- Transfer --------- ${finalTxId}\n`);
  console.log('finalTx:', finalTxHex);

  const mempoolBaseUrl = bit.getMempoolBaseUrl(network);

  const tx1 = await bit.postTxHex(finalTxHex, network);
  console.log(`tx1: ${mempoolBaseUrl}/tx/${tx1}`);


  // console.log('keyPair.privateKey:\n  ', wallet.keyPair.privateKey.toString('hex'));
  // console.log('keyPair.publicKey:\n  ', wallet.keyPair.publicKey.toString('hex'));
  // console.log('p2trInternalKey:\n  ', wallet.p2trInternalKey.toString('hex'));

  // const {
  //   initScript,
  //   initTapleaf,
  //   initTPubkey,
  //   initCBlock,
  //   initAddress,
  // } = bit.initInscribeGroup(tPublicKeyBuff, network);

  // console.log('initScript:\n  ', initScript);
  // console.log('initTapleaf:\n  ', initTapleaf);
  // console.log('initTPubkey:\n  ', initTPubkey);
  // console.log('initCBlock:\n  ', initCBlock);
  // console.log('initAddress:\n  ', initAddress);

  const txdata = Tx.create({
    vin: [
      {
        txid: finalTxId,
        vout: 0,
        prevout: {
          value: satsInscribe,
          scriptPubKey: ["OP_1", inscriptionTPubkey],
        },
      },
    ],
    vout: [
      {
        value: ORDINALS_POSTAGE,
        scriptPubKey: Address.toScriptPubKey(wallet.p2tr.address),
      },
    ],
  });

  const sig = Signer.taproot.sign(privateKeyBuff, txdata, 0, { extension: inscriptionTapleaf })
  txdata.vin[0].witness = [sig, inscriptionScript, inscriptionCBlock]

  const txId = Tx.util.getTxid(txdata);
  const txHex = Tx.encode(txdata).hex;

  console.log(`\n--------- Inscribe --------- ${txId}\n`);
  console.log("txHex:", txHex);

  const tx2 = await bit.postTxHex(txHex, network);
  console.log(`tx2: ${mempoolBaseUrl}/tx/${tx2}`);
}

main();
