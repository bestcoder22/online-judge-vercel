import fs from "fs"
import path from "path"
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const dirCodes = path.join(__dirname,"..","codes")
if(!fs.existsSync(dirCodes)){
    fs.mkdirSync(dirCodes,{recursive:true});
}

export const generateFile = (code,language) => {
    const jobId = uuidv4();
    const filename = `${jobId}.${language}`;
    const filePath = path.join(dirCodes,filename);
    fs.writeFileSync(filePath,code);
    return filePath;
}