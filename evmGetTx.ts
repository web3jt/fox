import { ethers } from 'ethers';
import fn from './utils/fn';
import prompts from './utils/prompts';

async function main() {
  const provider: ethers.JsonRpcProvider = await fn.getProvider();
  const txHash = await prompts.askForString('Enter tx hash:');
  const tx = await provider.getTransaction(txHash);
  console.log(tx);
}

main();
