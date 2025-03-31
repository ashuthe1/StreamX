import { MlKem768 } from "mlkem";

// Helper: Convert Uint8Array to Base64.
function arrayToBase64(arr) {
  return btoa(String.fromCharCode(...arr));
}

// Helper: Convert Base64 to Uint8Array.
function base64ToArray(b64) {
  const binaryStr = atob(b64);
  const len = binaryStr.length;
  const arr = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    arr[i] = binaryStr.charCodeAt(i);
  }
  return arr;
}

/**
 * Returns the global key pair.
 * - If keys are stored in localStorage, it decodes them and creates a new MLKEM instance,
 *   then overrides its keys with the stored ones.
 * - If keys are not stored, it generates a new pair, stores them, and returns them.
 */
export async function getGlobalKeyPair() {
  const storedPrivateKeyBase64 = localStorage.getItem("privateKey");
  const storedPublicKeyBase64 = localStorage.getItem("publicKey");
  const kemInstance = new MlKem768();
  
  if (storedPrivateKeyBase64 && storedPublicKeyBase64) {
    const privateKey = base64ToArray(storedPrivateKeyBase64);
    const publicKey = base64ToArray(storedPublicKeyBase64);
    console.log("Using stored keys.");
    return { publicKey, privateKey, kemInstance };
  } else {
    const [publicKey, privateKey] = await kemInstance.generateKeyPair();
    localStorage.setItem("privateKey", arrayToBase64(privateKey));
    localStorage.setItem("publicKey", arrayToBase64(publicKey));
    console.log("Generated new keys and stored them.");
    return { publicKey, privateKey, kemInstance };
  }
}
