import { arweave, getArWallets } from './utils/ar';
import prompts from './utils/prompts';
import CONFIG from './utils/config';




async function main() {
  const receipient = await prompts.askForString('Receipient address');
  const amt = await prompts.askForNumber('Amount to send');

  const JSON_MINT = { "p": CONFIG.ARWEAVE.INSCRIPTION_PROTOCOL, "op": "transfer", "tick": CONFIG.ARWEAVE.INSCRIPTION_TICK, "amt": amt.toString(), "to": receipient };
  const JSON_MINT_STRING = JSON.stringify(JSON_MINT);

  console.log(JSON_MINT_STRING);

  const wallets = await getArWallets(1);
  const wallet = wallets?.[0];

  if (!wallet) {
    console.log('Failed to get wallet');
    return;
  }

  const key = wallet.key;
  const address = wallet.address;
  const balance = await arweave.wallets.getBalance(wallet.address);

  const text: String[] = [address];
  if (undefined !== balance) text.push(`${balance}`);
  console.log(text.join(' :: '));


  const tx = await arweave.createTransaction({
    target: CONFIG.ARWEAVE.INSCRIPTION_TARGET,
    quantity: arweave.ar.arToWinston('0'),
    data: JSON_MINT_STRING,
  }, key);
  tx.addTag('Content-Type', 'application/json');
  await arweave.transactions.sign(tx, key);

  const response = await arweave.transactions.post(tx);
  if (200 !== response.status) {
    console.log('Error when posting tx');
    return;
  }
  console.log(tx.id);

  console.log();
  /**
   * big tx, upload it
   */
  // let uploader = await arweave.transactions.getUploader(tx);
  // while (!uploader.isComplete) {
  //   await uploader.uploadChunk();
  //   console.log(`${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`);
  // }
  // console.log(tx.id);
}

main();
