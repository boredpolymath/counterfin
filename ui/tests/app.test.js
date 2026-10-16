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


import { SettleMintApp } from '../js/app.js';
import { INITIAL_CASES } from '../js/data/mock-dossiers.js';

test('SettleMintApp: initializes correctly with demo mode disabled by default', () => {
  localStorage.removeItem('settlemint_demo_mode');
  const app = new SettleMintApp();
  assert.strictEqual(app.isDemoMode, false);
  assert.strictEqual(app.currentView, 'dashboard');
});

test('SettleMintApp: getActiveCase returns active dossier', () => {
  const app = new SettleMintApp();
  app.cases = [...INITIAL_CASES];
  app.activeCaseId = INITIAL_CASES[0].id;
  const active = app.getActiveCase();
  assert.ok(active);
  assert.strictEqual(active.id, INITIAL_CASES[0].id);
});

test('SettleMintApp: loads and stores user profile', () => {
  const app = new SettleMintApp();
  assert.ok(app.user);
  assert.ok(app.user.state);
});
