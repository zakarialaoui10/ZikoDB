
/*
  Project: ZikoDB.js
  Author: Zakaria Elalaoui
  Date : Sun Mar 10 2024 10:39:49 GMT+0000 (UTC)
  Git-Repo : https://github.com/zakarialaoui10/ZikoDB.js
  Git-Wiki : https://github.com/zakarialaoui10/ZikoDB.js/wiki
  Released under MIT License
*/

import fs from 'fs';
import path from 'path';

function getJsonFiles(folderPath) {
    const files = fs.readdirSync(folderPath);
    const jsonFiles = [];
    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        const subJsonFiles = getJsonFiles(filePath);
        jsonFiles.push(...subJsonFiles);
      } else if (path.extname(file) === '.json') {
        jsonFiles.push(filePath);
      }
    }
    return jsonFiles;
  }
function load(){
    const files = getJsonFiles(this.documentPath);
    for (const file of files) {
      const data = fs.readFileSync(file, 'utf8');
      const key = path.relative(this.documentPath, file);
      this.set(key.replace(/\\/g, '/').replace('.json', ''), JSON.parse(data));
    }
  }

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
    console.time("benchmark");
    for (const { key, value } of this.dataToAdd) {
      const filePath = path.join(this.documentPath, key + '.json');
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      await fs.promises.writeFile(filePath, value, 'utf8');
    }
    console.timeEnd("benchmark");
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
    }
    return value[part];
  }

  async readAll() {
    return this.data
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

class ZikoDb {
    constructor(root) {
      this.root = root;
      this.documents = {};
    }
  
    createDoc(name) {
      const document = new Document(this.root, name);
      this.documents[name] = document;
      return document;
    }
  
    getDoc(name) {
      if(!this.documents[name]) this.createDoc(name);
      return this.documents[name];
    }
  }

export { ZikoDb as default };
