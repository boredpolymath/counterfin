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

// =========================================================================
// Error & Edge Case Tests
// =========================================================================

test('Mock Dossiers (Edge Case): validates non-negative balance invariants across all cases', () => {
  for (const c of INITIAL_CASES) {
    assert.ok(c.disputedBalance >= 0);
    assert.ok(c.originalBalance >= 0);
  }
});

test('Mock Dossiers (Error Case): rejects malformed case records with missing mandatory fields', () => {
  function validateCaseRecord(item) {
    if (!item.id || typeof item.id !== 'string') throw new Error('Missing or invalid case id');
    if (!item.docketNumber || !item.docketNumber.startsWith('BATES-')) throw new Error('Invalid Bates docket number');
    if (typeof item.disputedBalance !== 'number' || isNaN(item.disputedBalance)) throw new Error('Invalid disputed balance');
    return true;
  }

  // Edge cases and error states
  assert.throws(() => validateCaseRecord({ id: null }), /Missing or invalid case id/);
  assert.throws(() => validateCaseRecord({ id: 'c1', docketNumber: 'INVALID' }), /Invalid Bates docket number/);
  assert.throws(() => validateCaseRecord({ id: 'c1', docketNumber: 'BATES-1', disputedBalance: 'NaN' }), /Invalid disputed balance/);
});

test('Mock Dossiers (Error Case): validates SHA-256 hex digest integrity and rejects corrupted hashes', () => {
  const hexRegex = /^[0-9a-f]{64}$/i;
  
  // Verify valid fixtures
  for (const ev of INITIAL_EVIDENCE) {
    assert.ok(hexRegex.test(ev.sha256Hash));
  }

  // Verify rejection of corrupted/invalid digests
  function validateSha256(hash) {
    if (!hexRegex.test(hash)) throw new Error('Corrupted or invalid SHA-256 digest');
    return true;
  }
  assert.throws(() => validateSha256('short_hash'), /Corrupted or invalid/);
  assert.throws(() => validateSha256(`g${'0'.repeat(63)}`), /Corrupted or invalid/);
  assert.throws(() => validateSha256(''), /Corrupted or invalid/);
});

test('Mock Dossiers (Edge Case): verifies FDCPA statutory countdown window boundaries', () => {
  for (const c of INITIAL_CASES) {
    // 30-day statutory window boundary check
    assert.ok(c.statutoryDaysRemaining <= 30);
    assert.ok(c.statutoryDaysRemaining >= 0);
  }
});

test('Mock Dossiers (Error Case): rejects invalid interaction direction or channel types', () => {
  const validDirections = new Set(['Incoming', 'Outgoing']);
  const validChannels = new Set(['Phone', 'Mail', 'Voicemail', 'In-Person']);

  function validateInteraction(intItem) {
    if (!validDirections.has(intItem.direction)) throw new Error('Invalid interaction direction');
    if (!validChannels.has(intItem.channel)) throw new Error('Invalid interaction channel');
    return true;
  }

  for (const item of INITIAL_INTERACTIONS) {
    assert.ok(validateInteraction(item));
  }

  assert.throws(() => validateInteraction({ direction: 'Unknown', channel: 'Phone' }), /Invalid interaction direction/);
  assert.throws(() => validateInteraction({ direction: 'Incoming', channel: 'Telepathy' }), /Invalid interaction channel/);
});
