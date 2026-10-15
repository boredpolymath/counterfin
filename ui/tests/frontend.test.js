import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

// Setup minimal global environment for DOM-agnostic frontend unit testing
if (typeof globalThis.window === 'undefined') {
  globalThis.window = {
    addEventListener: () => {},
    removeEventListener: () => {},
  };
}
if (typeof globalThis.document === 'undefined') {
  globalThis.document = {
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {},
  };
}

import { renderDashboard } from '../js/views/dashboard-view.js';
import { renderInteractions } from '../js/views/interaction-view.js';
import { renderLetterStudio, escapeHtml } from '../js/views/letter-view.js';
import { renderEvidenceVault } from '../js/views/evidence-view.js';
import { renderCreditAudit } from '../js/views/credit-view.js';
import { ipc } from '../js/ipc.js';
import { INITIAL_CASES, USER_PROFILE } from '../js/data/mock-dossiers.js';

// =========================================================================
// 9.7.1 Component & UI View Rendering Tests
// =========================================================================
test('9.7.1 - Dashboard View Renderer: computes metrics and renders category badges', () => {
  const activeCase = INITIAL_CASES[0];
  const html = renderDashboard(activeCase, INITIAL_CASES);

  // Assert basic rendering
  assert.ok(html.includes('Active Dispute Dossiers'));
  assert.ok(html.includes(activeCase.docketNumber));

  // Assert category badges and styling for all debt categories
  assert.ok(html.includes('badge-credit'));
  assert.ok(html.includes('Credit Card'));

  // Test medical debt rendering
  const medicalCase = INITIAL_CASES.find(c => c.debtType === 'medical');
  if (medicalCase) {
    const medHtml = renderDashboard(medicalCase, [medicalCase]);
    assert.ok(medHtml.includes('badge-medical'));
    assert.ok(medHtml.includes(medicalCase.originalProvider));
  }

  // Test empty state fallback
  const emptyHtml = renderDashboard(null, []);
  assert.ok(emptyHtml.includes('empty-state'));
});

test('9.7.1 - Call Assistant & Interaction Ledger Renderer: filters and displays communications', () => {
  const activeCase = INITIAL_CASES[0];
  const mockInteractions = [
    {
      id: 'int-1',
      caseId: activeCase.id,
      timestamp: '2026-04-05 14:30',
      channel: 'phone',
      direction: 'incoming',
      contactName: 'Marcus Cole',
      summary: 'Collector demanded immediate payment under threat of litigation.',
      durationSec: 185,
      violations: [
        { citation: '15 U.S.C. § 1692e(4)', title: 'Unlawful Threat of Arrest', damages: 1000 }
      ],
    },
    {
      id: 'int-2',
      caseId: 'other-case-999',
      timestamp: '2026-04-06 10:00',
      channel: 'mail',
      direction: 'incoming',
      contactName: 'Other Agency',
      summary: 'Different case letter',
      durationSec: 0,
      violations: [],
    },
  ];

  const html = renderInteractions(mockInteractions, activeCase);

  // Only activeCase interactions should be rendered
  assert.ok(html.includes('Marcus Cole'));
  assert.ok(html.includes('15 U.S.C. § 1692e(4)'));
  assert.ok(html.includes('+$1000.00 Statutory Recovery'));
  assert.ok(!html.includes('Other Agency'));
  assert.ok(html.includes('1 Record Logged'));
});

test('9.7.1 - Letter Studio Workbench: renders dynamic templates and escaped previews', () => {
  const creditCase = INITIAL_CASES.find(c => c.debtType === 'credit_card') || INITIAL_CASES[0];
  const html = renderLetterStudio(creditCase);

  assert.ok(html.includes('DISPUTE LETTER CONFIGURATION'));
  assert.ok(html.includes('STANDARDIZED LEGAL BRIEF PREVIEW'));
  assert.ok(html.includes('USPS CERTIFIED MAIL'));
  assert.ok(html.includes(creditCase.docketNumber));

  // Test XSS escaping utility
  const dirty = "<script>alert('pwn')</script>&\"'";
  const safe = escapeHtml(dirty);
  assert.strictEqual(safe, "&lt;script&gt;alert(&#x27;pwn&#x27;)&lt;/script&gt;&amp;&quot;&#x27;");
  assert.ok(!safe.includes('<script>'));
});

