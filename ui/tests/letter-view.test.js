import test from 'node:test';
import assert from 'node:assert/strict';

import { renderLetterStudio, escapeHtml } from '../js/views/letter-view.js';
import { INITIAL_CASES, USER_PROFILE } from '../js/data/mock-dossiers.js';

test('escapeHtml: correctly sanitizes special characters', () => {
  assert.strictEqual(escapeHtml('<script>alert(1)</script>'), '&lt;script&gt;alert(1)&lt;/script&gt;');
  assert.strictEqual(escapeHtml(null), '');
});

test('renderLetterStudio: renders dispute workbench and formal demand letter', () => {
  const activeCase = INITIAL_CASES[0];
  const html = renderLetterStudio(activeCase, USER_PROFILE);
  assert.ok(html.includes('STANDARDIZED LEGAL BRIEF PREVIEW'));
  assert.ok(html.includes('15 U.S.C. § 1692g'));
  assert.ok(html.includes(activeCase.collectionAgency));
});
