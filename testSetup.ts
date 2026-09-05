import {afterEach, mock} from 'bun:test';

// Test isolation is enforced globally: no spec restores its own spies or clears its own mocks.
afterEach(() => {
  mock.restore();
  mock.clearAllMocks();
});