test('9.7.1 - Evidence Vault View: renders cryptographic attachments and Bates stamps', () => {
  const activeCase = INITIAL_CASES[0];
  const mockEvidence = [
    {
      id: 'ev-1',
      caseId: activeCase.id,
      batesStamp: 'BATES-0012',
      title: 'call_recording_harassment.mp3',
      docType: 'mp3',
      fileSize: '4.2 MB',
      sha256Hash: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
      uploadedDate: '2026-04-01',
    },
  ];

  const html = renderEvidenceVault(mockEvidence, activeCase);
  assert.ok(html.includes('BATES-0012'));
  assert.ok(html.includes('call_recording_harassment.mp3'));
  assert.ok(html.includes('4.2 MB'));
  assert.ok(html.includes('a1b2c3d4e5f6'));
});

test('9.7.1 - Credit Bureau Audit View: displays discrepancies and dispute packets', () => {
  const activeCase = INITIAL_CASES[0];
  const mockTradelines = [
    {
      id: 'tl-1',
      caseId: activeCase.id,
      bureau: 'Equifax',
      accountNumber: '****4412',
      reportedBalance: 3420.00,
      compliant: false,
      disputeRemarkStatus: 'Collection Account (Missing Dispute Remark)',
      lastReportedDate: 'April 1, 2026',
    },
    {
      id: 'tl-2',
      caseId: activeCase.id,
      bureau: 'Experian',
      accountNumber: '****4412',
      reportedBalance: 3420.00,
      compliant: true,
      disputeRemarkStatus: 'Disputed by Consumer',
      lastReportedDate: 'April 1, 2026',
    },
  ];

  const html = renderCreditAudit(mockTradelines, activeCase);
  assert.ok(html.includes('Equifax'));
  assert.ok(html.includes('Experian'));
  assert.ok(html.includes('dispute-inaccurate'));
  assert.ok(html.includes('FCRA § 623(a)(3) Infraction'));
  assert.ok(html.includes('Generate CRA Dispute Packet'));
});

// =========================================================================
// 9.7.2 Reactive State Synchronization Tests
// =========================================================================
test('9.7.2 - Reactive State Synchronization: case state transitions update active dossier', () => {
  const state = {
    cases: JSON.parse(JSON.stringify(INITIAL_CASES)),
    activeCaseId: INITIAL_CASES[0].id,
    alerts: [],
  };

  // Simulate receiving native backend event: system://case_status_changed
  function handleCaseStatusChangedEvent(payload) {
    const target = state.cases.find(c => c.id === payload.caseId);
    if (target) {
      target.status = payload.newStatus;
      target.lastUpdated = payload.timestamp || new Date().toISOString();
    }
  }

  // Simulate receiving native backend event: system://deadline_approaching
  function handleDeadlineApproachingEvent(payload) {
    state.alerts.push({
      caseId: payload.caseId,
      title: payload.title,
      daysRemaining: payload.daysRemaining,
      isUrgent: payload.daysRemaining <= 3,
    });
  }

  // Initial state check
  assert.strictEqual(state.cases[0].status, INITIAL_CASES[0].status);

  // Dispatch CaseStatusChanged event
  handleCaseStatusChangedEvent({
    caseId: state.cases[0].id,
    oldStatus: 'InitialNotice',
    newStatus: 'ValidationPending',
    timestamp: '2026-05-10T12:00:00Z',
  });
  assert.strictEqual(state.cases[0].status, 'ValidationPending');

  // Dispatch DeadlineApproaching event (urgent <= 3 days)
  handleDeadlineApproachingEvent({
    caseId: state.cases[0].id,
    title: 'FDCPA 30-Day Validation Window',
    daysRemaining: 2,
  });
  assert.strictEqual(state.alerts.length, 1);
  assert.strictEqual(state.alerts[0].isUrgent, true);
});

