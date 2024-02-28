import { decrypt, encrypt } from './utils/crypto';

self.onmessage = async (event) => {
  const { key, filePath, value } = event.data;

  const encryptedValue = encrypt(value, self.encryptionKey);

  self.postMessage({ key, filePath, value: encryptedValue });
};
