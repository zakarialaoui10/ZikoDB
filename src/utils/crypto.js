import crypto from 'crypto';
function encrypt(data, encryptionKey) {
  if (!encryptionKey) {
    return data;
  }
  const cipher = crypto.createCipher('aes-256-cbc', encryptionKey);
  let encryptedData = cipher.update(data, 'utf8', 'hex');
  encryptedData += cipher.final('hex');
  return encryptedData;
}
function decrypt(data, encryptionKey) {
  if (!encryptionKey) {
    return data;
  }
  const decipher = crypto.createDecipher('aes-256-cbc', encryptionKey);
  let decryptedData = decipher.update(data, 'hex', 'utf8');
  decryptedData += decipher.final('utf8');
  return decryptedData;
}
export{
  encrypt,
  decrypt
}