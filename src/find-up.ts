import { statSync } from 'fs';
import { dirname, join } from 'path';

export function findFileUpSync(directoryPath: string, fileName: string) {
  for (const directoryInChain of pathChainToRoot(directoryPath)) {
    const filePath = join(directoryInChain, fileName);
    try {
      if (statSync(filePath).isFile()) {
        return filePath;
      }
    } catch {}
  }
  return;
}

function* pathChainToRoot(currentPath: string) {
  let lastPath: string | undefined;
  while (lastPath !== currentPath) {
    yield currentPath;
    lastPath = currentPath;
    currentPath = dirname(currentPath);
  }
}
