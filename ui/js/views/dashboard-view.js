/**
 * SettleMint Dashboard View
 * Renders case overview, state machine progression, creditor profiles, and urgent procedural tasks
 */

export function renderDashboard(activeCase) {
  if (!activeCase) {
    return `<div class="empty-state">No active case selected.</div>`;
  }

  const phases = [
    { key: "InitialNotice", label: "1. INITIAL NOTICE" },
    { key: "ValidationPending", label: "2. VALIDATION PENDING" },
    { key: "CollectorResponded", label: "3. COLLECTOR RESPONDED" },
    { key: "DisputeEscalated", label: "4. DISPUTE ESCALATED" },
    { key: "DebtSettled", label: "5. DEBT SETTLED" },
    { key: "DebtDismissed", label: "6. DISMISSED" },
    { key: "InLitigation", label: "7. IN LITIGATION" }
  ];

  const currentIdx = phases.findIndex(p => p.key === activeCase.currentPhase);

  const phaseNodes = phases.map((p, idx) => {
    let cls = "state-node";
    if (idx < currentIdx) cls += " completed";
    else if (idx === currentIdx) cls += " current";
    return `<div class="${cls}">${p.label}</div>`;
  }).join("");

  return `
    <div class="overview-dossier-card">
      <div class="dossier-header-band">
        <div>
          <span class="label-caps">CASE DOSSIER IDENTIFIER:</span>
          <span class="label-code" style="font-weight:700; margin-left: 6px;">${activeCase.docketNumber}</span>
        </div>
        <div style="display:flex; gap: 8px; align-items:center;">
          <span class="specimen-chip chip-compliant">STATUS: ${activeCase.currentPhase.toUpperCase()}</span>
          <span class="specimen-chip">JURISDICTION: ${activeCase.statuteState}</span>
        </div>
      </div>

      <!-- State Machine Lifecycle Track -->
      <span class="label-caps">STATUTORY STATE MACHINE:</span>
      <div class="state-machine-track">
        ${phaseNodes}
      </div>

      <!-- Detailed Entity Profile Grid -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); margin-top: var(--space-md);">
        <!-- Original Medical Provider Profile -->
        <div style="border: 1px solid var(--color-border-standard); padding: var(--space-sm); background-color: var(--color-surface-container-low);">
          <div style="display:flex; justify-content:space-between; margin-bottom: 6px;">
            <span class="label-caps">ORIGINAL CREDITOR / HEALTHCARE PROVIDER</span>
            <span class="label-code">HIPAA RESTRICTED</span>
          </div>
          <h3 style="font-size: 15px; font-weight: 700; margin-bottom: 4px;">${activeCase.originalProvider}</h3>
          <div class="date-row" style="margin-bottom: 4px;">
            <span class="date-label">ACCOUNT / MRN REFERENCE:</span>
            <span class="date-value label-code">${activeCase.originalAccountNumber}</span>
          </div>
          <div class="date-row">
            <span class="date-label">DATE OF CLINICAL SERVICE:</span>
            <span class="date-value label-code">${activeCase.dateOfService}</span>
          </div>
        </div>

        <!-- Collection Agency Profile -->
        <div style="border: 1px solid var(--color-border-standard); padding: var(--space-sm); background-color: var(--color-surface-container-low);">
          <div style="display:flex; justify-content:space-between; margin-bottom: 6px;">
            <span class="label-caps">THIRD-PARTY COLLECTION AGENCY</span>
            <span class="label-code">FDCPA REGULATED</span>
          </div>
          <h3 style="font-size: 15px; font-weight: 700; margin-bottom: 4px;">${activeCase.collectionAgency}</h3>
          <div class="date-row" style="margin-bottom: 4px;">
            <span class="date-label">AGENCY FILE REFERENCE:</span>
            <span class="date-value label-code">${activeCase.collectionAccountNumber}</span>
          </div>
          <div class="date-row">
            <span class="date-label">INITIAL CONTACT DATE:</span>
            <span class="date-value label-code">${activeCase.initialNoticeDate}</span>
          </div>
        </div>
      </div>

      <!-- Financial Ledger Inset -->
      <div style="margin-top: var(--space-md); border: 1px solid var(--color-border-authoritative); padding: var(--space-md); background: #ffffff;">
        <span class="label-caps">EVIDENTIARY BALANCE ACCOUNTING</span>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-sm); margin-top: 8px;">
          <div>
            <span class="date-label">ALLEGED BALANCE:</span>
            <div class="label-code" style="font-size: 18px; font-weight: 700;">$${activeCase.originalBalance.toFixed(2)}</div>
          </div>
          <div>
            <span class="date-label">DISPUTED BALANCE:</span>
            <div class="label-code highlight-danger" style="font-size: 18px; font-weight: 700;">$${activeCase.disputedBalance.toFixed(2)}</div>
          </div>
          <div>
            <span class="date-label">POTENTIAL STATUTORY PENALTY:</span>
            <div class="label-code text-danger" style="font-size: 18px; font-weight: 700;">$${activeCase.potentialDamages.toFixed(2)}</div>
          </div>
          <div>
            <span class="date-label">VERIFIED PAY-FOR-DELETE TARGET:</span>
            <div class="label-code" style="font-size: 18px; font-weight: 700; color: #10b981;">$0.00 (DISMISSAL)</div>
          </div>
        </div>
      </div>

      <!-- Procedural Action Directive -->
      <div style="margin-top: var(--space-md); padding: var(--space-sm); border-left: 3px solid var(--color-primary-slate); background-color: var(--color-surface-container-low);">
        <span class="label-caps">NEXT MANDATORY PROCEDURAL STEP:</span>
        <p style="font-size: 13px; margin-top: 4px; line-height: 1.4;">
          Validation demand delivered on <strong>${activeCase.certifiedMailDeliveredDate || "PENDING"}</strong>. Collection activities must remain stayed under 15 U.S.C. § 1692g(b) until verification is furnished. If telephone or credit reporting occurs during this window, log violation immediately.
        </p>
      </div>
    </div>
  `;
}