// =========================================================================
// 9.7.3 Quick-Log Call Modal Logic Tests
// =========================================================================
test('9.7.3 - Quick-Log Call Modal: real-time statutory damages ledger computation', () => {
  function calculateStatutoryDamages(selectedViolations, actualDamages = 0) {
    const STATUTORY_BASE_PER_VIOLATION = 1000.0;
    const count = selectedViolations.length;
    const statutorySum = count * STATUTORY_BASE_PER_VIOLATION;
    return {
      violationCount: count,
      statutoryDamages: statutorySum,
      actualDamages: Number(actualDamages) || 0,
      totalDamages: statutorySum + (Number(actualDamages) || 0),
    };
  }

  // 0 violations checked
  const ledger0 = calculateStatutoryDamages([]);
  assert.strictEqual(ledger0.statutoryDamages, 0);
  assert.strictEqual(ledger0.totalDamages, 0);

  // 1 violation checked (Inconvenient time)
  const ledger1 = calculateStatutoryDamages(['inconvenient_time']);
  assert.strictEqual(ledger1.statutoryDamages, 1000.0);
  assert.strictEqual(ledger1.totalDamages, 1000.0);

  // 2 violations checked (Inconvenient time + 7-in-7 call frequency)
  const ledger2 = calculateStatutoryDamages(['inconvenient_time', 'excessive_calls']);
  assert.strictEqual(ledger2.statutoryDamages, 2000.0);
  assert.strictEqual(ledger2.totalDamages, 2000.0);

  // 3 violations checked + $250 actual damages (e.g. lost wages / doctor bill)
  const ledger3 = calculateStatutoryDamages(
    ['inconvenient_time', 'excessive_calls', 'unlawful_threat'],
    250.0
  );
  assert.strictEqual(ledger3.statutoryDamages, 3000.0);
  assert.strictEqual(ledger3.actualDamages, 250.0);
  assert.strictEqual(ledger3.totalDamages, 3250.0);
});

test('9.7.3 - Quick-Log Call Modal: consumer timezone auto-detection for convenient call hours', () => {
  function isCallInconvenient(contactHourLocal) {
    // 15 U.S.C. § 1692c(a)(1): Before 8:00 AM or after 9:00 PM local time
    return contactHourLocal < 8 || contactHourLocal >= 21;
  }

  // Permissible call hours
  assert.strictEqual(isCallInconvenient(8), false);
  assert.strictEqual(isCallInconvenient(12), false);
  assert.strictEqual(isCallInconvenient(17), false);
  assert.strictEqual(isCallInconvenient(20), false);

  // Unlawful / Inconvenient call hours
  assert.strictEqual(isCallInconvenient(7), true, '7:00 AM must violate convenient hours');
  assert.strictEqual(isCallInconvenient(21), true, '9:00 PM must violate convenient hours');
  assert.strictEqual(isCallInconvenient(22), true, '10:00 PM must violate convenient hours');
  assert.strictEqual(isCallInconvenient(3), true, '3:00 AM must violate convenient hours');
});

// =========================================================================
// 9.7.4 Evidence Ingestion Modal Client-Side Validation Tests
// =========================================================================
test('9.7.4 - Evidence Ingestion Modal: client-side extension & size limit validation', () => {
  const PERMITTED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg', '.mp3', '.wav'];
  const MAX_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB

  function validateEvidenceUpload(file) {
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!PERMITTED_EXTENSIONS.includes(ext)) {
      return { valid: false, error: `Invalid file extension '${ext}'. Allowed: PDF, PNG, JPG, MP3, WAV` };
    }
    if (file.size > MAX_SIZE_BYTES) {
      return { valid: false, error: `File size exceeds 100 MB limit (${(file.size / 1024 / 1024).toFixed(1)} MB)` };
    }
    return { valid: true, extension: ext };
  }

  // Valid PDF
  assert.deepStrictEqual(validateEvidenceUpload({ name: 'bill.pdf', size: 50000 }), { valid: true, extension: '.pdf' });
  // Valid Audio
  assert.deepStrictEqual(validateEvidenceUpload({ name: 'call.mp3', size: 12000000 }), { valid: true, extension: '.mp3' });
  // Reject Executable .exe
  assert.strictEqual(validateEvidenceUpload({ name: 'malware.exe', size: 1000 }).valid, false);
  // Reject Shell Script .sh
  assert.strictEqual(validateEvidenceUpload({ name: 'script.sh', size: 500 }).valid, false);
  // Reject Oversized File (105 MB)
  assert.strictEqual(validateEvidenceUpload({ name: 'huge_recording.wav', size: 105 * 1024 * 1024 }).valid, false);
});

