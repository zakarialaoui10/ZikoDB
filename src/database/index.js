import { Document } from "../document/index.js"
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
export{
  ZikoDb
}