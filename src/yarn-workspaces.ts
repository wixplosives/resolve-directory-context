import fs from 'fs';
import path from 'path';
import glob from 'glob';
import type { PackageJson } from 'type-fest';
import { isString, isPlainObject } from './language-helpers';
import { INpmPackage, PACKAGE_JSON } from './npm-package';

export function resolveWorkspacePackages(basePath: string, workspaces: string[]): INpmPackage[] {
  const packages = new Map<string, INpmPackage>();
  const globOptions: glob.IOptions = {
    cwd: basePath,
    absolute: true,
    ignore: '**/node_modules/**',
  };
  for (const packageDirGlob of workspaces) {
    const packageJsonGlob = path.posix.join(packageDirGlob, PACKAGE_JSON);
    const packageJsonPaths = glob.sync(packageJsonGlob, globOptions);
    for (const packageJsonPath of packageJsonPaths.map(path.normalize)) {
      if (packages.has(packageJsonPath)) {
        continue;
      }
      const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
      const packageJson = JSON.parse(packageJsonContent) as PackageJson;
      if (!isPlainObject(packageJson)) {
        throw new Error(`${packageJsonPath}: no valid json object.`);
      }

      const displayName = packageJson.name ? packageJson.name : packageJsonPath;

      packages.set(packageJsonPath, {
        displayName,
        packageJsonPath,
        packageJson,
        directoryPath: path.dirname(packageJsonPath),
        packageJsonContent,
      });
    }
  }

  return Array.from(packages.values());
}

export function extractPackageLocations(workspaces: PackageJson.YarnConfiguration['workspaces']): string[] {
  if (isString(workspaces)) {
    return [workspaces];
  } else if (Array.isArray(workspaces)) {
    if (workspaces.every(isString)) {
      return workspaces;
    }
  } else if (isPlainObject(workspaces)) {
    const { packages } = workspaces;
    if (isString(packages)) {
      return [packages];
    } else if (Array.isArray(packages) && packages.every(isString)) {
      return packages;
    }
  }
  throw new Error(`cannot extract package locations from "workspaces" field.`);
}
