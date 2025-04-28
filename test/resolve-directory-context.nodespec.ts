import { expect } from 'chai';
import fs from 'node:fs';
import path from 'node:path';
import {
  resolveDirectoryContext,
  type INpmPackage,
  type MultiPackageContext,
  type SinglePackageContext,
} from '../src/index.js';

describe('resolveDirectoryContext using native Node.js host', () => {
  const host = { ...fs, ...path };
  const fixtureDirectory = (fixtureName: string) => path.join(import.meta.dirname, 'fixtures', fixtureName);

  it('supports a single package', () => {
    const fixturePath = fixtureDirectory('single-package');
    const packages = resolveDirectoryContext(fixturePath, host);

    expect(packages.type).to.equal('single');
    const { npmPackage } = packages as SinglePackageContext;
    expect(npmPackage.displayName).to.equal('fixture-package');
    expect(npmPackage.directoryPath).to.equal(fixturePath);
    expect(npmPackage.packageJsonPath).to.equal(path.join(fixturePath, 'package.json'));
  });

  it('supports npm/yarn "workspaces" definition', () => {
    const fixturePath = fixtureDirectory('workspace');
    const packages = resolveDirectoryContext(fixturePath, host);

    expect(packages.type).to.equal('multi');
    const { rootPackage, packages: workspacePackages } = packages as MultiPackageContext;
    expect(rootPackage.displayName).to.equal('workspace-fixture');
    expect(rootPackage.directoryPath).to.equal(fixturePath);
    expect(rootPackage.packageJsonPath).to.equal(path.join(fixturePath, 'package.json'));

    expect(workspacePackages).to.have.lengthOf(2);
    const [packageA, packageB] = workspacePackages as [INpmPackage, INpmPackage];

    expect(packageA.displayName).to.equal('workspace-fixture-a');
    expect(packageA.directoryPath).to.equal(path.join(fixturePath, 'packages/a'));
    expect(packageA.packageJsonPath).to.equal(path.join(fixturePath, 'packages/a/package.json'));

    expect(packageB.displayName).to.equal('workspace-fixture-b');
    expect(packageB.directoryPath).to.equal(path.join(fixturePath, 'packages/b'));
    expect(packageB.packageJsonPath).to.equal(path.join(fixturePath, 'packages/b/package.json'));
  });
});
