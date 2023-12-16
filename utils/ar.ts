import fs from 'fs';
import path from 'path';
import Arweave from 'arweave';
import { JWKInterface } from 'arweave/web/lib/wallet';
import { aesEncrypt, aesDecrypt } from './aes';
import prompts from './prompts';
import fn from './fn';
import CONFIG from './config';


const _getArKey = async function (i_: number, passphrase_: string): Promise<JWKInterface> {
  const f = path.join(__dirname, `../arkeys/${i_}.dat`);

  if (fs.existsSync(f)) {
    const encryptedJSON = fs.readFileSync(f, 'utf8');
    const decryptedJSON = aesDecrypt(encryptedJSON, passphrase_);
    if (decryptedJSON) return JSON.parse(decryptedJSON);
    return undefined;
  }

  const key = await arweave.wallets.generate();
  const keyJSON = JSON.stringify(key);
  const encryptedKey = aesEncrypt(keyJSON, passphrase_);
  fs.writeFileSync(f, encryptedKey, 'utf8');
  return key;
}

interface ArWallet {
  key: JWKInterface,
  address: string,
}

export const getArWallets = async function (amount_: number = undefined): Promise<ArWallet[]> {
  const rlt: ArWallet[] = [];

  fn.hi('--------- --------- generate/load Arweave wallet --------- ---------');
  const passphrase = await prompts.askForPassphrase('Please input passphrase for encrypting/decrypting Arweave wallet');
  const amount = amount_ || await prompts.askForNumber('How many wallets do you want to generate/load', '1');

  for (let i = 0; i < amount; i++) {
    const key = await _getArKey(i, passphrase);
    if (undefined === key) {
      console.log(`Failed to load key #${i} stop here...`);
      return rlt;
    }

    rlt.push({
      key: key,
      address: await arweave.wallets.jwkToAddress(key)
    });
  }

  return rlt;
}





export const arweave = Arweave.init({
  host: CONFIG.ARWEAVE.HOST || 'arweave.net',
  port: CONFIG.ARWEAVE.PORT || 443,
  protocol: CONFIG.ARWEAVE.PROTOCOL || 'https',
});

