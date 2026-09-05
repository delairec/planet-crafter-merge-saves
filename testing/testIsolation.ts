import {afterEach, mock} from 'bun:test';

let applied = false;

/**
 * Registers the global cleanup shared by every package: no spec restores its own
 * spies or clears its own mocks. Called by each `testSetup.ts` preloaded through
 * the `bunfig.toml` sitting next to it.
 */
export function enforceTestIsolation(): void {
  afterEach(() => {
    mock.restore();
    mock.clearAllMocks();
  });

  applied = true;
}

export function isTestIsolationApplied(): boolean {
  return applied;
}
