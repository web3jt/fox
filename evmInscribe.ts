import { ethers } from 'ethers';
import fn from './utils/fn';
import prompts from './utils/prompts';
import CONFIG from './utils/config';


async function main() {
  const INSCRIPTION_DATA = CONFIG.EVM.INSCRIPTION_DATA || await prompts.askForString('Inscription Data');
  const hexData = `0x${Buffer.from(INSCRIPTION_DATA, 'utf8').toString('hex')}`

  fn.hi('EVM Inscription');
  console.log('DATA:', INSCRIPTION_DATA);
  console.log(' HEX:', hexData);
  console.log('');

  const PROVIDER: ethers.JsonRpcProvider = await fn.getProvider();
  const wallets = await fn.deriveWallets(1);
  const wallet = wallets[0];

  const balance = await PROVIDER.getBalance(wallet.address);
  if (balance === BigInt(0)) {
    console.log('Insufficient balance');
    process.exit(0);
  }

  if (!await prompts.askForConfirm(`Balance: ${ethers.formatUnits(balance, 'ether')} E`)) return;

  const _nonce = await PROVIDER.getTransactionCount(wallet.address);
  let nonce: bigint = await prompts.askForNonce('Nonce would start at', _nonce.toString());


  const _tx = {
    to: wallet.address,
    value: ethers.parseEther("0"),
    data: hexData,
  }

  const gasLimit = await PROVIDER.estimateGas(_tx);

  const fee = await fn.getGasFeeData();
  const userGas = await prompts.askForGas(fee);


  const overrides = userGas.maxFee === undefined ? {
    ..._tx,
    gasLimit: gasLimit,
    gasPrice: userGas.gasPrice,
  } : {
    ..._tx,
    gasLimit: gasLimit,
    maxPriorityFeePerGas: userGas.priorityFee,
    maxFeePerGas: userGas.maxFee,
  };

  const walletWithProvider = wallet.connect(PROVIDER);

  const spent = BigInt(gasLimit) * (userGas.maxFee || userGas.gasPrice);
  const maxAmount = balance / spent;
  const amount = await prompts.askForNumber(`How many inscriptions do you want, max to ${maxAmount}`);

  const totalSpent = spent * BigInt(amount);
  if (balance < totalSpent) {
    console.log('Insufficient balance');
    return;
  }

  if (!await prompts.askForConfirm(
    `Total spent: ${ethers.formatUnits(spent, 'ether')} x ${amount} = ${ethers.formatUnits(totalSpent, 'ether')} E`
  )) return;

  for (let i = 0; i < amount; i++) {
    const tx = await walletWithProvider.sendTransaction({
      ...overrides,
      nonce: Number(nonce),
    });

    console.log(nonce, tx.hash);

    nonce++;
  }
}

main();
