import fn from './utils/fn';
import CONFIG from './utils/config';
import { Alchemy, Network } from 'alchemy-sdk';
import prompts from './utils/prompts';


async function main() {
    const ADDRESS = await prompts.askForTargetAddress();
    const CONTRACT_ADDR = await prompts.askForERC721ContractAddress();

    const settings = {
        apiKey: CONFIG['ALCHEMY_API_KEY'],
        network: Network.ETH_MAINNET,
    };

    const alchemy = new Alchemy(settings);

    const nfts = await alchemy.nft.getNftsForOwner(ADDRESS, {
        contractAddresses: [CONTRACT_ADDR],
    });

    fn.hi(`${nfts.totalCount} NFTs`);

    for (const nft of nfts.ownedNfts) {
        console.log(`${nft.contract.name} #${nft.tokenId}`);
    }

    console.log('');
}

main();
