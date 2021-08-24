import { join } from 'path';
import { expect } from 'chai';
import { resolveWorkspacePackages } from '../src/yarn-workspaces';

describe('resolveWorkspacePackages', () => {
  const yarnWorkspaceFixturePath = join(__dirname, 'fixtures/yarn-workspace');
  it('finds packages when workspace definition contains a glob', () => {
    const packages = resolveWorkspacePackages(yarnWorkspaceFixturePath, ['packages/*']);
    expect(packages.map(({ displayName }) => displayName)).to.eql(['yarn-workspace-a', 'yarn-workspace-b']);
  });

  it('finds packages only once, even if targeted by multiple definitions', () => {
    const packages = resolveWorkspacePackages(yarnWorkspaceFixturePath, ['packages/b', 'packages/*']);
    expect(packages.map(({ displayName }) => displayName)).to.eql(['yarn-workspace-b', 'yarn-workspace-a']);
  });
});
