import { ethers } from 'ethers';
import fn from './utils/fn';
import prompts from './utils/prompts';
import CONFIG from './utils/config';


const string2hex = (str: string = ''): string => {
  const res = [];
  const { length } = str;
  for (let n = 0, l = length; n < l; n++) {
    const hex = Number(str.charCodeAt(n)).toString(16);
    res.push(hex);
  };
  return `0x${res.join('')}`;
}


async function main() {
  const INSCRIPTION_DATA = CONFIG.EVM.INSCRIPTION_DATA || await prompts.askForString('Inscription Data');
  const hexData = string2hex(INSCRIPTION_DATA);

  console.log('');
  console.log('DATA:', INSCRIPTION_DATA);
  console.log(' HEX:', hexData);
  console.log('');

  const PROVIDER: ethers.JsonRpcProvider = await fn.getProvider();
  const wallets = await fn.deriveWallets(1);
  const wallet = wallets[0];
  const walletWithProvider = wallet.connect(PROVIDER);
  const balance = await PROVIDER.getBalance(wallet.address);
  const nonce = await PROVIDER.getTransactionCount(wallet.address);

  console.log('');
  console.log(`${wallet.address}: ${ethers.formatUnits(balance, 'ether')}E - #${nonce}`);

  const preTx = {
    to: wallet.address,
    value: ethers.parseEther("0"),
    data: hexData,
  }

  const gasLimit = await PROVIDER.estimateGas(preTx);

  console.log("Gas Limit:", gasLimit);


  // console.log('');
  // console.log('');

  let overrides = await fn.getOverridesByAskGas(preTx);


  let n: number = nonce;
  for (let i = 0; i < 3; i++) {
    const tx = await walletWithProvider.sendTransaction({
      ...overrides,
      nonce: n,
    });

    console.log(n, tx.hash);

    n++;
  }
}

main();
