import fs from 'fs';
import path from 'path';

export function getDescriptionFiles() {
  const dirPath = path.join(process.cwd(), 'src/data/descriptions');
  const files = fs.readdirSync(dirPath);

  // Only include .txt files (optional)
  const txtFiles = files.filter(file => file.endsWith('.txt'));

  return txtFiles;
}
