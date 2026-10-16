import test from 'node:test';
import assert from 'node:assert/strict';

import { renderInteractions } from '../js/views/interaction-view.js';
import { INITIAL_CASES, INITIAL_INTERACTIONS } from '../js/data/mock-dossiers.js';

test('renderInteractions: renders empty state when activeCase is null', () => {
  const html = renderInteractions([], null);
  assert.ok(html.includes('No Active Dossier Selected'));
});

test('renderInteractions: renders communication records and Regulation F metrics', () => {
  const activeCase = INITIAL_CASES[0];
  const html = renderInteractions(INITIAL_INTERACTIONS, activeCase);
  assert.ok(html.includes('Call Assistant & Interaction Ledger'));
  assert.ok(html.includes('Record Correspondence'));
});
