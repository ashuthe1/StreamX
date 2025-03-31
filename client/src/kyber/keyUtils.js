import { MlKem768 } from "mlkem";

let globalKeyPair = null;

/**
 * Returns the global key pair.
 * If it hasn't been generated yet, it creates it once.
 */
export async function getGlobalKeyPair() {
  if (!globalKeyPair) {
    const kemInstance = new MlKem768();
    const [publicKey, privateKey] = await kemInstance.generateKeyPair();
    globalKeyPair = { publicKey, privateKey, kemInstance };
  }
  return globalKeyPair;
}
