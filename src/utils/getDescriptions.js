import fs from 'fs';
import path from 'path';

export function getAllDescriptions() {
  const dirPath = path.join(process.cwd(), 'src/data/descriptions');
  const files = fs.readdirSync(dirPath);
  const txtFiles = files.filter(file => file.endsWith('.txt'));
  return txtFiles;
}
