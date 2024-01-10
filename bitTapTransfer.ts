import * as ecc from 'tiny-secp256k1';
import * as bitcoin from 'bitcoinjs-lib';
import { Address, Signer, Networks, Tap, Tx } from '@cmdcode/tapscript';
import { keys } from '@cmdcode/crypto-tools';
import bit from './utils/bitcoin';
import ask from './utils/prompts';
import { Transaction } from 'bitcoinjs-lib';

bitcoin.initEccLib(ecc);


const FEE_RATE = 20;



async function main() {
  const network = await bit.askForBitcoinNetwork();
  const networkTitle = bit.getNetworkTitle(network);

  const wallets = await bit.deriveWallets(2, network);
  const wallet1 = wallets[0];
  const wallet2 = wallets[1];

  console.log();
  console.log(`            path:`, wallet1.path);
  console.log('p2sh   (P2SH)   :', wallet1.p2sh.address);
  console.log('p2tr   (Taproot):', wallet1.p2tr.address);

  // console.log('keyPair.privateKey:\n  ', wallet1.keyPair.privateKey.toString('hex'));
  // console.log('keyPair.publicKey:\n  ', wallet1.keyPair.publicKey.toString('hex'));
  // console.log('p2trInternalKey:\n  ', wallet1.p2trInternalKey.toString('hex'));


  const privateKeyHex1 = wallet1.keyPair.privateKey.toString('hex');

  const privateKeyBuff1 = keys.get_seckey(privateKeyHex1);
  const tPublicKeyBuff1 = keys.get_pubkey(privateKeyHex1, true);



  // const tAddress = Address.p2tr.encode(tPublicKeyBuff, networkTitle);

  // console.log('privateKeyBuff:', privateKeyBuff);
  // console.log('tPublicKeyBuff:', tPublicKeyBuff);
  // console.log('tAddress:', tAddress);


  // const [tseckey] = Tap.getSecKey(privateKeyHex);
  // const [tPubkey] = Tap.getPubKey(privateKeyHex);

  // const address = Address.p2tr.encode(tPubkey, networkTitle);

  // console.log('tseckey:', tseckey);
  // console.log('tPubkey:', tPubkey);
  // console.log('address:', address);

  // return;

  console.log(`            path:`, wallet2.path);
  console.log('p2sh   (P2SH)   :', wallet2.p2sh.address);
  console.log('p2tr   (Taproot):', wallet2.p2tr.address);

  const privateKeyHex2 = wallet2.keyPair.privateKey.toString('hex');

  const privateKeyBuff2 = keys.get_seckey(privateKeyHex2);
  const tPublicKeyBuff2 = keys.get_pubkey(privateKeyHex2, true);



  const utxos1 = await bit.getUTXOs(wallet1.p2tr.address, network, {
    // confirmedOnly: true,
    // minValue: 100000000,
  });
  console.log(`\n\nutxos1:`);
  console.log(utxos1);


  const utxos2 = await bit.getUTXOs(wallet2.p2tr.address, network, {
    // confirmedOnly: true,
    // minValue: 100000000,
  });
  console.log(`\n\nutxos2:`);
  console.log(utxos2);

  const utxo1 = utxos1[0];
  const utxo2 = utxos2[0];


  const txData = Tx.create({
    vin: [
      {
        txid: utxo1.tx,
        vout: utxo1.index,
        prevout: {
          value: utxo1.value,
          scriptPubKey: ["OP_1", wallet1.p2trInternalKey],
        },
      },
      {
        txid: utxo2.tx,
        vout: utxo2.index,
        prevout: {
          value: utxo2.value,
          scriptPubKey: ["OP_1", wallet2.p2trInternalKey],
        },
      },
    ],
    vout: [
      {
        value: 10000,
        scriptPubKey: Address.toScriptPubKey(wallet1.p2tr.address),
      },
      {
        value: 20000,
        scriptPubKey: Address.toScriptPubKey(wallet2.p2tr.address),
      },
    ],
  });

  const sig1 = Signer.taproot.sign(privateKeyBuff1, txData, 0);
  const sig2 = Signer.taproot.sign(privateKeyBuff2, txData, 1);

  txData.vin[0].witness = [sig1];
  txData.vin[1].witness = [sig2];

  const isValid1 = Signer.taproot.verify(txData, 0);
  const isValid2 = Signer.taproot.verify(txData, 1);

  console.log(`\n\nisValid1: ${isValid1}`);
  console.log(`isValid2: ${isValid2}`);

  const txSize = Tx.util.getTxSize(txData);
  const txId = Tx.util.getTxid(txData);
  const txHex = Tx.encode(txData).hex;

  console.log("txSize:", txSize);
  console.log("txId:", txId);
  console.log("txHex:", txHex);





  // const psbt = new bitcoin.Psbt({ network: network });

  // psbt.addInput({
  //   hash: utxo.tx,
  //   index: utxo.index,
  //   witnessUtxo: {
  //     script: wallet1.p2tr.output!,
  //     value: utxo.value,
  //   },
  //   tapInternalKey: wallet1.p2trInternalKey,
  // });

  // // output to wallet2
  // psbt.addOutput({
  //   address: wallet2.p2tr.address,
  //   value: 10000,
  //   tapInternalKey: wallet2.p2trInternalKey,
  // });

  // psbt.addOutput({
  //   address: wallet2.p2tr.address,
  //   value: 20000,
  //   tapInternalKey: wallet2.p2trInternalKey,
  // });


  // const psbtForEstimate = psbt.clone();
  // psbtForEstimate.addOutput({
  //   address: wallet1.p2tr.address,
  //   value: utxo.value - 30000,
  //   tapInternalKey: wallet1.p2trInternalKey,
  // });
  // psbtForEstimate.signInput(0, wallet1.p2trSigner);
  // psbtForEstimate.finalizeAllInputs();
  // const estTxHex = psbtForEstimate.extractTransaction(true).toHex();
  // const estTxSize = estTxHex.length / 2;

  // console.log('---------');
  // console.log(`estimated size: ${estTxSize}`);
  // console.log('---------');


  // psbt.addOutput({
  //   address: wallet1.p2tr.address,
  //   value: utxo.value - 30000 - estTxSize * FEE_RATE,
  //   tapInternalKey: wallet1.p2trInternalKey,
  // });

  // psbt.signInput(0, wallet1.p2trSigner);
  // psbt.finalizeAllInputs();

  // // verify psbt

  // const finalTx = psbt.extractTransaction(true);
  // const finalTxHex = finalTx.toHex();
  // const finalTxSize = finalTxHex.length / 2;
  // const finalTxId = finalTx.getId();

  // console.log(`final size: ${finalTxSize}\n`);
  // console.log('finalTxId:', finalTxId);
  // console.log('finalTx:', finalTxHex);
}

main();
