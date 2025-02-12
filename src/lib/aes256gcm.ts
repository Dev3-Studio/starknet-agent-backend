import crypto from 'crypto';

/**
 * Encrypts the given plaintext using AES-256-GCM encryption algorithm.
 * @param plaintext - The plaintext to be encrypted.
 * @param keyBase64 - The base64 encoded encryption key.
 * @returns The encrypted ciphertext as a base64 encoded string.
 * @throws {Error} if the key length is invalid.
 */
export function encryptAes256gcm(plaintext: string, keyBase64: string): string {
    const key = Buffer.from(keyBase64, 'base64');
    if (key.length !== 32) {
        throw new Error('Invalid key length');
    }
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    
    const enc1 = cipher.update(plaintext, 'utf8');
    const enc2 = cipher.final();
    return Buffer.concat([enc1, enc2, iv, cipher.getAuthTag()]).toString('base64');
}

/**
 * Decrypts the given ciphertext using AES-256-GCM encryption.
 * @param ciphertext - The ciphertext to decrypt.
 * @param keyBase64 - The base64-encoded encryption key.
 * @returns The decrypted plaintext.
 * @throws {Error} If the key length is invalid.
 */
export function decryptAes256gcm(ciphertext: string, keyBase64: string): string {
    const key = Buffer.from(keyBase64, 'base64');
    if (key.length !== 32) {
        throw new Error('Invalid key length');
    }
    let cipherBuffer = Buffer.from(ciphertext, 'base64');
    const iv = cipherBuffer.subarray(cipherBuffer.length - 28, cipherBuffer.length - 16);
    const tag = cipherBuffer.subarray(cipherBuffer.length - 16);
    cipherBuffer = cipherBuffer.subarray(0, cipherBuffer.length - 28);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    let plaintext = decipher.update(cipherBuffer, undefined, 'utf8').toString();
    plaintext += decipher.final('utf8');
    return plaintext;
}