
/*
  Project: ZikoDB.js
  Author: Zakaria Elalaoui
  Date : Wed Feb 28 2024 13:44:38 GMT+0100 (UTC+01:00)
  Git-Repo : https://github.com/zakarialaoui10/ZikoDB.js
  Git-Wiki : https://github.com/zakarialaoui10/ZikoDB.js/wiki
  Released under MIT License
*/

'use strict';

var fs = require('fs');
var path = require('path');
var crypto = require('crypto');

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var mapfun$1 = {exports: {}};

/*
Developped by zakaria elaloui
Github : https://github.com/zakarialaoui10
*/

(function (module, exports) {
	const mapfun = (fun, { skip = [], key = false, value = true } = {}, ...X) => {
	  const Y = X.map((x) => {
	    if (typeof skip === 'string'||[null,undefined].includes(skip))skip=[skip];
	      const skipPrimitives = [];
	      const skipObjects = [];
	      skip.forEach((element) =>(typeof element==="object"&&element !==null)?skipObjects.push(element):skipPrimitives.push(element));
	        if(skipPrimitives.includes(typeof x)||skipPrimitives.includes(x)) return x;
	        if(skipObjects.some(n=>x instanceof n))return x;
	    if (x === null) return fun(null);
	    if (['number', 'string', 'boolean', 'bigint', 'undefined'].includes(typeof x)) return fun(x);
	    if (x instanceof Array) return x.map((n) => mapfun(fun,{},n));
	    if (ArrayBuffer.isView(x)) return Array.from(x).map((n) => fun(n));
	    if (x instanceof Set) return new Set(mapfun(fun,{},...[...x]));
	    if (x instanceof Map) return new Map([...x].map(n =>{
	        return [
	            key?mapfun(fun,{},n[0]):n[0],
	            value?mapfun(fun,{},n[1]):n[1],
	            ]
	    }));
	    if (x instanceof Object) return Object.fromEntries(
	      Object.entries(x).map(([KEY, VALUE]) => [
	        key?mapfun(fun,{},KEY):KEY,
	        value?mapfun(fun,{},VALUE):VALUE
	      ])
	    )
	    else throw new Error('Uncategorised data');
	  });
	    return Y.length === 1 ? Y[0] : Y;
	};
	{
	  module.exports = mapfun ;
	} 
} (mapfun$1));

var mapfunExports = mapfun$1.exports;
var mapfun = /*@__PURE__*/getDefaultExportFromCjs(mapfunExports);

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
      const decryptedData = this.useEncryption ? decrypt(data) : data;
      this.set(key.replace(/\\/g, '/').replace('.json', ''), JSON.parse(decryptedData));
    }
  }

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
    load.call(this);
  }

  async write(key, value) {
    const dataToStore = this.useEncryption ? JSON.stringify(mapfun(n => encrypt(n, this.encryptionKey), {}, value)) : JSON.stringify(value);
    this.dataToAdd.push({ key, value: dataToStore });
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
      value = this.useEncryption ? mapfun(n => decrypt(n, this.encryptionKey), {}, value[part]) : value[part];
    }
    return value;
  }

  async readAll() {
    return this.useEncryption ? mapfun(n => decrypt(n, this.encryptionKey), {}, this.data) : this.data;
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

class Db {
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

exports.Db = Db;
