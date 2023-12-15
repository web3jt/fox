import fn from './utils/fn';
import fs from 'fs';

async function main() {
  const f = 'bulkPRC20Miner.sh';

  const wallets = await fn.deriveWallets(0);
  console.log('');

  const text: String[] = [];
  for (const wallet of wallets) {
    for (let i = 0; i < 10; i++) text.push(`./PRC20Miner -privateKey ${wallet.privateKey.slice(2)} --contractAddress 0x75588190d570fBC74E36711D6668b1f9313D5fe8 -workerCount 8`);
  }

  fs.writeFileSync(f, text.join('\n'));

  console.log(`${f} created!`);
  console.log('Copy it to the miners\' folder and use `bash run.sh` to start a bulk mint...');
  console.log('');
}

main();
