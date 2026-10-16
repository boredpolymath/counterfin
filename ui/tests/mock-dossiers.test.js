import test from 'node:test';
import assert from 'node:assert/strict';

import {
  INITIAL_CASES,
  INITIAL_INTERACTIONS,
  INITIAL_EVIDENCE,
  INITIAL_CREDIT_TRADELINES,
  USER_PROFILE
} from '../js/data/mock-dossiers.js';

test('Mock Dossiers: INITIAL_CASES contains valid debt records with required fields', () => {
  assert.ok(Array.isArray(INITIAL_CASES));
  assert.ok(INITIAL_CASES.length > 0);
  for (const c of INITIAL_CASES) {
    assert.ok(c.id);
    assert.ok(c.docketNumber);
    assert.ok(c.debtorName);
    assert.ok(c.collectionAgency);
    assert.ok(typeof c.disputedBalance === 'number');
    assert.ok(typeof c.statutoryDaysRemaining === 'number');
  }
});

test('Mock Dossiers: INITIAL_INTERACTIONS contains valid communication logs', () => {
  assert.ok(Array.isArray(INITIAL_INTERACTIONS));
  assert.ok(INITIAL_INTERACTIONS.length > 0);
  for (const item of INITIAL_INTERACTIONS) {
    assert.ok(item.id);
    assert.ok(item.caseId);
    assert.ok(item.channel);
    assert.ok(item.timestamp);
  }
});

test('Mock Dossiers: INITIAL_EVIDENCE contains NIST SHA-256 hashes and Bates stamps', () => {
  assert.ok(Array.isArray(INITIAL_EVIDENCE));
  for (const ev of INITIAL_EVIDENCE) {
    assert.ok(ev.id);
    assert.ok(ev.caseId);
    assert.ok(ev.batesStamp);
    assert.strictEqual(ev.sha256Hash.length, 64);
  }
});

test('Mock Dossiers: USER_PROFILE has default profile settings', () => {
  assert.ok(USER_PROFILE.name);
  assert.ok(USER_PROFILE.statuteState);
});

test('Mock Dossiers: INITIAL_CREDIT_TRADELINES contains credit trade lines', () => {
  assert.ok(Array.isArray(INITIAL_CREDIT_TRADELINES));
  assert.ok(INITIAL_CREDIT_TRADELINES.length > 0);
});
