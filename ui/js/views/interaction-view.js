/**
 * SettleMint Chronological Interaction Stream
 * Renders communication ledger, FDCPA violation flags, and call transcription notes
 */

export function renderInteractions(interactions, activeCase) {
  const caseInteractions = interactions.filter(i => i.caseId === activeCase.id);

  if (caseInteractions.length === 0) {
    return `
      <div class="empty-state" style="padding: var(--space-xl); text-align: center; border: 1px dashed var(--color-border-medium);">
        <span class="label-caps">NO COMMUNICATIONS LOGGED FOR THIS DOSSIER</span>
        <p style="font-size: 13px; color: var(--color-tertiary-light); margin-top: 6px;">
          Use the 'Quick-Log Call' button or add formal correspondence records to track FDCPA violations.
        </p>
      </div>
    `;
  }

  const items = caseInteractions.map(item => {
    const hasViolation = item.violations && item.violations.length > 0;
    const violationHtml = hasViolation ? `
      <div style="margin-top: 6px; display: flex; flex-direction: column; gap: 4px;">
        ${item.violations.map(v => `
          <div style="display:flex; justify-content:space-between; align-items:center; background-color: var(--color-secondary-container); border: 1px solid var(--color-secondary); padding: 6px 10px; flex-wrap: wrap; gap: 6px;">
            <div style="display:flex; align-items:center; gap: 6px; flex-wrap: wrap;">
              <span class="specimen-chip chip-violation">■ VIOLATION</span>
              <strong style="font-size: 11px; color: var(--color-secondary-deep);">${v.citation}</strong>
              <span style="font-size: 11px; color: var(--color-secondary-deep);">${v.title}</span>
            </div>
            <span class="label-code text-danger" style="font-weight: 700;">+$${v.damages.toFixed(2)}</span>
          </div>
        `).join("")}
      </div>
    ` : "";

    return `
      <div class="interaction-item ${hasViolation ? "has-violation" : ""}">
        <div class="interaction-header">
          <div class="interaction-meta" style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <span class="specimen-chip ${item.direction === 'Incoming' ? 'chip-subpoena' : 'chip-compliant'}">
              ${item.direction.toUpperCase()} (${item.channel.toUpperCase()})
            </span>
            <span class="label-code" style="font-weight: 700;">${item.timestamp}</span>
            <span class="label-code" style="color: var(--color-tertiary-light);">CONTACT: ${item.contactName}</span>
          </div>
          <div>
            ${item.durationSec > 0 ? `<span class="label-code">DURATION: ${Math.floor(item.durationSec / 60)}m ${item.durationSec % 60}s</span>` : ''}
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
    <div style="display: flex; flex-direction: column; gap: var(--space-md);">
      <div style="display: flex; justify-content: space-between; align-items: center; background-color: var(--color-surface-container-low); padding: var(--space-xs) var(--space-sm); border: 1px solid var(--color-border-medium);">
        <div>
          <span class="label-caps">CHRONOLOGICAL EVIDENTIARY STREAM</span>
          <span class="label-code" style="margin-left: 8px;">${caseInteractions.length} ENTRIES RECORDED</span>
        </div>
        <button class="btn btn-secondary-evidentiary" id="addInteractionLogBtn">+ RECORD CORRESPONDENCE</button>
      </div>

      <div class="stream-timeline">
        ${items}
      </div>
    </div>
  `;
}
