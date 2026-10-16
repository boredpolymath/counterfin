import test from 'node:test';
import assert from 'node:assert/strict';

if (typeof globalThis.window === 'undefined') {
  globalThis.window = { addEventListener: () => {}, print: () => {} };
}
if (typeof globalThis.document === 'undefined') {
  globalThis.document = {
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {},
  };
}

import { LetterController } from '../js/controllers/letter-controller.js';

test('LetterController: instantiates with app reference', () => {
  const mockApp = { getActiveCase: () => null, openNewDisputeModal: () => {} };
  const controller = new LetterController(mockApp);
  assert.ok(controller);
  assert.strictEqual(controller.app, mockApp);
});

test('LetterController: bindLetterEvents safely executes without DOM crash', () => {
  const mockApp = { getActiveCase: () => null, openNewDisputeModal: () => {} };
  const controller = new LetterController(mockApp);
  assert.doesNotThrow(() => {
    controller.bindLetterEvents(null);
    controller.bindInputSync();
    controller.bindExportActions(null);
    controller.bindTemplateChange(null);
  });
});
