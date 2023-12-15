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

  // const tapscript = bitcoin.script.compile([
  //   bitcoin.opcodes.OP_FALSE,
  //   bitcoin.opcodes.OP_IF,

  //   // bitcoin.opcodes.OP_PUSHBYTES_32,
  //   // Buffer.from('f4c468fc308df3d669457973eea0314d0f2837496cf044f631cf772664c1b291', 'hex'),
  //   // bitcoin.opcodes.OP_CHECKSIG,
  //   // bitcoin.opcodes.OP_0,
  //   // bitcoin.opcodes.OP_IF,

  //   // bitcoin.opcodes.OP_PUSHBYTES_3,
  //   // Buffer.from('ord', 'utf8'),

  //   // bitcoin.opcodes.OP_PUSHBYTES_1,
  //   // Buffer.from('1', 'hex'),

  //   bitcoin.opcodes.OP_ENDIF,
  // ]);

  console.log(bitcoin.script.compile([
    // bitcoin.opcodes.OP_PUSHBYTES_32,
    // Buffer.from('f4c468fc308df3d669457973eea0314d0f2837496cf044f631cf772664c1b291', 'hex'),

    bitcoin.opcodes.OP_CHECKSIG,
    bitcoin.opcodes.OP_0,
    bitcoin.opcodes.OP_IF,

  ]));

  const tapscript = bitcoin.script.compile([
    bitcoin.opcodes.OP_PUSHBYTES_32,
    Buffer.from('f4c468fc308df3d669457973eea0314d0f2837496cf044f631cf772664c1b291', 'hex'),
    bitcoin.opcodes.OP_CHECKSIG,
    bitcoin.opcodes.OP_0,
    bitcoin.opcodes.OP_IF,
    bitcoin.opcodes.OP_PUSHBYTES_3,
    Buffer.from('6f7264', 'hex'),
    bitcoin.opcodes.OP_PUSHBYTES_1,
    Buffer.from('01', 'hex'),
    bitcoin.opcodes.OP_PUSHBYTES_16,
    Buffer.from('6170706c69636174696f6e2f6a736f6e', 'hex'),
    bitcoin.opcodes.OP_0,
    bitcoin.opcodes.OP_PUSHBYTES_60,
    Buffer.from('7b2270223a20224252432d313030222c20226f70223a20226d696e74222c20227469636b223a2022626f73222c2022616d74223a202231303030227d', 'hex'),
    bitcoin.opcodes.OP_ENDIF
  ]);


  console.log(`    tapscript hex:`, tapscript.toString('hex'));

  // const p2trOutput = bitcoin.payments.p2tr({
  //   redeem: { output: tapscript, network: network },
  //   network: network,
  // });




  // const psbt = new bitcoin.Psbt({ network: network });
  // // psbt.setVersion(2);
  // // psbt.setLocktime(0);


  // /**
  //  * add input
  //  */
  // psbt.addInput({
  //   hash: 'e85e201c8978366f5eba8aa656fe369d5549757e3570942a928991481886d56d', // txid
  //   index: 0, // vout
  //   witnessUtxo: {
  //     script: wallet.p2tr.output,
  //     value: 100000000,
  //   },
  //   tapInternalKey: wallet.p2trInternalKey,
  // });

  // const input0 = psbt.data.inputs[0];

  // console.log(input0);
  // console.log(input0.tapLeafScript);




  // /**
  //  * add output
  //  */
  // psbt.addOutput({
  //   address: 'bcrt1p40lhrhc4eyn6jeg4gn79a8tffgt2hfjnz47pcptnjz0adq34rygsaas53q',
  //   script: p2trOutput.output,
  //   value: 50000000,
  // });


  // /**
  //  * estimate size
  //  */
  // const estPsbt = psbt.clone();

  // estPsbt.addOutput({
  //   address: '2Mzcy5ZdudzLqXf7pSPm7NbmgRsiL6FwWxg',
  //   value: 100000000 - 50000000,
  // });

  // estPsbt.signInput(0, wallet.p2trSigner);




  // estPsbt.finalizeAllInputs();
  // const estTxHex = estPsbt.extractTransaction(true).toHex();

  // const estTxSize = estTxHex.length / 2;

  // console.log(`\nestimated size: ${estTxSize}\n`);





  // /**
  //  * add output
  //  */
  // psbt.addOutput({
  //   address: '2Mzcy5ZdudzLqXf7pSPm7NbmgRsiL6FwWxg',
  //   value: 50000000 - estTxSize * 20,
  // });


  // psbt.signInput(0, wallet.p2trSigner);
  // psbt.finalizeAllInputs();

  // const finalTx = psbt.extractTransaction(true);

  // const finalTxHex = finalTx.toHex();

  // console.log(finalTxHex);

  // const finalTxSize = finalTxHex.length / 2;
  // console.log(`\n    final size: ${finalTxSize}\n`);
}

main();

