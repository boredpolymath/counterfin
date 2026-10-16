import test from 'node:test';
import assert from 'node:assert/strict';

if (typeof globalThis.window === 'undefined') {
  globalThis.window = {};
}

import { ipc } from '../js/ipc.js';

test('ipc: isTauri() returns false in standard browser and true with __TAURI__ core invoke', () => {
  delete globalThis.window.__TAURI__;
  assert.strictEqual(ipc.isTauri(), false);

  globalThis.window.__TAURI__ = { core: { invoke: async () => {} } };
  assert.strictEqual(ipc.isTauri(), true);
  delete globalThis.window.__TAURI__;
});

test('ipc: invoke returns null in mock mode without throwing', async () => {
  delete globalThis.window.__TAURI__;
  const res = await ipc.invoke('unknown_command', {});
  assert.strictEqual(res, null);
});

test('ipc: getCases and getInteractions gracefully return null in browser mode', async () => {
  delete globalThis.window.__TAURI__;
  const cases = await ipc.getCases();
  assert.strictEqual(cases, null);

  const interactions = await ipc.getInteractions('case_123');
  assert.strictEqual(interactions, null);
});
