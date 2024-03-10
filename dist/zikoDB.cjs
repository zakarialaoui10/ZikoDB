
/*
  Project: ZikoDB.js
  Author: Zakaria Elalaoui
  Date : Sun Mar 10 2024 10:20:09 GMT+0000 (UTC)
  Git-Repo : https://github.com/zakarialaoui10/ZikoDB.js
  Git-Wiki : https://github.com/zakarialaoui10/ZikoDB.js/wiki
  Released under MIT License
*/

(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
'use strict';

var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var stream = require('stream');

// import fs from 'fs'
// import path from 'path'
// import mapfun from 'mapfun'
// import { encrypt, decrypt } from '../utils/crypto.js'
// import { load } from '../utils/load.js'


class Document {
  constructor(rootFolderPath, documentName, useEncryption = false, encryptionKey = null) {
    this.documentPath = path.join(rootFolderPath, documentName);
    if (!fs.existsSync(this.documentPath)) {
      fs.mkdirSync(this.documentPath, { recursive: true });
    }
    this.useEncryption = useEncryption;
    this.encryptionKey = encryptionKey;
    this.data = {};
    this.dataToAdd = [];
    this.uppercaseTransform = new stream.Transform({
      transform(chunk, encoding, callback) {
        if (this.useEncryption) {
          const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
          let encryptedData = cipher.update(chunk, 'utf8', 'hex');
          encryptedData += cipher.final('hex');
          this.push(encryptedData);
        } else {
          this.push(chunk);
        }
        callback();
      }
    });
  }

  async write(key, value) {
    const dataToStore = JSON.stringify(value);
    this.dataToAdd.push({ key, value: dataToStore });
    this.set(key, value);
    return this;
  }

  async save() {
    for (const { key, value } of this.dataToAdd) {
      const filePath = path.join(this.documentPath, key + '.json');
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      
      const writableStream = fs.createWriteStream(filePath);
      if (this.useEncryption) {
        this.uppercaseTransform.pipe(writableStream);
      }
      
      this.uppercaseTransform.end(value);
      
      await new Promise((resolve, reject) => {
        writableStream.on('finish', resolve);
        writableStream.on('error', reject);
      });
    }
    this.dataToAdd = [];
    return this;
  }

  async read(key) {
    const filePath = path.join(this.documentPath, key + '.json');
    if (!fs.existsSync(filePath)) {
      return null;
    }
    
    const readableStream = fs.createReadStream(filePath);
    let data = '';
    
    readableStream.on('data', (chunk) => {
      data += chunk.toString();
    });
    
    return new Promise((resolve, reject) => {
      readableStream.on('end', () => {
        if (this.useEncryption) {
          const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
          let decryptedData = decipher.update(data, 'hex', 'utf8');
          decryptedData += decipher.final('utf8');
          resolve(JSON.parse(decryptedData));
        } else {
          resolve(JSON.parse(data));
        }
      });
      
      readableStream.on('error', reject);
    });
  }

  async readAll() {
    const files = fs.readdirSync(this.documentPath);
    const data = {};

    for (const file of files) {
      const key = path.basename(file, '.json');
      data[key] = await this.read(key);
    }

    return data;
  }

  async slice(path, start, end) {
    // Implement slicing logic here
  }

  set(key, value) {
    this.data[key] = value;
    return this;
  }
}

class ZikoDb {
    constructor(root) {
      this.root = root;
      this.documents = {};
    }
  
    createDoc(name) {
      const document = new Document(this.root, name,true,"ziko");
      this.documents[name] = document;
      return document;
    }
  
    getDoc(name) {
      if(!this.documents[name]) this.createDoc(name);
      return this.documents[name];
    }
  }

module.exports = ZikoDb;
