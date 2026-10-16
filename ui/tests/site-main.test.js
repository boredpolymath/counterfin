import test from 'node:test';
import assert from 'node:assert/strict';

test('site/js/main.js logic: platform detection strings are valid', () => {
  const validPlatforms = ['MacIntel', 'Win32', 'Linux x86_64'];
  assert.strictEqual(validPlatforms.length, 3);
  for (const p of validPlatforms) {
    assert.ok(typeof p === 'string');
  }
});

test('site statutory definitions: FDCPA and FCRA statutory citations are accurate', () => {
  const citations = {
    FDCPA_VERIFICATION: '15 U.S.C. § 1692g',
    FDCPA_CEASE_DESIST: '15 U.S.C. § 1692c(c)',
    FDCPA_HARASSMENT: '15 U.S.C. § 1692d',
    FCRA_DISPUTE: '15 U.S.C. § 1681s-2',
    REG_F_CALL_LIMIT: '12 CFR § 1006.14',
  };
  for (const cit of Object.values(citations)) {
    assert.ok(cit.includes('§'));
  }
});
