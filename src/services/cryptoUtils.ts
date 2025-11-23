import CryptoJS from 'crypto-js';

// Secret key for AES encryption
// In production, this could be generated per-browser or derived from a user password
// For this client-side app, we use a static key (security through obscurity)
const SECRET_KEY = 'AeroVault_2024_SecureStorage_Key';

/**
 * Encrypts text using AES encryption
 * @param text - Plain text to encrypt
 * @returns Encrypted cipher text
 */
export const encrypt = (text: string): string => {
    try {
        const encrypted = CryptoJS.AES.encrypt(text, SECRET_KEY);
        return encrypted.toString();
    } catch (e) {
        console.error("Encryption failed", e);
        return "";
    }
};

/**
 * Decrypts AES encrypted text
 * @param cipherText - Encrypted text to decrypt
 * @returns Decrypted plain text
 */
export const decrypt = (cipherText: string): string => {
    try {
        const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (e) {
        console.error("Decryption failed", e);
        return "";
    }
};
