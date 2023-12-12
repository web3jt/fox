// import axios from 'axios';
import * as bitcoin from 'bitcoinjs-lib';
import fn from './utils/fn';

async function main() {

  const wallets = await fn.deriveBitcoinWallets(1);
  const wallet = wallets[0];

  const network = fn.getBitcoinNetwork();

  console.log();
  console.log(`            path:`, wallet.path);
  console.log(`p2tr   (Taproot):`, wallet.p2tr.address);
  console.log(`  taproot output:`, wallet.p2tr.output.toString('hex'));

  const psbt = new bitcoin.Psbt({ network: network });
  // psbt.setVersion(2);
  // psbt.setLocktime(0);


  /**
   * add input
   */
  psbt.addInput({
    hash: 'e85e201c8978366f5eba8aa656fe369d5549757e3570942a928991481886d56d', // txid
    index: 0, // vout
    witnessUtxo: {
      script: wallet.p2tr.output,
      value: 100000000,
    },
    tapInternalKey: wallet.p2trInternalKey,
  });


  /**
   * add output
   */
  psbt.addOutput({
    address: 'bcrt1p40lhrhc4eyn6jeg4gn79a8tffgt2hfjnz47pcptnjz0adq34rygsaas53q',
    value: 50000000,
  });


  /**
   * estimate size
   */
  const estPsbt = psbt.clone();

  estPsbt.addOutput({
    address: '2Mzcy5ZdudzLqXf7pSPm7NbmgRsiL6FwWxg',
    value: 100000000 - 50000000,
  });

  estPsbt.signInput(0, wallet.p2trSigner);
  estPsbt.finalizeAllInputs();
  const estTxHex = estPsbt.extractTransaction(true).toHex();

  const estTxSize = estTxHex.length / 2;

  console.log(`\nestimated size: ${estTxSize}\n`);





  /**
   * add output
   */
  psbt.addOutput({
    address: '2Mzcy5ZdudzLqXf7pSPm7NbmgRsiL6FwWxg',
    value: 50000000 - estTxSize * 20,
  });


  psbt.signInput(0, wallet.p2trSigner);
  psbt.finalizeAllInputs();

  const finalTx = psbt.extractTransaction(true);

  const finalTxHex = finalTx.toHex();

  console.log(finalTxHex);

  const finalTxSize = finalTxHex.length / 2;

  console.log(`\nfinal size: ${finalTxSize}\n`);

  const fee = psbt.getFee();
  const feeRate = psbt.getFeeRate();

  console.log(`fee: ${fee}`);
  console.log(`fee rate: ${feeRate}`);
}

main();


