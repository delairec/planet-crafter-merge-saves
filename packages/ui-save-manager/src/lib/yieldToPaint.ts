/// <reference lib="dom" />

/**
 * Waits until the browser has painted the pending DOM updates.
 *
 * Reading and mapping a save file is synchronous work on the main thread: a busy indicator turned on
 * just before it would only reach the screen once the work is over. The animation frame callback runs
 * before the paint, so the timeout schedules the caller after it.
 */
export function yieldToPaint(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0)));
}
