// import axios from 'axios';
import * as bitcoin from 'bitcoinjs-lib';
import ask4bit from './utils/interact-bitcoin';

const MARKER = Buffer.from('ord');
const MIMETYPE = Buffer.from('text/plain;charset=utf-8');
const DATA = Buffer.from('Hello World');

async function main() {
  const network = await ask4bit.askForBitcoinNetwork();
  const wallets = await ask4bit.deriveWallets(1, network);
  const wallet = wallets[0];

  console.log();
  console.log(`            path:`, wallet.path);
  console.log(`p2tr   (Taproot):`, wallet.p2tr.address);
  console.log(`  taproot output:`, wallet.p2tr.output.toString('hex'));


  // const script = [
  //   wallet.p2trInternalKey.toString('hex'),
  //   'OP_CHECKSIG',
  //   'OP_0',
  //   'OP_IF',
  //   MARKER.toString('hex'),
  //   '01',
  //   MIMETYPE.toString('hex'),
  //   'OP_0',
  //   DATA.toString('hex'), // ? splitByNChars(hexData, 1040).join(" ")
  //   'OP_ENDIF'
  // ];

  // let inscribeLockScript = bitcoin.script.fromASM(script.join(' '));

  // console.log('inscribeLockScript:', inscribeLockScript.toString('hex'));

  // const scriptTree = {
  //   output: inscribeLockScript,
  // };

  // const inscribeLockRedeem = {
  //   output: inscribeLockScript,
  //   redeemVersion: 192,
  // };

  // const inscribeP2tr = bitcoin.payments.p2tr({
  //   internalPubkey: wallet.p2trInternalKey,
  //   scriptTree,
  //   network: network,
  //   redeem: inscribeLockRedeem,
  // });

  // console.log('inscribeP2tr address:', inscribeP2tr.address);
  // console.log('inscribeP2tr output:', inscribeP2tr.output);
  // console.log('inscribeP2tr witness:', inscribeP2tr.witness);


  // const tapLeafScript = {
  //   leafVersion: inscribeLockRedeem.redeemVersion!,
  //   script: inscribeLockRedeem.output || Buffer.from(""),
  //   controlBlock: inscribeP2tr.witness![inscribeP2tr.witness!.length - 1],
  // };

  const psbt = new bitcoin.Psbt({ network: network });
  psbt.setVersion(2);
  psbt.setLocktime(0);


  /**
   * add input
   */
  psbt.addInput({
    hash: '20fde13f462cd7821d427623e9f159323a604d02812b6a08118bb1532c179240', // txid
    index: 0, // vout
    witnessUtxo: {
      script: wallet.p2tr.output,
      // script: inscribeP2tr.output!,
      value: 300000000,
    },
    tapInternalKey: wallet.p2trInternalKey,
    // tapLeafScript: [tapLeafScript],
  });


  /**
   * add output, to
   */
  psbt.addOutput({
    address: 'bcrt1p36ppnde4rn2cyavsd0vlqqkkgu6yxtpdmgp8xj9r8cgreylnryjshc9qwh',
    // script: p2trOutput.output,
    value: 10000000,
  });
  // psbt.addOutput({
  //   address: 'bcrt1p36ppnde4rn2cyavsd0vlqqkkgu6yxtpdmgp8xj9r8cgreylnryjshc9qwh',
  //   // script: p2trOutput.output,
  //   value: 10000000,
  // });
  // psbt.addOutput({
  //   address: 'bcrt1p36ppnde4rn2cyavsd0vlqqkkgu6yxtpdmgp8xj9r8cgreylnryjshc9qwh',
  //   // script: p2trOutput.output,
  //   value: 10000000,
  // });


  /**
   * estimate size
   */
  const estPsbt = psbt.clone();

  estPsbt.addOutput({
    address: 'bcrt1phhwlknpnauxgzs59pdempdn2ccc4l73yj98ckgyn2af6rw6wcehs7tcyzg',
    value: 10000000,
  });


  estPsbt.signAllInputs(wallet.p2trSigner);


  estPsbt.finalizeAllInputs();
  const estTxHex = estPsbt.extractTransaction(true).toHex();

  const estTxSize = estTxHex.length / 2;

  console.log(`\nestimated size: ${estTxSize}\n`);


  /**
   * add output, change
   */
  psbt.addOutput({
    address: 'bcrt1phhwlknpnauxgzs59pdempdn2ccc4l73yj98ckgyn2af6rw6wcehs7tcyzg',
    value: 300000000 - 10000000 * 3 - estTxSize * 20,
  });



  psbt.signAllInputs(wallet.p2trSigner);
  psbt.finalizeAllInputs();

  const finalTx = psbt.extractTransaction(true);

  const finalTxHex = finalTx.toHex();

  console.log(finalTxHex);

  const finalTxSize = finalTxHex.length / 2;
  console.log(`\n    final size: ${finalTxSize}\n`);
}

main();

