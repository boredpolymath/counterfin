import test from 'node:test';
import assert from 'node:assert/strict';

if (typeof globalThis.window === 'undefined') {
  globalThis.window = {
    addEventListener: () => {},
    removeEventListener: () => {},
    location: { search: '', reload: () => {} },
    print: () => {},
  };
}
if (typeof globalThis.document === 'undefined') {
  globalThis.document = {
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {},
    createElement: () => ({
      tagName: 'DIV',
      style: {},
      classList: { add: () => {}, remove: () => {} },
      appendChild: () => {},
      append: () => {},
      addEventListener: () => {},
      querySelector: () => ({ addEventListener: () => {} }),
    }),
  };
}
if (typeof globalThis.localStorage === 'undefined') {
  const store = {};
  globalThis.localStorage = {
    getItem: (k) => store[k] || null,
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
    clear: () => { Object.keys(store).forEach(k => { delete store[k]; }); }
  };
}


import { PatchController } from '../js/controllers/patch-controller.js';

test('PatchController: instantiates with app reference', () => {
  const mockApp = { render: () => {} };
  const controller = new PatchController(mockApp);
  assert.ok(controller);
  assert.strictEqual(controller.app, mockApp);
  assert.strictEqual(controller.pendingPatchJson, null);
});

test('PatchController: creates patch card element with correct structure', () => {
  const mockApp = { render: () => {} };
  const controller = new PatchController(mockApp);
  const patch = {
    patch_id: 'TEST-2026-001',
    version: '1.0.0',
    title: 'Statutory Update 2026',
    author: 'Bored Polymath Studios',
    timestamp: '2026-10-15T00:00:00Z',
    signature_hex: '0123456789abcdef',
    public_key_hex: 'fedcba9876543210'
  };
  const card = controller.createPatchCardElement(patch);
  assert.ok(card);
});
