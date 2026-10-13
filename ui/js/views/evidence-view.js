/**
 * SettleMint Evidence Vault View
 * Manages local sandboxed evidence attachments, SHA-256 hashes, and Bates numbering
 */

export function renderEvidenceVault(evidenceList, activeCase) {
  const caseEvidence = evidenceList.filter(e => e.caseId === activeCase.id);

  const cards = caseEvidence.map(item => `
    <div class="vault-item-card">
      <div class="vault-thumb">
        <span>📄 [${item.docType.toUpperCase()}]</span>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span class="label-code" style="font-weight:700;">${item.batesStamp}</span>
        <span class="label-code" style="color:var(--color-tertiary-light);">${item.fileSize}</span>
      </div>
      <div style="font-size:12px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
        ${item.title}
      </div>
      <div class="vault-hash" title="SHA-256 Cryptographic Hash">
        SHA-256: ${item.sha256Hash}
      </div>
      <div style="display:flex; justify-content:space-between; margin-top:4px;">
        <span class="label-code" style="font-size:10px;">${item.uploadedDate}</span>
        <button class="btn btn-secondary-evidentiary" style="padding:2px 6px; font-size:10px;">INSPECT</button>
      </div>
    </div>
  `).join("");

  return `
    <div style="display: flex; flex-direction: column; gap: var(--space-md);">
      <div style="display: flex; justify-content: space-between; align-items: center; background-color: var(--color-surface-container-low); padding: var(--space-xs) var(--space-sm); border: 1px solid var(--color-border-medium);">
        <div>
          <span class="label-caps">LOCAL ENCRYPTED EVIDENCE VAULT</span>
          <span class="label-code" style="margin-left: 8px;">${caseEvidence.length} CRYPTOGRAPHICALLY SECURED ARTIFACTS</span>
        </div>
        <button class="btn btn-primary" id="ingestEvidenceBtn">+ INGEST EVIDENCE FILE</button>
      </div>

      <div class="vault-gallery">
        ${cards}
      </div>
    </div>
  `;
}
