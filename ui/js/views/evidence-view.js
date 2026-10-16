/**
 * SettleMint Evidence Vault View
 * Manages local sandboxed evidence attachments, SHA-256 hashes, and Bates numbering
 */

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function renderEmptyEvidenceState() {
  return `
    <div class="empty-state-card" style="background:#ffffff; border:1px dashed var(--color-border-standard); border-radius:var(--radius-xl); padding:60px 24px; text-align:center; max-width:600px; margin:40px auto;">
      <div style="width:48px; height:48px; border-radius:12px; background:var(--color-primary-mint-wash); color:var(--color-primary); display:inline-flex; align-items:center; justify-content:center; margin-bottom:16px;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
      </div>
      <h3 style="font-size:18px; font-weight:700; color:#0f172a; margin-bottom:8px;">No Evidence Vault Selected</h3>
      <p style="font-size:14px; color:#64748b; margin-bottom:20px; line-height:1.5;">Evidence files and Bates stamps are associated with specific dispute dossiers. Select or create an account to vault evidence.</p>
      <button type="button" class="btn btn-pill-primary" id="evidenceEmptyNewCaseBtn">+ Open New Dispute</button>
    </div>
  `;
}

function renderEvidenceCard(item) {
  return `
    <div class="vault-item-card">
      <div class="vault-thumb">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
        <span>${escapeHtml(item.docType ? item.docType.toUpperCase() : 'DOCUMENT')}</span>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span class="status-pill status-pill-mint" style="font-weight:700; font-family:var(--font-family-mono); font-size:11px;">${escapeHtml(item.batesStamp)}</span>
        <span style="font-family:var(--font-family-mono); font-size:11.5px; color:#64748b;">${escapeHtml(item.fileSize)}</span>
      </div>
      <div>
        <div style="font-size:13.5px; font-weight:700; color:#0f172a; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${escapeHtml(item.title)}">
          ${escapeHtml(item.title)}
        </div>
        <div style="font-size:11.5px; color:#64748b; margin-top:2px;">Uploaded: ${escapeHtml(item.uploadedDate)}</div>
      </div>
      <div class="vault-hash-box" title="SHA-256 Cryptographic Hash: ${escapeHtml(item.sha256Hash)}">
        <span style="font-weight:600; color:#006948;">SHA-256:</span> ${escapeHtml(item.sha256Hash)}
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
        <span class="status-pill status-pill-neutral" style="font-size:10px;">AES-256 Encrypted</span>
        <button class="btn-pill-outline btn-sm" style="font-size:11px; padding:4px 10px;">Inspect Artifact ›</button>
      </div>
    </div>
  `;
}

function renderEmptyEvidenceGallery() {
  return `
    <div style="grid-column: 1 / -1; background:#ffffff; border:1px dashed var(--color-border-standard); border-radius:var(--radius-xl); padding:40px 24px; text-align:center;">
      <div style="width:48px; height:48px; border-radius:50%; background:var(--color-primary-mint-wash); color:var(--color-primary); display:inline-flex; align-items:center; justify-content:center; margin-bottom:12px;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      </div>
      <div style="font-size:15px; font-weight:700; color:#0f172a; margin-bottom:4px;">No Evidence Artifacts Vaulted Yet</div>
      <div style="font-size:12.5px; color:#64748b; max-width:440px; margin:0 auto 16px auto;">Ingest dunning notices, collection letters, envelope postmarks, and audio files to secure cryptographic proof.</div>
      <button type="button" class="btn-pill-primary btn-sm btn-ingest-evidence-trigger" id="emptyIngestEvidenceBtn">+ Ingest First Evidence File</button>
    </div>
  `;
}

export function renderEvidenceVault(evidenceList, activeCase) {
  if (!activeCase) return renderEmptyEvidenceState();

  const caseEvidence = (evidenceList || []).filter(e => e.caseId === activeCase.id);
  const cards = caseEvidence.length > 0 
    ? caseEvidence.map(renderEvidenceCard).join("") 
    : renderEmptyEvidenceGallery();

  return `
    <div style="display: flex; flex-direction: column; gap: var(--space-md);">
      <div class="orderly-view-header">
        <div class="view-header-left">
          <div class="view-header-icon-badge">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div>
            <div class="view-header-title">
              Local Encrypted Evidence Vault
              <span class="status-pill status-pill-mint" style="font-size:11px; margin-left:8px;">${caseEvidence.length} Secured Artifacts</span>
            </div>
            <div class="view-header-subtitle">
              <span>Active Dossier:</span>
              <strong style="color: #334155;">${escapeHtml(activeCase.originalProvider || activeCase.collectionAgency)}</strong>
              <span>•</span>
              <span class="label-code" style="font-size: 11px;">${escapeHtml(activeCase.docketNumber || activeCase.id)}</span>
              <span>•</span>
              <span>Collector: ${escapeHtml(activeCase.collectionAgency)}</span>
            </div>
          </div>
        </div>
        <div class="view-header-actions">
          <button class="btn-pill-primary btn-sm" id="ingestEvidenceBtn">+ Ingest Evidence File</button>
        </div>
      </div>

      <div class="vault-gallery">
        ${cards}
      </div>
    </div>
  `;
}
