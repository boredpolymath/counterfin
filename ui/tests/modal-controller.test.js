import test from 'node:test';
import assert from 'node:assert/strict';

if (typeof globalThis.window === 'undefined') {
  globalThis.window = { addEventListener: () => {} };
}
if (typeof globalThis.document === 'undefined') {
  globalThis.document = {
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {},
  };
}

import { ModalController } from '../js/controllers/modal-controller.js';

test('ModalController: instantiates and manages modal states', () => {
  const mockApp = { getActiveCase: () => null, user: { state: 'TX' } };
  const controller = new ModalController(mockApp);
  assert.ok(controller);
  assert.strictEqual(controller.app, mockApp);
  assert.strictEqual(controller._pendingEvidence, null);
});

test('ModalController: provides dialog management hooks', () => {
  const mockApp = { getActiveCase: () => null, user: { state: 'TX' } };
  const controller = new ModalController(mockApp);
  assert.strictEqual(typeof controller.initElements, 'function');
  assert.strictEqual(typeof controller.bindEvents, 'function');
});
