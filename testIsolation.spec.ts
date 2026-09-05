import {describe, expect, it, spyOn} from 'bun:test';
import {isTestIsolationApplied} from './testing/testIsolation';

// Diagnostic spec, meant to be run manually with the working directory to check
// (the repo root, a package folder, an IntelliJ run configuration): bun resolves
// `bunfig.toml` from the working directory only, so the preload silently does not
// apply when it is run from anywhere else.
// The last two tests depend on their execution order on purpose: they observe what
// survives from one test to the next.

const greeter = {greet: () => 'not spied'};

describe('Test isolation', () => {
  it('should have registered the global cleanup of the preloaded setup', () => {
    // Assert
    expect(isTestIsolationApplied()).toBe(true);
  });

  it('should leave a spy in place for the next test', () => {
    // Act
    spyOn(greeter, 'greet').mockReturnValue('spied');

    // Assert
    expect(greeter.greet()).toBe('spied');
  });

  it('should observe the spy restored by the global cleanup', () => {
    // Assert
    expect(greeter.greet()).toBe('not spied');
  });
});
