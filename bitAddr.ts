import bit from './utils/bitcoin';
import ask from './utils/prompts';

async function main() {
  const network = await bit.askForBitcoinNetwork();

  const wallets = await bit.deriveWallets(undefined, network);
  const showWIF = await ask.askForConfirm('Show WIF?');
  const showBalance = await ask.askForConfirm('Query Balance?');

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

    console.log(`p2trInternalKey`, wallet.p2trInternalKey);


    if (showBalance) {
      const p2trUTXOs = await bit.getUTXOs(wallet.p2tr.address, network);
      const sumUTXOs = bit.countUTXOs(p2trUTXOs);
      console.log(`p2tr   (Taproot): ${wallet.p2tr.address}   ${sumUTXOs / 1e8} BTC _ ${p2trUTXOs.length} UTXOs`);
    } else {
      console.log(`p2tr   (Taproot): ${wallet.p2tr.address}`);
    }
  }

  console.log(`\n`);
}

main();
