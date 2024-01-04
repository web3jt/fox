import * as bitcoin from 'bitcoinjs-lib';
import ask4bit from './utils/interact-bitcoin';


async function main() {
  const network = await ask4bit.askForBitcoinNetwork();
  const wallets = await ask4bit.deriveWallets(1, network);
  const wallet = wallets[0];
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
    hash: '907921ef415bef3b3047c735037f6913e8b38d12e52e12ef87eac982f611a7fa', // txid
    index: 1, // vout
    witnessUtxo: {
      script: wallet.p2tr.output,
      value: 500000000,
    },
    tapInternalKey: wallet.p2trInternalKey,
  });


  /**
   * add output
   */
  psbt.addOutput({
    address: 'bcrt1phhwlknpnauxgzs59pdempdn2ccc4l73yj98ckgyn2af6rw6wcehs7tcyzg',
    value: 100000000,
  });


  /**
   * estimate size
   */
  const estPsbt = psbt.clone();

  estPsbt.addOutput({
    address: '2NAAGSRacmwf19TnrGEe311w6qP7hc41Uw5',
    value: 500000000 - 100000000,
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
    address: '2NAAGSRacmwf19TnrGEe311w6qP7hc41Uw5',
    value: 500000000 - 100000000 - estTxSize * 20,
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

