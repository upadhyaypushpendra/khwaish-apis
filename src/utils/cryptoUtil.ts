import crypto from 'crypto';

const algorithm = 'aes-256-ctr';
const secretKey = process.env.CRYPTO_SECRET;
const iv = crypto.randomBytes(16);

/**
 *
 * @param text
 * @returns Hash
 */
export const encrypt = (text: string): Hash => {

  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);

  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

  return {
    salt: iv.toString('hex'),
    hashedValue: encrypted.toString('hex')
  };
};

/**
 * Method to decrypt the hash
 * @param hash
 * @returns string
 */
export const decrypt = (hash: Hash): string => {

  const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(hash.salt, 'hex'));

  const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash.hashedValue, 'hex')), decipher.final()]);

  return decrpyted.toString();
};
