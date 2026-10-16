/**
 * SettleMint Statutory Patch Controller
 * Manages cryptographically verified legislative updates & air-gapped rollbacks
 */

import { ipc } from '../ipc.js';

export class PatchController {
  constructor(app) {
    this.app = app;
    this.pendingPatchJson = null;
    this.initElements();
    this.bindEvents();
  }

  initElements() {
    this.statutoryPatchModal = document.getElementById("statutoryPatchModal");
    this.openStatutoryPatchesModalBtn = document.getElementById("openStatutoryPatchesModalBtn");
    this.closeStatutoryPatchModal = document.getElementById("closeStatutoryPatchModal");
    this.dismissStatutoryPatchModalBtn = document.getElementById("dismissStatutoryPatchModalBtn");
    this.statutoryEngineStatus = document.getElementById("statutoryEngineStatus");
    this.activePatchesListContainer = document.getElementById("activePatchesListContainer");
    this.rollbackAllPatchesBtn = document.getElementById("rollbackAllPatchesBtn");
    this.statutoryPatchFileInput = document.getElementById("statutoryPatchFileInput");
    this.loadSamplePatchBtn = document.getElementById("loadSamplePatchBtn");
    this.patchVerificationBox = document.getElementById("patchVerificationBox");
    this.patchValidationStatus = document.getElementById("patchValidationStatus");
    this.patchPreviewContent = document.getElementById("patchPreviewContent");
    this.applyVerifiedPatchBtn = document.getElementById("applyVerifiedPatchBtn");
  }

  showDialog(dialog) {
    if (!dialog) return;
    if (!dialog.open) {
      try {
        dialog.showModal();
      } catch (err) {
        console.warn("showModal failed for dialog:", dialog.id, err);
      }
    }
  }

  closeDialog(dialog) {
    if (!dialog) return;
    if (dialog.open) {
      try {
        dialog.close();
      } catch (err) {
        console.warn("close failed for dialog:", dialog.id, err);
      }
    }
  }

  bindEvents() {
    if (this.openStatutoryPatchesModalBtn) {
      this.openStatutoryPatchesModalBtn.addEventListener("click", () => this.openStatutoryPatchesModal());
    }
    if (this.closeStatutoryPatchModal) {
      this.closeStatutoryPatchModal.addEventListener("click", () => this.closeDialog(this.statutoryPatchModal));
    }
    if (this.dismissStatutoryPatchModalBtn) {
      this.dismissStatutoryPatchModalBtn.addEventListener("click", () => this.closeDialog(this.statutoryPatchModal));
    }
    if (this.statutoryPatchModal) {
      this.statutoryPatchModal.addEventListener("click", (e) => {
        const rect = this.statutoryPatchModal.getBoundingClientRect();
        const isInDialog = (
          rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
          rect.left <= e.clientX && e.clientX <= rect.left + rect.width
        );
        if (!isInDialog) {
          this.closeDialog(this.statutoryPatchModal);
        }
      });
    }
    if (this.statutoryPatchFileInput) {
      this.statutoryPatchFileInput.addEventListener("change", (e) => {
        if (e.target.files?.[0]) {
          this.handleStatutoryPatchFileSelect(e.target.files[0]);
        }
      });
    }
    if (this.loadSamplePatchBtn) {
      this.loadSamplePatchBtn.addEventListener("click", () => this.loadSampleStatutoryPatch());
    }
    if (this.applyVerifiedPatchBtn) {
      this.applyVerifiedPatchBtn.addEventListener("click", () => this.applyPendingStatutoryPatch());
    }
    if (this.rollbackAllPatchesBtn) {
      this.rollbackAllPatchesBtn.addEventListener("click", () => this.handleRollbackAllPatches());
    }
  }

  async openStatutoryPatchesModal() {
    if (!this.statutoryPatchModal) return;
    this.showDialog(this.statutoryPatchModal);
    if (this.patchVerificationBox) this.patchVerificationBox.style.display = "none";
    this.pendingPatchJson = null;
    await this.refreshActivePatchesList();
  }

