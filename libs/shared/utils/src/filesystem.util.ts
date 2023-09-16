import { access, constants, stat, readFile, readdir } from 'fs/promises';

export function checkFileExists(file: string): Promise<boolean> {
  return new Promise((resolve) => {
    access(file, constants.F_OK)
      .then(() => resolve(true))
      .catch(() => resolve(false));
  });
}

export async function checkFolderExists(folderPath: string) {
  try {
    const stats = await stat(folderPath);
    return stats.isDirectory();
  } catch (error) {
    if ((error as { code: string }).code === 'ENOENT') return false;

    throw error;
  }
}

export async function readImageFromFile(filePath: string) {
  try {
    const isFileExists = await checkFileExists(filePath);
    if (!isFileExists) throw new Error(`${filePath} is not found`);

    const imageBuffer = await readFile(filePath);
    return imageBuffer.toString('base64');
  } catch (error) {
    console.error(`Error reading image file: ${(error as Error).message}`);
    throw error;
  }
}

export async function listFilesInFolder(folderPath: string) {
  try {
    const isFolderExists = await checkFolderExists(folderPath);
    if (!isFolderExists) throw new Error(`${folderPath} is not exists`);

    const files = await readdir(folderPath);
    return files;
  } catch (error) {
    console.error(`Error listing files in folder: ${(error as Error).message}`);
    throw error;
  }
}
