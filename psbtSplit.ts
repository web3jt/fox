import * as ecc from 'tiny-secp256k1';
import * as bitcoin from 'bitcoinjs-lib';
import bit from './utils/bitcoin';
import ask from './utils/prompts';

bitcoin.initEccLib(ecc);


const FEE_RATE = 20;



async function main() {
  const network = await bit.askForBitcoinNetwork();
  const wallets = await bit.deriveWallets(2, network);
  const wallet1 = wallets[0];
  const wallet2 = wallets[1];

  console.log();
  console.log(`            path:`, wallet1.path);
  console.log('p2sh   (P2SH)   :', wallet1.p2sh.address);
  console.log('p2tr   (Taproot):', wallet1.p2tr.address);

  console.log(`            path:`, wallet2.path);
  console.log('p2sh   (P2SH)   :', wallet2.p2sh.address);
  console.log('p2tr   (Taproot):', wallet2.p2tr.address);


  const utxos1 = await bit.getUTXOs(wallet1.p2tr.address, network, {
    // confirmedOnly: true,
    // minValue: 100000000,
  });
  console.log(`\n\nutxos1:`);
  console.log(utxos1);

  // const utxos2 = await bit.getUTXOs(wallet2.p2tr.address, network, {
  //   // confirmedOnly: true,
  //   // minValue: 100000000,
  // });
  // console.log(`\n\nutxos2:`);
  // console.log(utxos2);

  const utxo = utxos1[0];

  const psbt = new bitcoin.Psbt({ network: network });

  psbt.addInput({
    hash: utxo.tx,
    index: utxo.index,
    witnessUtxo: {
      script: wallet1.p2tr.output!,
      value: utxo.value,
    },
    tapInternalKey: wallet1.p2trInternalKey,
  });

  // output to wallet2
  psbt.addOutput({
    address: wallet2.p2tr.address,
    value: 10000,
    tapInternalKey: wallet2.p2trInternalKey,
  });

  psbt.addOutput({
    address: wallet2.p2tr.address,
    value: 20000,
    tapInternalKey: wallet2.p2trInternalKey,
  });


  /**
   * estimate size, fee
   */
  const psbtForEstimate = psbt.clone();
  psbtForEstimate.addOutput({
    address: wallet1.p2tr.address,
    value: utxo.value - 30000,
    tapInternalKey: wallet1.p2trInternalKey,
  });
  psbtForEstimate.signInput(0, wallet1.p2trSigner);
  psbtForEstimate.finalizeAllInputs();
  const estTxHex = psbtForEstimate.extractTransaction(true).toHex();
  const estTxSize = estTxHex.length / 2;

  console.log('---------');
  console.log(`estimated size: ${estTxSize}`);
  console.log('---------');


  /**
   * add output for chang output
   */
  psbt.addOutput({
    address: wallet1.p2tr.address,
    value: utxo.value - 30000 - estTxSize * FEE_RATE,
    tapInternalKey: wallet1.p2trInternalKey,
  });

  psbt.signInput(0, wallet1.p2trSigner);
  psbt.finalizeAllInputs();

  // verify psbt

  const finalTx = psbt.extractTransaction(true);
  const finalTxHex = finalTx.toHex();
  const finalTxSize = finalTxHex.length / 2;
  const finalTxId = finalTx.getId();

  console.log(`final size: ${finalTxSize}\n`);
  console.log('finalTxId:', finalTxId);
  console.log('finalTx:', finalTxHex);
}

main();
