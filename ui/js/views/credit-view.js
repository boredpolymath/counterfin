/**
 * SettleMint Credit Bureau Delta Auditing View
 * Cross-references trade lines against active dispute cases, flags inaccuracies, and bundles dispute packets
 */

export function renderCreditAudit(tradelines, activeCase) {
  if (!activeCase) {
    return `
      <div class="empty-state-card" style="background:#ffffff; border:1px dashed var(--color-border-standard); border-radius:var(--radius-xl); padding:60px 24px; text-align:center; max-width:600px; margin:40px auto;">
        <div style="width:48px; height:48px; border-radius:12px; background:var(--color-primary-mint-wash); color:var(--color-primary); display:inline-flex; align-items:center; justify-content:center; margin-bottom:16px;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
        </div>
        <h3 style="font-size:18px; font-weight:700; color:#0f172a; margin-bottom:8px;">No Credit Audit Account Selected</h3>
        <p style="font-size:14px; color:#64748b; margin-bottom:20px; line-height:1.5;">Select a dispute case from your dashboard to audit associated credit bureau trade lines.</p>
        <button type="button" class="btn btn-pill-primary" id="creditEmptyNewCaseBtn">+ Open New Dispute</button>
      </div>
    `;
  }

  const caseTradelines = (tradelines || []).filter(t => t.caseId === activeCase.id);

  const cards = caseTradelines.length > 0 ? caseTradelines.map(item => `
    <div class="tradeline-card ${!item.compliant ? 'dispute-inaccurate' : ''}">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
        <div style="display:flex; align-items:center; gap:10px;">
          <div style="width:32px; height:32px; border-radius:8px; background:var(--color-primary-mint-wash); color:var(--color-primary); display:flex; align-items:center; justify-content:center; font-weight:800; font-size:12px;">
            ${item.bureau ? item.bureau.charAt(0) : 'B'}
          </div>
          <div>
            <div style="font-size:14px; font-weight:700; color:#0f172a; text-transform:uppercase; letter-spacing:0.02em;">
              ${item.bureau}
            </div>
            <div style="font-family:var(--font-family-mono); font-size:11px; color:#64748b;">
              Account #${item.accountNumber}
            </div>
          </div>
        </div>
        <div>
          ${item.compliant 
            ? `<span class="status-pill status-pill-mint">✓ Compliant (Disputed)</span>` 
            : `<span class="status-pill status-pill-rose">⚠️ FCRA / FDCPA Inaccuracy</span>`
          }
        </div>
      </div>

      <div class="tradeline-data-strip">
        <div>
          <span style="font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.04em; color:#64748b;">Reported Balance</span>
          <div style="font-family:var(--font-family-mono); font-size:16px; font-weight:700; color:#0f172a; margin-top:2px;">
            $${item.reportedBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div>
          <span style="font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.04em; color:#64748b;">Tradeline Remark</span>
          <div style="font-size:12.5px; font-weight:600; color:${item.compliant ? '#006948' : '#e11d48'}; margin-top:2px;">
            ${item.disputeRemarkStatus}
          </div>
        </div>
        <div>
          <span style="font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.04em; color:#64748b;">Last Reported</span>
          <div style="font-family:var(--font-family-mono); font-size:12.5px; color:#334155; margin-top:2px;">
            ${item.lastReportedDate}
          </div>
        </div>
      </div>

      ${!item.compliant ? `
        <div class="tradeline-infraction-alert">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0; margin-top:1px;">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <div>
            <strong>FCRA § 623(a)(3) Infraction:</strong> Collector was notified in writing that this balance is disputed, but furnished inaccurate data or failed to communicate dispute status to ${item.bureau}.
          </div>
        </div>
      ` : ''}

      <div style="display:flex; justify-content:flex-end; gap:8px; flex-wrap:wrap; margin-top:4px;">
        <button class="btn-pill-outline btn-sm" style="font-size:11px;">Diff Historical Snapshot</button>
        <button class="btn-pill-primary btn-sm" style="font-size:11px;">Generate CRA Dispute Packet</button>
      </div>
    </div>
  `).join("") : `
    <div style="background:#ffffff; border:1px dashed var(--color-border-standard); border-radius:var(--radius-xl); padding:40px 24px; text-align:center;">
      <div style="width:48px; height:48px; border-radius:50%; background:var(--color-primary-mint-wash); color:var(--color-primary); display:inline-flex; align-items:center; justify-content:center; margin-bottom:12px;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
        </svg>
      </div>
      <div style="font-size:15px; font-weight:700; color:#0f172a; margin-bottom:4px;">No Tradeline Audits On File</div>
      <div style="font-size:12.5px; color:#64748b; max-width:440px; margin:0 auto 16px auto;">Ingest credit report disclosures from Experian, TransUnion, or Equifax to run automated delta audits.</div>
      <button class="btn-pill-primary btn-sm" onclick="document.getElementById('importCreditReportBtn')?.click()">+ Ingest Credit Report</button>
    </div>
  `;

  return `
    <div style="display: flex; flex-direction: column; gap: var(--space-md);">
      <div class="orderly-view-header">
        <div class="view-header-left">
          <div class="view-header-icon-badge">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 3v18h18"/>
              <path d="m19 9-5 5-4-4-3 3"/>
            </svg>
          </div>
          <div>
            <div class="view-header-title">
              Credit Bureau Delta Audit
              <span class="status-pill status-pill-mint" style="font-size:11px; margin-left:8px;">Cross-Referencing 3 Major Bureaus</span>
            </div>
            <div class="view-header-subtitle">
              <span>Active Dossier:</span>
              <strong style="color: #334155;">${activeCase.originalProvider || activeCase.collectionAgency}</strong>
              <span>•</span>
              <span class="label-code" style="font-size: 11px;">${activeCase.docketNumber || activeCase.id}</span>
              <span>•</span>
              <span>Collector: ${activeCase.collectionAgency}</span>
            </div>
          </div>
        </div>
        <div class="view-header-actions">
          <button class="btn-pill-primary btn-sm" id="importCreditReportBtn">+ Ingest Credit Report JSON/XML</button>
        </div>
      </div>

      <div class="credit-audit-grid">
        ${cards}
      </div>
    </div>
  `;
}
