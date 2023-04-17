import { ethers } from 'ethers';
import fn from './utils/fn';
import prompts from './utils/prompts';
import CONTRACT_ABI from './abi/ERC721.abi.json';


async function main() {
    const ADDRESS = await prompts.askForTargetAddress();
    const CONTRACT_ADDR = await prompts.askForERC721ContractAddress();
    const PROVIDER = await fn.getProvider();
    const CONTRACT = new ethers.Contract(CONTRACT_ADDR, CONTRACT_ABI, PROVIDER);

    const totalSupply = await CONTRACT.totalSupply();
    const name = await CONTRACT.name();
    const balance = await CONTRACT.balanceOf(ADDRESS);

    fn.hi(`${name}: ${balance} / ${totalSupply}`);

    // get token ids
    let tokenIds = [];
    for (let i = 0; i < balance; i++) {
        const tokenId = await CONTRACT.tokenOfOwnerByIndex(ADDRESS, i);
        // console.log(tokenId.toString());
        tokenIds.push(tokenId.toString());
    }
    console.log(tokenIds.join(', '));
}

main();
