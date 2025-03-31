// test.js

// Import your KyberCrypto module.
// Adjust the import path as necessary.
import * as KyberCrypto from './kyberCrypto.js';

// Helper: Convert Uint8Array to Base64 string.
function arrayToBase64(uint8Array) {
  return btoa(String.fromCharCode(...uint8Array));
}

// Helper: Convert a Base64 string to a Uint8Array.
function base64ToArray(base64String) {
  const binaryString = atob(base64String);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function testEncryptionDecryption() {
  console.log('--- Generating Key Pairs ---');
  // Generate key pair for User1.
  const keyPair1 = await KyberCrypto.generateKeyPair();
  // Generate key pair for User2.
  const keyPair2 = await KyberCrypto.generateKeyPair();
  console.log('User1 Key Pair:', keyPair1);
  console.log('User2 Key Pair:', keyPair2);

  // Convert keys to Base64 strings.
  const user1PublicKeyB64 = arrayToBase64(keyPair1.publicKey);
  const user1PrivateKeyB64 = arrayToBase64(keyPair1.privateKey);
  const user2PublicKeyB64 = arrayToBase64(keyPair2.publicKey);
  const user2PrivateKeyB64 = arrayToBase64(keyPair2.privateKey);
  console.log('User1 Public Key (Base64):', user1PublicKeyB64);
  console.log('User1 Private Key (Base64):', user1PrivateKeyB64);
  console.log('User2 Public Key (Base64):', user2PublicKeyB64);
  console.log('User2 Private Key (Base64):', user2PrivateKeyB64);

  // Test conversion back.
  const user1PublicKeyRestored = base64ToArray(user1PublicKeyB64);
  const user2PublicKeyRestored = base64ToArray(user2PublicKeyB64);
  console.log('User1 Public Key restored:', user1PublicKeyRestored);
  console.log('User2 Public Key restored:', user2PublicKeyRestored);

  console.log('--- Encrypting a Message from User1 to User2 ---');
  const message = 'Hello, this is a secret message from User1 to User2!';
  // User1 encrypts the message using User2's public key.
  // First, convert User2's public key back to Uint8Array.
  const user2PublicKey = base64ToArray(user2PublicKeyB64);
  const { encapsulated, sharedSecret } = await KyberCrypto.encapsulateKey(user2PublicKey);
  const { cipherText, iv } = await KyberCrypto.symmetricEncrypt(message, sharedSecret);

  // Convert encryption outputs to Base64 strings.
  const encapsulatedB64 = arrayToBase64(encapsulated);
  const cipherTextB64 = arrayToBase64(cipherText);
  const ivB64 = arrayToBase64(iv);
  console.log('Encapsulated key (Base64):', encapsulatedB64);
  console.log('CipherText (Base64):', cipherTextB64);
  console.log('IV (Base64):', ivB64);

  console.log('--- Decrypting the Message on User2 Side ---');
  // On User2 side, convert the Base64 strings back to Uint8Array.
  const encapsulatedArr = base64ToArray(encapsulatedB64);
  const cipherTextArr = base64ToArray(cipherTextB64);
  const ivArr = base64ToArray(ivB64);
  // User2 decapsulates the shared secret using their private key.
  const sharedSecret2 = await KyberCrypto.decapsulateKey(
    encapsulatedArr,
    keyPair2.privateKey,
    keyPair2.kemInstance
  );
  const decryptedMessage = await KyberCrypto.symmetricDecrypt(
    cipherTextArr,
    ivArr,
    sharedSecret2
  );
  console.log('Decrypted message at User2:', decryptedMessage);
}

testEncryptionDecryption().catch(console.error);
