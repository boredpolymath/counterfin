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


import { DisclaimerController } from '../js/controllers/disclaimer-controller.js';

test('DisclaimerController: instantiates and exposes storage slot', () => {
  const mockApp = { render: () => {} };
  const controller = new DisclaimerController(mockApp);
  assert.strictEqual(controller.DISCLAIMER_STORAGE_SLOT, 'debtshark_legal_disclaimer_agreed_v1');
});

test('DisclaimerController: handles disclaimer agreement check and record saving', () => {
  const mockApp = { render: () => {} };
  const controller = new DisclaimerController(mockApp);
  localStorage.removeItem(controller.DISCLAIMER_STORAGE_SLOT);
  assert.strictEqual(controller.getStoredDisclaimerAgreement(), null);

  controller.disclaimerConsentCheckbox = { checked: true };
  controller.handleDisclaimerAgreementSubmit();
  assert.strictEqual(controller.hasAgreedDisclaimer, true);
  assert.ok(controller.getStoredDisclaimerAgreement());
});
