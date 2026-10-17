import test from 'node:test';
import assert from 'node:assert/strict';

import { renderDashboard } from '../js/views/dashboard-view.js';
import { INITIAL_CASES } from '../js/data/mock-dossiers.js';

test('renderDashboard: renders all active dispute cards and overview metrics', () => {
  const activeCase = INITIAL_CASES[0];
  const html = renderDashboard(activeCase, INITIAL_CASES);
  assert.ok(html.includes('Active Dispute Dossiers'));
  assert.ok(html.includes(activeCase.docketNumber));
});

test('renderDashboard: renders empty dashboard when no cases exist', () => {
  const html = renderDashboard(null, []);
  assert.ok(html.includes('Welcome to DebtShark'));
  assert.ok(html.includes('Log Your First Notice'));
});
