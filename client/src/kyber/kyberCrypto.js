/* global globalThis */
import { MlKem768 } from "mlkem";

// Generate a Kyber key pair for the current user.
export async function generateKeyPair() {
  const kemInstance = new MlKem768();
  const [publicKey, privateKey] = await kemInstance.generateKeyPair();
  return { publicKey, privateKey, kemInstance };
}

// Encapsulate a shared secret using the recipient's public key.
export async function encapsulateKey(recipientPublicKey) {
  const sender = new MlKem768();
  const [encapsulated, sharedSecret] = await sender.encap(recipientPublicKey);
  return { encapsulated, sharedSecret };
}

// Decapsulate the shared secret using our private key and the same instance.
export async function decapsulateKey(encapsulated, privateKey, kemInstance) {
  const sharedSecret = await kemInstance.decap(encapsulated, privateKey);
  return sharedSecret;
}

// Use the WebCrypto API (globalThis.crypto) to perform AES-GCM encryption.
export async function symmetricEncrypt(plainText, sharedSecretBuffer) {
  // Use globalThis.crypto instead of window.crypto.
  const cryptoObj = globalThis.crypto;
  // Import the shared secret as a raw key for AES-GCM.
  const keyMaterial = await cryptoObj.subtle.importKey(
    "raw",
    sharedSecretBuffer,
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );
  // Create a random IV.
  const iv = cryptoObj.getRandomValues(new Uint8Array(12));
  const encodedText = new TextEncoder().encode(plainText);
  const cipherBuffer = await cryptoObj.subtle.encrypt(
    { name: "AES-GCM", iv },
    keyMaterial,
    encodedText
  );
  return { cipherText: new Uint8Array(cipherBuffer), iv };
}

// Use the WebCrypto API (globalThis.crypto) to perform AES-GCM decryption.
export async function symmetricDecrypt(cipherTextBuffer, iv, sharedSecretBuffer) {
  const cryptoObj = globalThis.crypto;
  const keyMaterial = await cryptoObj.subtle.importKey(
    "raw",
    sharedSecretBuffer,
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );
  const decryptedBuffer = await cryptoObj.subtle.decrypt(
    { name: "AES-GCM", iv },
    keyMaterial,
    cipherTextBuffer
  );
  return new TextDecoder().decode(decryptedBuffer);
}
