import { Payment } from 'bitcoinjs-lib';
import { Signer } from 'bip32/types/bip32';
import { BIP32Interface } from 'bip32';


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