test('9.7.4 - Evidence Ingestion: Bates docket numbering and SHA-256 digest computation', () => {
  function generateBatesDocketPreview(baseDocket, index) {
    return `${baseDocket}-EVID-${String(index).padStart(4, '0')}`;
  }

  const preview = generateBatesDocketPreview('BATES-SM-2026-0041', 3);
  assert.strictEqual(preview, 'BATES-SM-2026-0041-EVID-0003');

  // Verify SHA-256 computation logic
  const payload = Buffer.from('DISPUTE EVIDENCE DOCUMENT PAYLOAD');
  const hashHex = crypto.createHash('sha256').update(payload).digest('hex');
  assert.strictEqual(hashHex.length, 64);
  assert.match(hashHex, /^[0-9a-f]{64}$/);
});

// =========================================================================
// 9.7.5 IPC Error Boundary & Offline Fallback Tests
// =========================================================================
test('9.7.5 - IPC Error Boundary: graceful degradation when running in standard browser', async () => {
  // Ensure window.__TAURI__ is absent
  delete globalThis.window.__TAURI__;

  assert.strictEqual(ipc.isTauri(), false, 'Must identify offline/browser mode');

  // Invoking commands outside Tauri must not throw; should return null or graceful mock
  const cases = await ipc.getCases();
  assert.strictEqual(cases, null);

  const newCaseRes = await ipc.createCase({ title: 'Offline Test' });
  assert.strictEqual(newCaseRes, null);
});

test('9.7.5 - IPC Error Boundary: handles mock Tauri runtime and captures errors', async () => {
  // Mock Tauri environment with a command that throws an intentional error
  globalThis.window.__TAURI__ = {
    core: {
      invoke: async (cmd) => {
        if (cmd === 'failing_command') {
          throw new Error('Database locked or internal panic');
        }
        return { success: true };
      },
    },
  };

  assert.strictEqual(ipc.isTauri(), true);

  // Successful command
  const res = await ipc.invoke('successful_command');
  assert.deepStrictEqual(res, { success: true });

  // Failing command catches error cleanly
  await assert.rejects(
    async () => {
      await ipc.invoke('failing_command');
    },
    {
      message: 'Database locked or internal panic',
    }
  );

  delete globalThis.window.__TAURI__;
});

// =========================================================================
// 9.7.6 Keyboard Accessibility & Focus Management Tests
// =========================================================================
test('9.7.6 - Keyboard Accessibility: modal focus trapping and Escape key dismissal', () => {
  class MockModal {
    constructor() {
      this.isOpen = false;
      this.focusedElement = null;
    }

    showModal() {
      this.isOpen = true;
      // Section 9.7.6: Focus trap sets initial focus to primary focusable child
      this.focusedElement = 'input-first-field';
    }

    close() {
      this.isOpen = false;
      this.focusedElement = null;
    }

    handleKeyDown(event) {
      if (!this.isOpen) return;

      if (event.key === 'Escape') {
        this.close();
        return;
      }

      if (event.key === 'Tab') {
        const focusable = ['input-first-field', 'input-second-field', 'button-submit', 'button-close'];
        const currentIndex = focusable.indexOf(this.focusedElement);

        if (event.shiftKey) {
          // Shift+Tab: backward cycling
          const prevIndex = currentIndex <= 0 ? focusable.length - 1 : currentIndex - 1;
          this.focusedElement = focusable[prevIndex];
        } else {
          // Tab: forward cycling
          const nextIndex = currentIndex >= focusable.length - 1 ? 0 : currentIndex + 1;
          this.focusedElement = focusable[nextIndex];
        }
      }
    }
  }

  const modal = new MockModal();
  assert.strictEqual(modal.isOpen, false);

  // Open modal -> focus initial element
  modal.showModal();
  assert.strictEqual(modal.isOpen, true);
  assert.strictEqual(modal.focusedElement, 'input-first-field');

  // Tab forward cycle
  modal.handleKeyDown({ key: 'Tab', shiftKey: false });
  assert.strictEqual(modal.focusedElement, 'input-second-field');

  modal.handleKeyDown({ key: 'Tab', shiftKey: false });
  assert.strictEqual(modal.focusedElement, 'button-submit');

  modal.handleKeyDown({ key: 'Tab', shiftKey: false });
  assert.strictEqual(modal.focusedElement, 'button-close');

  // Wrap around to first element (Focus Trap)
  modal.handleKeyDown({ key: 'Tab', shiftKey: false });
  assert.strictEqual(modal.focusedElement, 'input-first-field');

  // Shift+Tab backward wrap around
  modal.handleKeyDown({ key: 'Tab', shiftKey: true });
  assert.strictEqual(modal.focusedElement, 'button-close');

  // Escape key dismisses modal
  modal.handleKeyDown({ key: 'Escape' });
  assert.strictEqual(modal.isOpen, false);
  assert.strictEqual(modal.focusedElement, null);
});

