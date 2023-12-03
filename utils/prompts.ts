import fs from 'fs';
import path from 'path';
import prompts from 'prompts';
import { ethers } from 'ethers';
import CONFIG from './config';

/**
 * Ask for a confirmation
 */
const askForConfirm = async function (hint: string = 'Confirm'): Promise<boolean> {
  while (true) {
    const response = await prompts({
      type: 'text',
      name: 'value',
      message: `${hint} (y/N)`,
    });

    if (response.value) {
      return response.value.toLowerCase().startsWith('y');
    }

    return false;
  }
}

/**
 * Ask for a number
 */
const askForNumber = async function (hint: string = 'Input a number'): Promise<number> {
  while (true) {
    const response = await prompts({
      type: 'number',
      name: 'value',
      message: hint,
    });

    if (response.value) {
      return parseInt(response.value);
    }
  }
}

/**
 * Ask for a string
 */
export const askForString = async function (hint: string = "Input a string"): Promise<string> {
  while (true) {
    const response = await prompts({
      type: 'text',
      name: 'value',
      message: hint,
    });

    if (response.value) {
      return response.value;
    }
  }
}


/**
 * Ask for a path
 */
export const askForPath = async function (hint: string = "Input a path"): Promise<string> {
  while (true) {
    const response = await prompts({
      type: 'text',
      name: 'value',
      message: hint,
      validate: (value) => {
        if (!fs.existsSync(value)) return `Path ${value} does not exist`;
        if (!fs.lstatSync(value).isDirectory()) return `Path ${value} is not a directory`;

        return true;
      },
    });

    if (response.value) return response.value;
  }
}

export const getFiles = async function (extname: string = '', dir: string = ''): Promise<string[]> {
  if (!dir) dir = await askForPath(`${extname} dir`);

  const files: string[] = [];
  const _files = fs.readdirSync(dir);
  _files.forEach((file, i) => {
    const p2f = path.join(dir, file);
    if (fs.lstatSync(p2f).isDirectory()) return;
    if (file.startsWith('_') || file.startsWith('.')) return;
    if (extname) {
      if (path.extname(p2f) !== extname) return;
    }
    files.push(p2f);
  });

  console.log(`\nFound ${files.length} ${extname} files...\n`);
  return files;
}

export const getDirs = async function (dir: string = ''): Promise<string[]> {
  if (!dir) dir = await askForPath(`input dir`);

  const files: string[] = [];
  const _files = fs.readdirSync(dir);
  _files.forEach((file, i) => {
    const p2f = path.join(dir, file);
    if (fs.lstatSync(p2f).isFile()) return;
    if (file.startsWith('_') || file.startsWith('.')) return;
    files.push(p2f);
  });

  console.log(`\nFound ${files.length} dirs...\n`);
  return files;
}

/**
 * Ask for a BIP39 passphrase
 * 
 * @return {string} passphrase
 * 
 * @see https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki#from-mnemonic-to-seed
 */
const askForPassphrase = async function (): Promise<string> {
  while (true) {
    const response = await prompts({
      type: 'password',
      name: 'value',
      message: 'BIP39 Passphrase',
      // validate: (value: string) => 8 > value.length ? 'Too short' : true
    });

    if (`/` === response.value) return '';

    if (response.value) {
      return response.value;
    }
  }
}

/**
 * Ask for the account index
 * 
 * @returns {string} account index
 */
const askForAccountIndex = async function (hint: string = 'Account#_'): Promise<number> {
  while (true) {
    const response = await prompts({
      type: 'password',
      name: 'value',
      message: hint,
    });

    if (response.value) {
      return parseInt(response.value);
    }
  }
}

/**
 * Returns true if the address is valid
 */
const _isAddress = function (address: string): boolean {
  try {
    ethers.getAddress(address);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Ask for an EVM address
 */
const askForEvmAddress = async function (hint: string = 'Address'): Promise<string> {
  const response = await prompts({
    type: 'text',
    name: 'value',
    message: hint,
    validate: (value: string) => _isAddress(value) ? true : 'Invalid address'
  });

  if (response.value) {
    return ethers.getAddress(response.value);
  }

  console.log('');
  process.exit(0);
}

/**
 * Ask for an ERC20 contract address
 */
const askForERC20ContractAddress = async function (): Promise<string> {
  const ADDR = CONFIG['EVM_CONTRACT']['ERC20'];

  const confirm = await askForConfirm(`ERC20 Contract: ${ADDR}`);

  if (confirm) {
    return ADDR;
  }

  return await askForEvmAddress('ERC20 Contract');
}

/**
 * Ask for an ERC721 contract address
 */
const askForERC721ContractAddress = async function (): Promise<string> {
  const ADDR = CONFIG['EVM_CONTRACT']['ERC721'];

  const confirm = await askForConfirm(`ERC721 Contract: ${ADDR}`);

  if (confirm) {
    return ADDR;
  }

  return await askForEvmAddress('ERC721 Contract');
}

/**
 * Ask for an ERC1155 contract address
 */
const askForERC1155ContractAddress = async function (): Promise<string> {
  const ADDR = CONFIG['EVM_CONTRACT']['ERC1155'];

  const confirm = await askForConfirm(`ERC1155 Contract: ${ADDR}`);

  if (confirm) {
    return ADDR;
  }

  return await askForEvmAddress('ERC1155 Contract');
}

/**
 * Ask for a source address
 */
const askForSourceAddress = async function (): Promise<string> {
  const ADDR = CONFIG['EVM_ADDRESS']['SOURCE'];

  const confirm = await askForConfirm(`Source  Address: ${ADDR}`);

  if (confirm) {
    return ADDR;
  }

  return await askForEvmAddress('Source  Address');
}

/**
 * Ask for a target address
 */
const askForTargetAddress = async function (): Promise<string> {
  const ADDR = CONFIG['EVM_ADDRESS']['TARGET'];

  const confirm = await askForConfirm(`Target  Address: ${ADDR}`);

  if (confirm) {
    return ADDR;
  }

  return await askForEvmAddress('Target  Address');
}

export default {
  askForConfirm: askForConfirm,
  askForNumber: askForNumber,
  askForString: askForString,
  askForPassphrase: askForPassphrase,
  askForAccountIndex: askForAccountIndex,

  askForEvmAddress: askForEvmAddress,
  askForERC20ContractAddress: askForERC20ContractAddress,
  askForERC721ContractAddress: askForERC721ContractAddress,
  askForERC1155ContractAddress: askForERC1155ContractAddress,
  askForSourceAddress: askForSourceAddress,
  askForTargetAddress: askForTargetAddress,
}
