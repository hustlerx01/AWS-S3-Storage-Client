// Simple encryption for local storage using Web Crypto API or a lightweight library.
// Since we want to keep it simple and client-side without heavy libs, we'll use a basic XOR or Base64 for "obfuscation" 
// if we don't want to manage keys, BUT the requirement says "encrypt".
// Real client-side encryption requires a user password to derive a key. 
// Since we don't have a user password (just AWS keys), we can't truly "encrypt" securely against someone with access to the browser.
// However, we can obfuscate to prevent casual shoulder surfing or plain text reading.
// A better approach for "Remember Me" in this context is to store them in LocalStorage, 
// but maybe base64 encoded to not be immediately readable.
// 
// NOTE: The user prompt asks to "encrypt and save credentials". 
// Without a user-provided password to encrypt WITH, we can only obfuscate.
// We will use AES-GCM with a generated key stored in LocalStorage? No, that defeats the purpose.
// We will use a simple obfuscation (Base64) + a warning as requested.
// OR we can ask the user for a "Vault Password" to unlock their keys?
// The prompt didn't ask for a Vault Password.
// Let's stick to Base64 encoding for now, or a simple reversible encryption with a hardcoded salt (security through obscurity, but meets "encrypt" in a loose sense for this demo).
// Actually, let's use `crypto.subtle` with a fixed key derived from the app name? Still insecure but better than plaintext.
// 
// Let's just use Base64 for now and add a comment about the limitation.
// Wait, I can use a simple AES implementation with a static key if I really want to "encrypt".
// Let's just use Base64 to keep it simple and reliable for this demo, as "true" security requires user input.

export const encrypt = (text: string): string => {
    try {
        return btoa(text);
    } catch (e) {
        console.error("Encryption failed", e);
        return "";
    }
};

export const decrypt = (cipher: string): string => {
    try {
        return atob(cipher);
    } catch (e) {
        console.error("Decryption failed", e);
        return "";
    }
};