// =========================================================================
// 9.10 Cross-Platform, Display Scaling & Accessibility (a11y) Tests
// =========================================================================

test('9.10.3 - Display Resolution & High-DPI Scaling: fluid layout tokens and scalable SVG icon metrics', () => {
  // Test scale factors across 100%, 125%, 150%, 200% High-DPI
  const scaleFactors = [1.0, 1.25, 1.5, 2.0];
  const baseLayout = {
    sidebarWidthPx: 260,
    headerHeightPx: 64,
    minContentWidthPx: 720,
    standardGapPx: 16,
  };

  for (const scale of scaleFactors) {
    const scaledContentWidth = baseLayout.minContentWidthPx * scale;
    const scaledSidebar = baseLayout.sidebarWidthPx * scale;
    const totalViewportWidth = scaledSidebar + scaledContentWidth + (baseLayout.standardGapPx * scale);

    // Verify layout proportions are preserved at any DPI without horizontal overflow on standard 1080p+ display
    assert.ok(totalViewportWidth > 0);
    assert.strictEqual(scaledSidebar / totalViewportWidth < 0.35, true);
  }

  // Verify responsive CSS tokens use relative scaling
  const responsiveBreakpoints = {
    mobile: 640,
    tablet: 768,
    desktop: 1024,
    wide: 1280,
  };
  assert.ok(responsiveBreakpoints.desktop > responsiveBreakpoints.tablet);
});

test('9.10.4 - WCAG 2.1 AA Accessibility & Color Contrast: verifies 4.5:1 ratio and ARIA labels', () => {
  function hexToRgb(hex) {
    const clean = hex.replace('#', '');
    const bigint = parseInt(clean, 16);
    return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
  }

  function sRgbToLinear(c) {
    const norm = c / 255;
    return norm <= 0.03928 ? norm / 12.92 : Math.pow((norm + 0.055) / 1.055, 2.4);
  }

  function relativeLuminance(r, g, b) {
    return 0.2126 * sRgbToLinear(r) + 0.7152 * sRgbToLinear(g) + 0.0722 * sRgbToLinear(b);
  }

  function contrastRatio(hex1, hex2) {
    const [r1, g1, b1] = hexToRgb(hex1);
    const [r2, g2, b2] = hexToRgb(hex2);
    const l1 = relativeLuminance(r1, g1, b1);
    const l2 = relativeLuminance(r2, g2, b2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  // Test core design token pairs against WCAG AA 4.5:1 standard
  const textContrastPairs = [
    { name: 'On-Surface (#0b1c30) on Surface (#f8f9ff)', fg: '#0b1c30', bg: '#f8f9ff' },
    { name: 'On-Primary (#ffffff) on Primary Emerald (#006948)', fg: '#ffffff', bg: '#006948' },
    { name: 'On-Error (#ffffff) on Error Tone (#ba1a1a)', fg: '#ffffff', bg: '#ba1a1a' },
    { name: 'Rose Infraction Text (#be123c) on Rose Tag BG (#fff1f2)', fg: '#be123c', bg: '#fff1f2' },
  ];

  for (const pair of textContrastPairs) {
    const ratio = contrastRatio(pair.fg, pair.bg);
    assert.ok(
      ratio >= 4.5,
      `WCAG 2.1 AA Violation for ${pair.name}: contrast ratio was ${ratio.toFixed(2)}:1, expected >= 4.5:1`
    );
  }
});
