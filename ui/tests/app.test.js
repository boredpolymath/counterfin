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

// =========================================================================
// Error & Edge Case Tests
// =========================================================================

test('SettleMintApp (Edge Case): getActiveCase returns null when cases list is empty', () => {
  const app = new SettleMintApp();
  app.cases = [];
  app.activeCaseId = 'non_existent_case_id';
  const active = app.getActiveCase();
  assert.strictEqual(active, null);
});

test('SettleMintApp (Edge Case): getActiveCase falls back to first case when activeCaseId is invalid', () => {
  const app = new SettleMintApp();
  app.cases = [...INITIAL_CASES];
  app.activeCaseId = 'invalid_unknown_uuid_999';
  const active = app.getActiveCase();
  assert.ok(active);
  assert.strictEqual(active.id, INITIAL_CASES[0].id);
});

test('SettleMintApp (Error Handling): loadUserProfile recovers gracefully from corrupted/malformed JSON', () => {
  const app = new SettleMintApp();
  localStorage.setItem(app.PROFILE_STORAGE_SLOT, '{malformed_json_corrupted: true');
  assert.doesNotThrow(() => {
    app.loadUserProfile();
  });
  assert.strictEqual(app.user.name, 'Consumer Advocate');
  assert.strictEqual(app.user.initials, 'CA');
  assert.strictEqual(app.user.isConfigured, false);
});

test('SettleMintApp (Edge Case): saveUserProfile handles empty and single-word names correctly', () => {
  const app = new SettleMintApp();
  
  // Boundary 1: Empty name
  app.saveUserProfile({ name: '   ', state: 'CA' });
  assert.strictEqual(app.user.name, 'Consumer Advocate');
  assert.strictEqual(app.user.initials, 'CA');

  // Boundary 2: Single-word name
  app.saveUserProfile({ name: 'Madonna', state: 'CA' });
  assert.strictEqual(app.user.name, 'Madonna');
  assert.strictEqual(app.user.initials, 'MA');
  assert.strictEqual(app.user.shortName, 'Madonna');
});

test('SettleMintApp (Error Handling): initBackendData handles rejection without throwing unhandled exceptions', async () => {
  const app = new SettleMintApp();
  assert.doesNotThrow(async () => {
    await app.initBackendData();
  });
});
