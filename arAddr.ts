import fn, { getArWallets } from './utils/fn';
import prompts from './utils/prompts';
import CONFIG from './utils/config';
import * as qrcode from 'qrcode-terminal';

const arweave = fn.arweave;

async function main() {
  const wallets = await getArWallets();

  const queryBalance = await prompts.askForConfirm('Query balance?');
  const showQrCode = await prompts.askForConfirm('Show QR code?');

  for (const wallet of wallets) {
    const address = wallet.address;
    const balance = queryBalance ? await arweave.wallets.getBalance(wallet.address) : undefined;

    const text: String[] = [address];
    if (undefined !== balance) text.push(`${balance}`);

    console.log(text.join(' :: '));

    if (showQrCode) qrcode.generate(wallet.address, { small: true });
  }
}

main();
