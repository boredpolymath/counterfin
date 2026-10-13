/**
 * SettleMint Credit Bureau Delta Auditing View
 * Cross-references trade lines against active dispute cases, flags inaccuracies, and bundles dispute packets
 */

export function renderCreditAudit(tradelines, activeCase) {
  const caseTradelines = tradelines.filter(t => t.caseId === activeCase.id);

  const cards = caseTradelines.map(item => `
    <div class="tradeline-card ${!item.compliant ? 'dispute-inaccurate' : ''}">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <strong style="font-size:14px; text-transform:uppercase;">${item.bureau}</strong>
          <span class="label-code" style="color:var(--color-tertiary-light);">${item.accountNumber}</span>
        </div>
        <div>
          ${item.compliant 
            ? `<span class="specimen-chip chip-compliant">COMPLIANT (DISPUTED)</span>` 
            : `<span class="specimen-chip chip-violation">■ FCRA / FDCPA INACCURACY</span>`
          }
        </div>
      </div>

      <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:var(--space-sm); background-color:var(--color-surface-container-low); padding:var(--space-sm); border:1px solid var(--color-border-standard); margin-bottom:8px;">
        <div>
          <span class="date-label">REPORTED BALANCE:</span>
          <div class="label-code" style="font-weight:700;">$${item.reportedBalance.toFixed(2)}</div>
        </div>
        <div>
          <span class="date-label">TRADE LINE REMARK:</span>
          <div class="label-code">${item.disputeRemarkStatus}</div>
        </div>
        <div>
          <span class="date-label">LAST REPORTED:</span>
          <div class="label-code">${item.lastReportedDate}</div>
        </div>
      </div>

      ${!item.compliant ? `
        <div style="padding:6px; background-color:var(--color-secondary-container); border-left:2px solid var(--color-secondary); font-size:11px; color:var(--color-secondary-deep); margin-bottom:8px;">
          <strong>FCRA § 623(a)(3) INFRACTION:</strong> Collector was notified in writing that debt is disputed, but failed to furnish notice of dispute to ${item.bureau}.
        </div>
      ` : ''}

      <div style="display:flex; justify-content:flex-end; gap:8px;">
        <button class="btn btn-secondary-evidentiary" style="font-size:10px; padding:4px 8px;">DIFF HISTORICAL SNAPSHOT</button>
        <button class="btn btn-primary" style="font-size:10px; padding:4px 8px;">GENERATE CRA DISPUTE PACKET</button>
      </div>
    </div>
  `).join("");

  return `
    <div style="display: flex; flex-direction: column; gap: var(--space-md);">
      <div style="display: flex; justify-content: space-between; align-items: center; background-color: var(--color-surface-container-low); padding: var(--space-xs) var(--space-sm); border: 1px solid var(--color-border-medium);">
        <div>
          <span class="label-caps">CREDIT BUREAU DELTA AUDIT</span>
          <span class="label-code" style="margin-left: 8px;">CROSS-REFERENCING 3 MAJOR BUREAUS</span>
        </div>
        <button class="btn btn-secondary-evidentiary" id="importCreditReportBtn">+ INGEST CREDIT REPORT JSON/XML</button>
      </div>

      <div class="credit-audit-grid">
        ${cards}
      </div>
    </div>
  `;
}