  createEmptyPatchesElement() {
    const emptyDiv = document.createElement("div");
    emptyDiv.style.cssText = "padding: 16px; text-align: center; color: #64748b; font-size: 12px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px;";
    emptyDiv.textContent = "No custom patches currently applied. All 54 jurisdictions running official built-in statutory tables.";
    return emptyDiv;
  }

  createPatchCardElement(p) {
    const card = document.createElement("div");
    card.style.cssText = "display: flex; justify-content: space-between; align-items: center; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;";

    const left = document.createElement("div");
    const topRow = document.createElement("div");
    topRow.style.cssText = "display: flex; align-items: center; gap: 8px; margin-bottom: 4px;";

    const pill = document.createElement("span");
    pill.className = "status-pill status-pill-success";
    pill.style.fontSize = "10px";
    pill.textContent = `Patch v${p.version}`;

    const title = document.createElement("strong");
    title.style.cssText = "font-size: 13px; color: #0f172a;";
    title.textContent = p.patch_id;

    topRow.append(pill, title);

    const desc = document.createElement("div");
    desc.style.cssText = "font-size: 12px; color: #475569; margin-bottom: 4px;";
    desc.textContent = p.description;

    const meta = document.createElement("div");
    meta.style.cssText = "font-size: 10px; color: #94a3b8;";
    meta.textContent = `Applied: ${new Date(p.applied_at).toLocaleString()} • ${Number(p.sol_rules_count) || 0} SOL overrides • ${Number(p.licensing_rules_count) || 0} Licensing overrides`;

    left.append(topRow, desc, meta);

    const rollbackBtn = document.createElement("button");
    rollbackBtn.type = "button";
    rollbackBtn.className = "btn btn-sm btn-pill-outline btn-rollback-patch";
    rollbackBtn.style.cssText = "color: #e11d48; border-color: #fecdd3; font-size: 11px;";
    rollbackBtn.textContent = "Rollback";
    rollbackBtn.addEventListener("click", () => this.handleRollbackPatch(p.patch_id));

    card.append(left, rollbackBtn);
    return card;
  }

  async refreshActivePatchesList() {
    try {
      const patches = await ipc.getActiveStatutoryPatches();
      if (!this.activePatchesListContainer) return;

      this.activePatchesListContainer.replaceChildren();

      if (!patches || patches.length === 0) {
        this.activePatchesListContainer.appendChild(this.createEmptyPatchesElement());
        if (this.rollbackAllPatchesBtn) this.rollbackAllPatchesBtn.style.display = "none";
        if (this.statutoryEngineStatus) this.statutoryEngineStatus.textContent = "v2026.10 Built-in • 54 Jurisdictions Codified";
      } else {
        if (this.rollbackAllPatchesBtn) this.rollbackAllPatchesBtn.style.display = "inline-block";
        if (this.statutoryEngineStatus) this.statutoryEngineStatus.textContent = `v2026.10 (+${patches.length} active patch${patches.length > 1 ? "es" : ""}) • 54 Jurisdictions`;

        patches.forEach(p => {
          this.activePatchesListContainer.appendChild(this.createPatchCardElement(p));
        });
      }
    } catch (_err) {
      // Failed to load active patches
    }
  }

  async handleStatutoryPatchFileSelect(file) {
    try {
      const text = await file.text();
      this.stagePatchPreview(text);
    } catch (err) {
      alert(`Failed to read patch file: ${err}`);
    }
  }

