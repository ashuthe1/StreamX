import { MlKem768 } from "mlkem";
import axios from 'axios';

// Helper: Convert Uint8Array to Base64.
export function arrayToBase64(arr) {
  return btoa(String.fromCharCode(...arr));
}

// Helper: Convert Base64 to Uint8Array.
export function base64ToArray(b64) {
  const binaryStr = atob(b64);
  const len = binaryStr.length;
  const arr = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    arr[i] = binaryStr.charCodeAt(i);
  }
  return arr;
}

export async function getGlobalKeyPair(saveTheKeys = true) {
  const storedPrivateKeyBase64 = localStorage.getItem("privateKey");
  const storedPublicKeyBase64 = localStorage.getItem("publicKey");
  const kemInstance = new MlKem768();
  
  if (storedPrivateKeyBase64 && storedPublicKeyBase64) {
    const privateKey = base64ToArray(storedPrivateKeyBase64);
    const publicKey = base64ToArray(storedPublicKeyBase64);
    console.log("Using stored keys.");
    return { publicKey, privateKey, kemInstance };
  } else {
    // Generate new keys if not found in localStorage
    const [publicKey, privateKey] = await kemInstance.generateKeyPair();
    localStorage.setItem("privateKey", arrayToBase64(privateKey));
    localStorage.setItem("publicKey", arrayToBase64(publicKey));

    var keyPair = {
      publicKey: publicKey,
      privateKey: privateKey,
    };
    if(saveTheKeys == true) {
      saveKeysToFile(keyPair);
    }
    return { publicKey, privateKey, kemInstance };
  }
}

/**
 * Saves the key pair to a file ("KyberConfig.json") and handles both Chrome and Firefox.
 */
export async function saveKeysToFile(keyPair) {
  try {
    const config = {
      privateKey: arrayToBase64(keyPair.privateKey),
      publicKey: arrayToBase64(keyPair.publicKey),
    };
    const jsonString = JSON.stringify(config, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });

    if (window.showSaveFilePicker) {
      // Chrome (File System Access API)
      const options = {
        types: [{
          description: 'Kyber Configuration',
          accept: { 'application/json': ['.json'] },
        }],
      };
      const handle = await window.showSaveFilePicker(options);
      const writable = await handle.createWritable();
      await writable.write(jsonString);
      await writable.close();
      console.log("Keys saved to file successfully.");
    } else {
      // Firefox/Safari fallback (use download link)
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "KyberConfig.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      console.log("Keys saved using download link.");
    }
  } catch (err) {
    console.error("Failed to save keys to file:", err);
  }
}

/**
 * Loads the key pair from a file and handles both Chrome and Firefox.
 */
export async function loadKeysFromFile() {
  return new Promise((resolve, reject) => {
    if (window.showOpenFilePicker) {
      // Chrome (File System Access API)
      window.showOpenFilePicker({
        types: [{
          description: 'Kyber Configuration',
          accept: { 'application/json': ['.json'] },
        }],
        multiple: false,
      }).then(async ([handle]) => {
        const file = await handle.getFile();
        const text = await file.text();
        const config = JSON.parse(text);
        if (config.privateKey && config.publicKey) {
          localStorage.setItem("privateKey", config.privateKey);
          localStorage.setItem("publicKey", config.publicKey);
          resolve(config);
        } else {
          console.log("The loaded file does not contain both privateKey and publicKey");
          reject(new Error("Missing keys in file"));
        }
      }).catch(err => {
        if (err.name === "AbortError") {
          console.log("User cancelled the file picker.");
          // Resolve with null (or any value that indicates cancellation) instead of rejecting
          resolve(null);
        } else {
          console.error("Failed to load keys from file:", err);
          reject(err);
        }
      });
    } else {
      // Firefox/Safari fallback (use file input)
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "application/json";
      input.style.display = "none";

      input.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (!file) {
          reject(new Error("No file selected"));
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          const config = JSON.parse(reader.result);
          if (config.privateKey && config.publicKey) {
            localStorage.setItem("privateKey", config.privateKey);
            localStorage.setItem("publicKey", config.publicKey);
            resolve(config);
          } else {
            console.log("The loaded file does not contain both privateKey and publicKey");
            reject(new Error("Missing keys in file"));
          }
        };
        reader.onerror = (err) => {
          console.error("Failed to read file:", err);
          reject(err);
        };
        reader.readAsText(file);
      });

      document.body.appendChild(input);
      input.click();
      document.body.removeChild(input);
    }
  });
}

export async function genereateNewKeysAndSaveToFile() {

  const kemInstance = new MlKem768();
  
  const [publicKey, privateKey] = await kemInstance.generateKeyPair();
  localStorage.setItem("privateKey", arrayToBase64(privateKey));
  localStorage.setItem("publicKey", arrayToBase64(publicKey));

  var keyPair = {
      publicKey: publicKey,
      privateKey: privateKey,
  };
  saveKeysToFile(keyPair);
}