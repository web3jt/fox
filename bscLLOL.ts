import { ethers } from 'ethers';
import fn from './utils/fn';
import prompts from './utils/prompts';
import CONFIG from './utils/config';
import CONTRACT_ABI from './abi/BSC_WBNB.abi.json';


async function main() {
  // const INSCRIPTION_DATA = `data:,{“p”:“brc-20”,“op”:“mint”,“tick”:“LLOL”,“amt”:“1000”}`;
  // const hexData = `0x${Buffer.from(INSCRIPTION_DATA, 'utf8').toString('hex')}`
  const hexData = `0x646174613a2c7b2270223a226272632d3230222c226f70223a226d696e74222c227469636b223a224c4c4f4c222c22616d74223a2231303030227d`;

  fn.hi('EVM Inscription');
  // console.log('DATA:', INSCRIPTION_DATA);
  console.log(' HEX:', hexData);
  console.log('');

  const CONTRACT_ADDR = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';
  const PROVIDER: ethers.JsonRpcProvider = await fn.getProvider();
  // const CONTRACT = new ethers.Contract(CONTRACT_ADDR, CONTRACT_ABI, PROVIDER);
  const wallets = await fn.deriveWallets(1);
  const wallet = wallets[0];

  let balance = await PROVIDER.getBalance(wallet.address);
  console.log('Balance:', ethers.formatUnits(balance, 'ether'), 'E');

  if (balance === BigInt(0)) {
    if (await prompts.askForConfirm('Is there a RPC problem? so, keep watching?')) {
      while (balance === BigInt(0)) {
        await fn.sleep(3000);
        balance = await PROVIDER.getBalance(wallet.address);
        console.log('Balance:', ethers.formatUnits(balance, 'ether'), 'E');
      }
    } else {
      console.log('Insufficient balance');
      process.exit(0);
    }
  }


  if (!await prompts.askForConfirm(`Balance: ${ethers.formatUnits(balance, 'ether')} E`)) return;

  const _nonce = await PROVIDER.getTransactionCount(wallet.address);
  let nonce: bigint = await prompts.askForNonce('Nonce would start at', _nonce.toString());

  const _tx = {
    to: CONTRACT_ADDR,
    value: ethers.parseEther("0"),
    data: hexData,
  }

  const gasLimit = await PROVIDER.estimateGas(_tx);

  if (!await prompts.askForConfirm(`Gas Limit: ${gasLimit}`)) return;

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