  async loadSampleStatutoryPatch() {
    const samplePatch = {
      payload: {
        patch_id: "patch-2026-q4-ca-tx-update",
        version: "2026.4.1",
        description: "California Medical SOL reduction and Texas bond threshold inflation adjustment",
        published_at: "2026-10-15T12:00:00Z",
        sol_rules: [
          {
            state_code: "CA",
            state_name: "California",
            medical_sol_years: 3,
            credit_card_sol_years: 4,
            written_contract_sol_years: 4,
            open_account_sol_years: 4,
            statutory_code: "Cal. Civ. Proc. Code § 337 (amended)",
            partial_payment_resets_clock: false,
            notes: "Updated 3-year limitation on medical debt collections"
          }
        ],
        licensing_rules: [
          {
            state_code: "TX",
            state_name: "Texas",
            requires_license: false,
            regulatory_agency: "Texas Secretary of State (Statutory Documents Section)",
            requires_surety_bond: true,
            bond_amount: "$15,000",
            statutory_code: "Tex. Fin. Code § 392.101",
            unlicensed_collection_is_per_se_violation: true,
            notes: "Updated $15,000 surety bond filing requirement"
          }
        ]
      },
      signature_hex: "0473c3ba42578a61c95aaa807e5dc7a06dda7e7cf9955cb3ba490398922d7762d6ca29929f6470fa7732c966a9eaaae9b941a1121d21e4a063e96c1c2bed8f00",
      public_key_hex: "35d5e78b81c64ef3ccf8621def44baf10fd1681ccc4fca216152f28e5db91919"
    };
    this.stagePatchPreview(JSON.stringify(samplePatch, null, 2));
  }

  stagePatchPreview(jsonText) {
    try {
      const parsed = JSON.parse(jsonText);
      if (!parsed.payload || !parsed.signature_hex || !parsed.public_key_hex) {
        throw new Error("Invalid format: missing payload, signature_hex, or public_key_hex envelope");
      }
      this.pendingPatchJson = jsonText;
      if (this.patchVerificationBox) this.patchVerificationBox.style.display = "block";
      if (this.patchValidationStatus) {
        this.patchValidationStatus.replaceChildren();
        const validDiv = document.createElement("div");
        validDiv.style.cssText = "display: flex; align-items: center; gap: 8px; font-size: 12px; color: #166534; font-weight: 700;";
        validDiv.textContent = "✓ Envelope Well-Formed (Ed25519 Signature Present)";

        const metaDiv = document.createElement("div");
        metaDiv.style.cssText = "font-size: 11px; color: #475569; margin-top: 4px;";
        metaDiv.textContent = `Target: ${parsed.payload.patch_id} (v${parsed.payload.version}) • ${parsed.payload.description}`;

        this.patchValidationStatus.append(validDiv, metaDiv);
      }
      if (this.patchPreviewContent) {
        this.patchPreviewContent.textContent = JSON.stringify(parsed.payload, null, 2);
      }
    } catch (err) {
      alert(`Invalid statutory patch JSON: ${err.message}`);
    }
  }

  async applyPendingStatutoryPatch() {
    if (!this.pendingPatchJson) return;
    try {
      const summary = await ipc.importStatutoryPatch(this.pendingPatchJson);
      await this.refreshActivePatchesList();
      this.app.renderCurrentView();
      if (this.patchVerificationBox) this.patchVerificationBox.style.display = "none";
      this.pendingPatchJson = null;
      if (this.statutoryPatchFileInput) this.statutoryPatchFileInput.value = "";
      ipc.sendNotification("Statutory Patch Applied", `Successfully verified and applied legislative update ${summary.patch_id}.`);
    } catch (err) {
      alert(`Cryptographic verification or import failed: ${err}`);
    }
  }

  async handleRollbackPatch(patchId) {
    if (!confirm(`Are you sure you want to rollback patch '${patchId}' and restore baseline statutes for affected states?`)) return;
    try {
      await ipc.rollbackStatutoryPatch(patchId);
      await this.refreshActivePatchesList();
      this.app.renderCurrentView();
      ipc.sendNotification("Patch Rolled Back", `Reverted patch ${patchId} to official baseline.`);
    } catch (err) {
      alert(`Rollback failed: ${err}`);
    }
  }

  async handleRollbackAllPatches() {
    if (!confirm("Are you sure you want to rollback ALL active patches and restore all 54 jurisdictions to baseline statutes?")) return;
    try {
      await ipc.rollbackAllStatutoryPatches();
      await this.refreshActivePatchesList();
      this.app.renderCurrentView();
      ipc.sendNotification("Statutory Engine Restored", "All jurisdictions restored to official built-in baseline.");
    } catch (err) {
      alert(`Rollback all failed: ${err}`);
    }
  }
}
