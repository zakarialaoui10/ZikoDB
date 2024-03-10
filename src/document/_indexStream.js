import fs from 'fs';
import path from 'path';
import { load } from '../utils/load.js';

class Document {
  constructor(rootFolderPath, documentName) {
    this.documentPath = path.join(rootFolderPath, documentName);
    if (!fs.existsSync(this.documentPath)) {
      fs.mkdirSync(this.documentPath, { recursive: true });
    }
    this.data = {};
    this.dataToAdd = [];
    load.call(this);
  }

  async write(key, value) {
    this.dataToAdd.push({ key, value: JSON.stringify(value) });
    this.set(key, value);
    return this;
  }

  async save() {
    console.time("bennchmark")
    for (const { key, value } of this.dataToAdd) {
      const filePath = path.join(this.documentPath, key + '.json');
      await this.writeStreamToFile(filePath, value);
    }
    console.timeEnd("bennchmark")
    this.dataToAdd = [];
    return this;
  }

  async writeStreamToFile(filePath, value) {
    return new Promise((resolve, reject) => {
      const stream = fs.createWriteStream(filePath, { encoding: 'utf8' });
      stream.write(value);
      stream.end();
      stream.on('finish', resolve);
      stream.on('error', reject);
    });
  }

  async read(key) {
    const parts = key.split('/');
    let value = this.data;
    for (const part of parts) {
      if (!value.hasOwnProperty(part)) {
        return null;
      }
    }
    return value[part];
  }

  async readAll() {
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
export {Document}