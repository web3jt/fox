import CryptoJS from 'crypto-js';


/**
 * AES encrypt
 */
export const aesEncrypt = function (data: string, key: string): string {
  return CryptoJS.AES.encrypt(data, key).toString();
}

/**
 * AES decrypt
 */
export const aesDecrypt = function (ciphertext: string, key: string): string {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (e) {
    return undefined;
  }
}
