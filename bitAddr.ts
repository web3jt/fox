import fn from './utils/fn';
import prompts from './utils/prompts';

async function main() {
  const wallets = await fn.deriveBitcoinWallets(5);
  const showWIF = await prompts.askForConfirm('Show WIF?');

  for (const wallet of wallets) {
    console.log();
    console.log(`            path:`, wallet.path);
    if (showWIF) {
      const wif = wallet.keyPair.toWIF();
      console.log(`             WIF:`, `${wif.slice(4)}   <<<   ${wif.slice(0, 4)}`);
    }
    console.log('p2pkh  (Legacy) :', wallet.p2pkh.address);
    console.log('p2wpkh (SegWit) :', wallet.p2wpkh.address);
    console.log('p2sh   (P2SH)   :', wallet.p2sh.address);
    console.log('p2tr   (Taproot):', wallet.p2tr.address);
  }

  console.log(`\n`);
}

main();
