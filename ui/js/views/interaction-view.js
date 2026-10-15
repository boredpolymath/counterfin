/**
 * SettleMint Chronological Interaction Stream
 * Renders communication ledger, FDCPA violation flags, and call transcription notes
 */

export function renderInteractions(interactions, activeCase) {
  if (!activeCase) {
    return `
      <div class="empty-state-card" style="background:#ffffff; border:1px dashed var(--color-border-standard); border-radius:var(--radius-xl); padding:60px 24px; text-align:center; max-width:600px; margin:40px auto;">
        <div style="width:48px; height:48px; border-radius:12px; background:var(--color-primary-mint-wash); color:var(--color-primary); display:inline-flex; align-items:center; justify-content:center; margin-bottom:16px;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
        </div>
        <h3 style="font-size:18px; font-weight:700; color:#0f172a; margin-bottom:8px;">No Active Dossier Selected</h3>
        <p style="font-size:14px; color:#64748b; margin-bottom:20px; line-height:1.5;">Select a dispute case or open a new one to log debt collection phone calls, letters, and statutory violations.</p>
        <button type="button" class="btn btn-pill-primary" id="interactionEmptyNewCaseBtn">+ Open New Dispute</button>
      </div>
    `;
  }

  const caseInteractions = (interactions || []).filter(i => i.caseId === activeCase.id);

  const headerHtml = `
    <div class="orderly-view-header">
      <div class="view-header-left">
        <div class="view-header-icon-badge">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#006948" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
        </div>
        <div class="view-header-text">
          <div class="view-header-title">
            <span>Call Assistant & Interaction Ledger</span>
            <span class="status-pill status-pill-mint" style="font-size: 11px; padding: 2px 8px;">
              <span class="status-dot status-dot-mint"></span>
              ${caseInteractions.length} ${caseInteractions.length === 1 ? 'Record' : 'Records'} Logged
            </span>
          </div>
          <div class="view-header-subtitle">
            <span>Active Dossier:</span>
            <strong style="color: #334155;">${activeCase.originalProvider}</strong>
            <span>•</span>
            <span class="label-code" style="font-size: 11px;">${activeCase.docketNumber}</span>
            <span>•</span>
            <span>Collector: ${activeCase.collectionAgency}</span>
          </div>
        </div>
      </div>
      <div class="view-header-actions">
        <button class="btn btn-pill-primary btn-sm" id="addInteractionLogBtn">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          <span>Record Correspondence</span>
        </button>
      </div>
    </div>
  `;

  if (caseInteractions.length === 0) {
    return `
      <div style="display: flex; flex-direction: column;">
        ${headerHtml}
        <div class="empty-state" style="padding: 48px 24px; text-align: center; background-color: #ffffff; border: 1px dashed var(--color-border-medium); border-radius: var(--radius-xl); box-shadow: var(--shadow-level-1);">
          <div class="view-header-icon-badge" style="margin: 0 auto 14px auto; width: 48px; height: 48px;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#006948" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
          </div>
          <h3 style="font-family: var(--font-family-display); font-size: 16px; font-weight: 700; color: #0b1c30; margin-bottom: 6px;">No Communications Logged Yet</h3>
          <p style="font-size: 13px; color: #64748b; max-width: 460px; margin: 0 auto 16px auto; line-height: 1.5;">
            Use the Quick Call Script in the sidebar when debt collectors contact you, or record past phone calls and letters to track statutory FDCPA violations.
          </p>
        </div>
      </div>
    `;
  }

  const items = caseInteractions.map(item => {
    const hasViolation = item.violations && item.violations.length > 0;
    const isIncoming = item.direction === 'Incoming';
    const violationHtml = hasViolation ? `
      <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 2px;">
        ${item.violations.map(v => `
          <div class="violation-card-row">
            <div class="violation-card-left">
              <span class="status-pill status-pill-rose" style="font-size: 11px; padding: 2px 8px;">
                <span class="status-dot status-dot-rose"></span>
                Statutory Infraction
              </span>
              <strong style="font-size: 12px; color: #881337; font-family: var(--font-family-mono);">${v.citation}</strong>
              <span style="font-size: 12px; color: #4c0519;">${v.title}</span>
            </div>
            <span class="violation-damages-tag">+$${v.damages.toFixed(2)} Statutory Recovery</span>
          </div>
        `).join("")}
      </div>
    ` : "";

    return `
      <div class="interaction-item ${hasViolation ? "has-violation" : ""}">
        <div class="interaction-header">
          <div class="interaction-meta">
            <span class="status-pill ${isIncoming ? 'status-pill-amber' : 'status-pill-mint'}">
              <span class="status-dot ${isIncoming ? 'status-dot-amber' : 'status-dot-mint'}"></span>
              ${item.direction.toUpperCase()} (${item.channel.toUpperCase()})
            </span>
            <span class="label-code" style="font-weight: 700; color: #334155; font-size: 12px;">${item.timestamp}</span>
            <span style="font-size: 12px; color: #64748b;">•</span>
            <span style="font-size: 12px; color: #475569; font-weight: 500;">Contact: <strong style="color: #0f172a;">${item.contactName}</strong></span>
          </div>
          <div>
            ${item.durationSec > 0 ? `
              <span class="status-pill status-pill-neutral" style="font-family: var(--font-family-mono); font-size: 11px;">
                Duration: ${Math.floor(item.durationSec / 60)}m ${item.durationSec % 60}s
              </span>
            ` : ''}
          </div>
        </div>

        <div class="interaction-notes">
          ${item.summary}
        </div>

        ${violationHtml}
      </div>
    `;
  }).join("");

  return `
    <div style="display: flex; flex-direction: column;">
      ${headerHtml}
      <div class="stream-timeline">
        ${items}
      </div>
    </div>
  `;
}
