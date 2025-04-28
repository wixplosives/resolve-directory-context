import { createMemoryFs } from '@file-services/memory';
import { expect } from 'chai';
import type { PackageJson } from 'type-fest';
import {
  childPackagesFromContext,
  PACKAGE_JSON,
  resolveDirectoryContext,
  type INpmPackage,
  type MultiPackageContext,
  type SinglePackageContext,
} from '../src/index.js';

describe('resolveDirectoryContext', () => {
  const packageJson = (packageJson: PackageJson) => JSON.stringify(packageJson, null, 2);

  it('supports a single package', () => {
    const host = createMemoryFs({
      [PACKAGE_JSON]: packageJson({
        name: 'some-package',
      }),
    });
    const packages = resolveDirectoryContext('/', host);

    expect(packages.type).to.equal('single');
    const { npmPackage } = packages as SinglePackageContext;
    expect(npmPackage.displayName).to.equal('some-package');
    expect(npmPackage.directoryPath).to.equal('/');
    expect(npmPackage.packageJsonPath).to.equal('/package.json');
  });

  it('supports npm/yarn "workspaces" definition', () => {
    const host = createMemoryFs({
      [PACKAGE_JSON]: packageJson({
        workspaces: ['packages/*'],
      }),
      packages: {
        a: {
          [PACKAGE_JSON]: packageJson({
            name: 'a',
          }),
        },
        b: {
          [PACKAGE_JSON]: packageJson({
            name: 'b',
          }),
        },
      },
    });
    const packages = resolveDirectoryContext('/', host);

    expect(packages.type).to.equal('multi');
    const { rootPackage, packages: workspacePackages } = packages as MultiPackageContext;
    expect(rootPackage.displayName).to.equal('/package.json');
    expect(rootPackage.directoryPath).to.equal('/');
    expect(rootPackage.packageJsonPath).to.equal('/package.json');

    expect(workspacePackages).to.have.lengthOf(2);
    const [packageA, packageB] = workspacePackages as [INpmPackage, INpmPackage];

    expect(packageA.displayName).to.equal('a');
    expect(packageA.directoryPath).to.equal('/packages/a');
    expect(packageA.packageJsonPath).to.equal('/packages/a/package.json');

    expect(packageB.displayName).to.equal('b');
    expect(packageB.directoryPath).to.equal('/packages/b');
    expect(packageB.packageJsonPath).to.equal('/packages/b/package.json');
  });

  it('supports lerna "packages" definition', () => {
    const host = createMemoryFs({
      [PACKAGE_JSON]: packageJson({}),
      'lerna.json': JSON.stringify({ packages: ['packages/*'] }),
      packages: {
        a: {
          [PACKAGE_JSON]: packageJson({
            name: 'a',
          }),
        },
        b: {
          [PACKAGE_JSON]: packageJson({
            name: 'b',
          }),
        },
      },
    });
    const packages = resolveDirectoryContext('/', host);

    expect(packages.type).to.equal('multi');
    expect(childPackagesFromContext(packages)).to.have.lengthOf(2);
    const [packageA, packageB] = childPackagesFromContext(packages) as [INpmPackage, INpmPackage];

    expect(packageA.displayName).to.equal('a');
    expect(packageA.directoryPath).to.equal('/packages/a');
    expect(packageA.packageJsonPath).to.equal('/packages/a/package.json');

    expect(packageB.displayName).to.equal('b');
    expect(packageB.directoryPath).to.equal('/packages/b');
    expect(packageB.packageJsonPath).to.equal('/packages/b/package.json');
  });

  it('supports npm file: links', () => {
    const host = createMemoryFs({
      [PACKAGE_JSON]: packageJson({
        devDependencies: {
          a: 'file:packages/a',
          b: 'file:packages/b',
        },
      }),
      packages: {
        a: {
          [PACKAGE_JSON]: packageJson({
            name: 'a',
          }),
        },
        b: {
          [PACKAGE_JSON]: packageJson({
            name: 'b',
          }),
        },
      },
    });
    const packages = resolveDirectoryContext('/', host);

    expect(packages.type).to.equal('multi');
    expect(childPackagesFromContext(packages)).to.have.lengthOf(2);
    const [packageA, packageB] = childPackagesFromContext(packages) as [INpmPackage, INpmPackage];

    expect(packageA.displayName).to.equal('a');
    expect(packageA.directoryPath).to.equal('/packages/a');
    expect(packageA.packageJsonPath).to.equal('/packages/a/package.json');

    expect(packageB.displayName).to.equal('b');
    expect(packageB.directoryPath).to.equal('/packages/b');
    expect(packageB.packageJsonPath).to.equal('/packages/b/package.json');
  });
});
