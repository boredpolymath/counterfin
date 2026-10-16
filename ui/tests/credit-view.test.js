import test from 'node:test';
import assert from 'node:assert/strict';

import { renderCreditAudit } from '../js/views/credit-view.js';
import { INITIAL_CASES, INITIAL_CREDIT_TRADELINES } from '../js/data/mock-dossiers.js';

test('renderCreditAudit: renders empty state when no active case is selected', () => {
  const html = renderCreditAudit([], null);
  assert.ok(html.includes('No Credit Audit Account Selected'));
});

test('renderCreditAudit: renders tradelines and FCRA dispute analysis', () => {
  const activeCase = INITIAL_CASES[0];
  const html = renderCreditAudit(INITIAL_CREDIT_TRADELINES, activeCase);
  assert.ok(html.includes('Credit Bureau Delta Audit'));
  assert.ok(html.includes(activeCase.collectionAgency));
});
