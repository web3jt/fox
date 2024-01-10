import { Payment } from 'bitcoinjs-lib';
import { Signer } from 'bip32/types/bip32';
import { BIP32Interface } from 'bip32';
import { Network } from 'bitcoinjs-lib';
import { Networks } from "@cmdcode/tapscript";

export interface BitcoinNetwork {
  name: Networks,
  network: Network,
}

export interface BitcoinWallet {
  path: string,
  keyPair: BIP32Interface,
  p2pkh: Payment,
  p2wpkh: Payment,
  p2sh: Payment,
  p2tr: Payment,
  p2trInternalKey: Buffer,
  p2trSigner: Signer,
}

export interface UTXO {
  tx: string,
  index: number,
  value: number,
  confirmed: boolean,
}
