import fs from 'fs'
import path from 'path'
//import mapfun from 'mapfun'
//import { encrypt, decrypt } from '../utils/crypto.js'
import { load } from '../utils/load.js'

class Document {
  constructor(rootFolderPath, documentName/*, useEncryption = false, encryptionKey = null*/) {
    this.documentPath = path.join(rootFolderPath, documentName);
    if (!fs.existsSync(this.documentPath)) {
      fs.mkdirSync(this.documentPath, { recursive: true });
    }
    //this.useEncryption = useEncryption;
    //this.encryptionKey = encryptionKey;
    this.data = {};
    this.dataToAdd = [];
    load.call(this);
  }

  async write(key, value) {
    // const dataToStore = this.useEncryption ? JSON.stringify(mapfun(n => encrypt(n, this.encryptionKey), {}, value)) : JSON.stringify(value);
    this.dataToAdd.push({ key, value });
    this.set(key, value);
    return this;
  }

  async save() {
    for (const { key, value } of this.dataToAdd) {
      const filePath = path.join(this.documentPath, key + '.json');
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      await fs.promises.writeFile(filePath, value, 'utf8');
    }
    this.dataToAdd = [];
    return this;
  }

  async read(key) {
    const parts = key.split('/');
    let value = this.data;
    for (const part of parts) {
      if (!value.hasOwnProperty(part)) {
        return null;
      }
      //value = this.useEncryption ? mapfun(n => decrypt(n, this.encryptionKey), {}, value[part]) : value[part];
    }
    return value;
  }

  async readAll() {
    //return this.useEncryption ? mapfun(n => decrypt(n, this.encryptionKey), {}, this.data) : this.data;
    return this.data;
  }

  async slice(path, start, end) {
    const parts = path.split('/');
    let value = this.data;
    for (const part of parts) {
      if (!value.hasOwnProperty(part)) {
        return undefined;
      }
      value = value[part];
    }
    if (Array.isArray(value)) {
      return value.slice(start, end);
    }
    return undefined;
  }

  set(key, value) {
    const parts = key.split('/');
    let obj = this.data;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!obj.hasOwnProperty(part)) {
        obj[part] = {};
      }
      obj = obj[part];
    }
    obj[parts[parts.length - 1]] = value;
    return this;
  }
}

export {Document} ;