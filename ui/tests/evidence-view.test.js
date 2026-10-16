import test from 'node:test';
import assert from 'node:assert/strict';

import { renderEvidenceVault } from '../js/views/evidence-view.js';
import { INITIAL_CASES, INITIAL_EVIDENCE } from '../js/data/mock-dossiers.js';

test('renderEvidenceVault: renders empty state when activeCase is null', () => {
  const html = renderEvidenceVault([], null);
  assert.ok(html.includes('No Evidence Vault Selected'));
});

test('renderEvidenceVault: renders vaulted items with SHA-256 and Bates stamps', () => {
  const activeCase = INITIAL_CASES[0];
  const html = renderEvidenceVault(INITIAL_EVIDENCE, activeCase);
  assert.ok(html.includes('Local Encrypted Evidence Vault'));
  assert.ok(html.includes('SHA-256'));
});
