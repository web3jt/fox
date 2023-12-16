import { arweave, getArWallets } from './utils/ar';
import prompts from './utils/prompts';
import CONFIG from './utils/config';


const TARGET = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

const JSON_MINT = { "p": "prc-20", "op": "mint", "tick": CONFIG.ARWEAVE.INSCRIPTION_TICK, "amt": "1000" };
const JSON_MINT_STRING = JSON.stringify(JSON_MINT);

async function main() {
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
      data: JSON_MINT_STRING,
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
