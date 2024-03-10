import fs from "fs";
import path from "path"
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
export{
  load
}