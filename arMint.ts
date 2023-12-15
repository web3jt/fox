import fn, { getArWallets } from './utils/fn';
import prompts from './utils/prompts';
import CONFIG from './utils/config';

const arweave = fn.arweave;

const TARGET = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

async function main() {
  const content = CONFIG.ARWEAVE.INSCRIPTION_DATA;

  const wallets = await getArWallets(1);
  const wallet = wallets?.[0];

  const key = wallet.key;
  const address = wallet.address;
  const balance = await arweave.wallets.getBalance(wallet.address);

  const text: String[] = [address];
  if (undefined !== balance) text.push(`${balance}`);
  console.log(text.join(' :: '));


  const amount = await prompts.askForNumber('How much txs do you want to mint');

  for (let i = 0; i < amount; i++) {
    const tx = await arweave.createTransaction({
      target: TARGET,
      quantity: arweave.ar.arToWinston('0'),
      data: content,
    }, key);
    tx.addTag('Content-Type', 'application/json');
    await arweave.transactions.sign(tx, key);

    const response = await arweave.transactions.post(tx);
    if (200 !== response.status) {
      console.log('Error when posting tx');
      return;
    }
    console.log(i, tx.id);
  }

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
