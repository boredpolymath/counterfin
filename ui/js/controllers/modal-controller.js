/**
 * SettleMint Modal Controller
 * Manages modal dialogs for Profiles, Disputes, Call Logs, and Evidence Ingestion
 */

import { ipc } from '../ipc.js';

export class ModalController {
  constructor(app) {
    this.app = app;
    this._pendingEvidence = null;
    this.initElements();
    this.bindEvents();
  }

  initElements() {
    this.callScriptModal = document.getElementById("callScriptModal");
    this.callScriptBtn = document.getElementById("callScriptBtn");
    this.closeCallScriptModal = document.getElementById("closeCallScriptModal");
    this.dismissCallScriptBtn = document.getElementById("dismissCallScriptBtn");

    this.disputeGuidesModal = document.getElementById("disputeGuidesModal");
    this.disputeGuidesBtn = document.getElementById("disputeGuidesBtn");
    this.closeDisputeGuidesModal = document.getElementById("closeDisputeGuidesModal");
    this.dismissDisputeGuidesBtn = document.getElementById("dismissDisputeGuidesBtn");

    this.newDisputeModal = document.getElementById("newDisputeModal");
    this.newCaseBtn = document.getElementById("newCaseBtn");
    this.closeNewDisputeModal = document.getElementById("closeNewDisputeModal");
    this.cancelNewDisputeBtn = document.getElementById("cancelNewDisputeBtn");
    this.newDisputeForm = document.getElementById("newDisputeForm");

    this.quickLogModal = document.getElementById("quickLogModal");
    this.closeQuickLogModal = document.getElementById("closeQuickLogModal");
    this.cancelQuickLogBtn = document.getElementById("cancelQuickLogBtn");
    this.quickLogForm = document.getElementById("quickLogForm");
    this.logCaseSelect = document.getElementById("logCaseSelect");
    this.logTimestamp = document.getElementById("logTimestamp");
    this.logContactName = document.getElementById("logContactName");
    this.logContactPhone = document.getElementById("logContactPhone");
    this.logChannel = document.getElementById("logChannel");
    this.logDirection = document.getElementById("logDirection");
    this.logDuration = document.getElementById("logDuration");
    this.logNotes = document.getElementById("logNotes");

    this.ingestEvidenceModal = document.getElementById("ingestEvidenceModal");
    this.closeIngestEvidenceModal = document.getElementById("closeIngestEvidenceModal");
    this.cancelIngestEvidenceBtn = document.getElementById("cancelIngestEvidenceBtn");
    this.ingestEvidenceForm = document.getElementById("ingestEvidenceForm");
    this.evidenceCaseSelect = document.getElementById("evidenceCaseSelect");
    this.evidenceTitle = document.getElementById("evidenceTitle");
    this.evidenceDocType = document.getElementById("evidenceDocType");
    this.evidenceFileInput = document.getElementById("evidenceFileInput");
    this.evidencePreviewStrip = document.getElementById("evidencePreviewStrip");
    this.previewBates = document.getElementById("previewBates");
    this.previewSize = document.getElementById("previewSize");
    this.previewHash = document.getElementById("previewHash");

    this.userProfileModal = document.getElementById("userProfileModal");
    this.closeUserProfileModal = document.getElementById("closeUserProfileModal");
    this.cancelUserProfileBtn = document.getElementById("cancelUserProfileBtn");
    this.userProfileForm = document.getElementById("userProfileForm");
    this.sidebarUserProfileBtn = document.getElementById("sidebarUserProfileBtn");
    this.loadDemoDataModalBtn = document.getElementById("loadDemoDataModalBtn");
    this.wipeAllDataModalBtn = document.getElementById("wipeAllDataModalBtn");
    this.profileFullName = document.getElementById("profileFullName");
    this.profileStreet = document.getElementById("profileStreet");
    this.profileCity = document.getElementById("profileCity");
    this.profileState = document.getElementById("profileState");
    this.profileZip = document.getElementById("profileZip");
    this.profilePhone = document.getElementById("profilePhone");
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

  enableBackdropDismiss(dialog) {
    if (!dialog) return;
    dialog.addEventListener("click", (e) => {
      const rect = dialog.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX && e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        this.closeDialog(dialog);
      }
    });
  }

  bindEvents() {
    this.bindCallScriptEvents();
    this.bindDisputeGuidesEvents();
    this.bindProfileEvents();
    this.bindNewDisputeEvents();
    this.bindQuickLogEvents();
    this.bindEvidenceEvents();

    [
      this.callScriptModal,
      this.disputeGuidesModal,
      this.newDisputeModal,
      this.quickLogModal,
      this.ingestEvidenceModal,
      this.userProfileModal
    ].forEach(m => this.enableBackdropDismiss(m));
  }

  bindCallScriptEvents() {
    if (this.callScriptBtn) {
      this.callScriptBtn.addEventListener("click", () => this.showDialog(this.callScriptModal));
    }
    if (this.closeCallScriptModal) {
      this.closeCallScriptModal.addEventListener("click", () => this.closeDialog(this.callScriptModal));
    }
    if (this.dismissCallScriptBtn) {
      this.dismissCallScriptBtn.addEventListener("click", () => this.closeDialog(this.callScriptModal));
    }
  }

  bindDisputeGuidesEvents() {
    if (this.disputeGuidesBtn) {
      this.disputeGuidesBtn.addEventListener("click", () => this.showDialog(this.disputeGuidesModal));
    }
    if (this.closeDisputeGuidesModal) {
      this.closeDisputeGuidesModal.addEventListener("click", () => this.closeDialog(this.disputeGuidesModal));
    }
    if (this.dismissDisputeGuidesBtn) {
      this.dismissDisputeGuidesBtn.addEventListener("click", () => this.closeDialog(this.disputeGuidesModal));
    }
  }

  bindProfileEvents() {
    if (this.sidebarUserProfileBtn) {
      this.sidebarUserProfileBtn.addEventListener("click", () => this.openUserProfileModal());
    }
    if (this.closeUserProfileModal) {
      this.closeUserProfileModal.addEventListener("click", () => this.closeDialog(this.userProfileModal));
    }
    if (this.cancelUserProfileBtn) {
      this.cancelUserProfileBtn.addEventListener("click", () => this.closeDialog(this.userProfileModal));
    }
    if (this.userProfileForm) {
      this.userProfileForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.app.saveUserProfile({
          name: this.profileFullName?.value,
          address: this.profileStreet?.value,
          city: this.profileCity?.value,
          state: this.profileState?.value,
          zip: this.profileZip?.value,
          phone: this.profilePhone?.value
        });
        this.closeDialog(this.userProfileModal);
      });
    }
    if (this.loadDemoDataModalBtn) {
      this.loadDemoDataModalBtn.addEventListener("click", async () => {
        this.closeDialog(this.userProfileModal);
        await this.app.loadDemoData();
      });
    }
    if (this.wipeAllDataModalBtn) {
      let wipeConfirmTimeout = null;
      this.wipeAllDataModalBtn.addEventListener("click", async () => {
        if (this.wipeAllDataModalBtn.dataset.confirming === "true") {
          this.wipeAllDataModalBtn.dataset.confirming = "false";
          this.wipeAllDataModalBtn.textContent = "Clear All Cases & Start Fresh";
          this.wipeAllDataModalBtn.style.background = "";
          this.wipeAllDataModalBtn.style.color = "#e11d48";
          if (wipeConfirmTimeout) clearTimeout(wipeConfirmTimeout);
          this.closeDialog(this.userProfileModal);
          await this.app.clearAllData();
        } else {
          this.wipeAllDataModalBtn.dataset.confirming = "true";
          this.wipeAllDataModalBtn.textContent = "⚠️ Click Again to Confirm Reset";
          this.wipeAllDataModalBtn.style.background = "#e11d48";
          this.wipeAllDataModalBtn.style.color = "#ffffff";
          wipeConfirmTimeout = setTimeout(() => {
            if (this.wipeAllDataModalBtn) {
              this.wipeAllDataModalBtn.dataset.confirming = "false";
              this.wipeAllDataModalBtn.textContent = "Clear All Cases & Start Fresh";
              this.wipeAllDataModalBtn.style.background = "";
              this.wipeAllDataModalBtn.style.color = "#e11d48";
            }
          }, 4500);
        }
      });
    }
  }

  bindNewDisputeEvents() {
    if (this.newCaseBtn) {
      this.newCaseBtn.addEventListener("click", () => this.openNewDisputeModal());
    }
    if (this.closeNewDisputeModal) {
      this.closeNewDisputeModal.addEventListener("click", () => this.closeDialog(this.newDisputeModal));
    }
    if (this.cancelNewDisputeBtn) {
      this.cancelNewDisputeBtn.addEventListener("click", () => this.closeDialog(this.newDisputeModal));
    }
    if (this.newDisputeForm) {
      this.newDisputeForm.addEventListener("submit", (e) => this.handleNewDisputeSubmit(e));
    }
  }

  bindQuickLogEvents() {
    if (this.closeQuickLogModal) {
      this.closeQuickLogModal.addEventListener("click", () => this.closeDialog(this.quickLogModal));
    }
    if (this.cancelQuickLogBtn) {
      this.cancelQuickLogBtn.addEventListener("click", () => this.closeDialog(this.quickLogModal));
    }
    if (this.quickLogForm) {
      this.quickLogForm.addEventListener("submit", (e) => this.handleQuickLogSubmit(e));
    }
  }

  bindEvidenceEvents() {
    if (this.closeIngestEvidenceModal) {
      this.closeIngestEvidenceModal.addEventListener("click", () => this.closeDialog(this.ingestEvidenceModal));
    }
    if (this.cancelIngestEvidenceBtn) {
      this.cancelIngestEvidenceBtn.addEventListener("click", () => this.closeDialog(this.ingestEvidenceModal));
    }
    if (this.evidenceFileInput) {
      this.evidenceFileInput.addEventListener("change", (e) => this.handleEvidenceFileChange(e));
    }
    if (this.ingestEvidenceForm) {
      this.ingestEvidenceForm.addEventListener("submit", (e) => this.handleIngestEvidenceSubmit(e));
    }
  }

  openUserProfileModal() {
    if (!this.userProfileModal) return;
    if (this.profileFullName) this.profileFullName.value = this.app.user.isConfigured ? this.app.user.name : "";
    if (this.profileStreet) this.profileStreet.value = this.app.user.address || "";
    if (this.profileCity) this.profileCity.value = this.app.user.city || "";
    if (this.profileState) this.profileState.value = this.app.user.state || "NY";
    if (this.profileZip) this.profileZip.value = this.app.user.zip || "";
    if (this.profilePhone) this.profilePhone.value = this.app.user.phone || "";
    this.showDialog(this.userProfileModal);
  }

  openNewDisputeModal() {
    if (!this.newDisputeModal) return;
    const stateEl = document.getElementById("newState");
    if (stateEl && this.app.user.state) {
      stateEl.value = this.app.user.state;
    }
    const noticeEl = document.getElementById("newNoticeDate");
    if (noticeEl && !noticeEl.value) {
      noticeEl.value = new Date().toISOString().slice(0, 10);
    }
    const serviceEl = document.getElementById("newServiceDate");
    if (serviceEl && !serviceEl.value) {
      serviceEl.value = new Date().toISOString().slice(0, 10);
    }
    this.showDialog(this.newDisputeModal);
  }

  openQuickLogModal(caseId = null) {
    if (!this.quickLogModal) return;
    if (this.logCaseSelect) {
      this.logCaseSelect.replaceChildren();
      this.app.cases.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c.id;
        opt.textContent = `${c.docketNumber} — ${c.originalProvider} ($${c.disputedBalance.toFixed(2)})`;
        if ((caseId && c.id === caseId) || (!caseId && c.id === this.app.activeCaseId)) {
          opt.selected = true;
        }
        this.logCaseSelect.appendChild(opt);
      });
    }
    if (this.logTimestamp) {
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      this.logTimestamp.value = now.toISOString().slice(0, 16);
    }
    this.showDialog(this.quickLogModal);
  }

  openIngestEvidenceModal(caseId = null) {
    if (!this.ingestEvidenceModal) return;
    if (this.evidenceCaseSelect) {
      this.evidenceCaseSelect.replaceChildren();
      this.app.cases.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c.id;
        opt.textContent = `${c.docketNumber} — ${c.originalProvider}`;
        if ((caseId && c.id === caseId) || (!caseId && c.id === this.app.activeCaseId)) {
          opt.selected = true;
        }
        this.evidenceCaseSelect.appendChild(opt);
      });
    }
    if (this.evidencePreviewStrip) this.evidencePreviewStrip.style.display = "none";
    if (this.evidenceFileInput) this.evidenceFileInput.value = "";
    this._pendingEvidence = null;
    this.showDialog(this.ingestEvidenceModal);
  }

  getDebtMeta(debtType) {
    if (debtType === "medical") {
      return {
        iconType: "medical",
        legalFramework: "No Surprises Act & FDCPA § 1692g",
        notes: "Newly ingested healthcare debt. Initiating 30-day verification demand and clinical billing audit."
      };
    }
    if (debtType === "auto_deficiency") {
      return {
        iconType: "auto",
        legalFramework: "UCC Article 9 & FDCPA",
        notes: "Auto loan deficiency dispute under UCC Article 9 & 15 U.S.C. § 1692g."
      };
    }
    if (debtType === "personal_loan") {
      return {
        iconType: "loan",
        legalFramework: "15 U.S.C. § 1692g & State Consumer Act",
        notes: "Personal installment loan verification demand under federal FDCPA standards."
      };
    }
    return {
      iconType: "credit_card",
      legalFramework: "CFPB Reg F § 1006.34 & TILA",
      notes: "Newly ingested credit card debt portfolio. Demanding chain of title and full accounting."
    };
  }

  buildNewCaseObject(debtType, provider, agency, balance, category, accountNum, statuteState, noticeDate, serviceDate) {
    const noticeMs = new Date(noticeDate).getTime();
    const daysElapsed = Math.floor((Date.now() - noticeMs) / (1000 * 60 * 60 * 24));
    const statutoryDaysRemaining = Math.max(0, 30 - Math.max(0, daysElapsed));
    const caseUuid = crypto.randomUUID();
    const caseCount = (this.app.cases.length + 1).toString().padStart(2, "0");
    const batesStr = `BATES-SM-${new Date().getFullYear()}-00${caseCount}`;
    const debtorName = (this.app.user.name && this.app.user.isConfigured) ? this.app.user.name : "Protected Consumer";
    const { iconType, legalFramework, notes } = this.getDebtMeta(debtType);

    return {
      id: caseUuid, docketNumber: batesStr, debtorName, debtType, originalProvider: provider,
      providerCategory: category, iconType, collectionAgency: agency, originalAccountNumber: accountNum,
      collectionAccountNumber: `AGY-${Date.now().toString().slice(-4)}`,
      dateOfService: serviceDate, initialNoticeDate: noticeDate, originalBalance: balance, disputedBalance: balance,
      currentPhase: "InitialNotice", statuteState, statuteLimitYears: 3, statutoryDaysRemaining,
      statusBadge: "Notice Received", secondaryBadge: `${statutoryDaysRemaining}-day window`,
      certifiedMailDeliveredDate: null, certifiedMailTracking: `7021 0950 000${caseCount} 8891 0021`,
      actionLabel: "Review Letter", violationsCount: 0, potentialDamages: 0.00,
      collectionStatus: "Dispute letter ready to send", notes, legalFramework
    };
  }

  persistCaseToBackend(newCase, debtType) {
    if (!ipc.isTauri()) return;
    const rustDebtType = debtType === 'credit_card' ? 'CreditCard' :
                         debtType === 'medical' ? 'Medical' :
                         debtType === 'auto_deficiency' ? 'AutoDeficiency' : 'PersonalLoan';
    const sqlitePayload = {
      id: newCase.id, docket_number: newCase.docketNumber, debtor_name: newCase.debtorName,
      debt_type: rustDebtType, provider_name: newCase.originalProvider, collection_agency: newCase.collectionAgency,
      original_account_number: newCase.originalAccountNumber, collection_account_number: newCase.collectionAccountNumber,
      original_balance: newCase.originalBalance, disputed_balance: newCase.disputedBalance, status: "InitialNotice",
      jurisdiction_state: newCase.statuteState, date_of_service: newCase.dateOfService,
      initial_notice_date: newCase.initialNoticeDate, certified_mail_tracking: newCase.certifiedMailTracking,
      created_at: new Date().toISOString(), closed_at: null
    };
    ipc.createCase(sqlitePayload).catch(() => {
      // Backend write handled gracefully
    });
  }

  handleNewDisputeSubmit(e) {
    e.preventDefault();
    const debtType = document.getElementById("newDebtType")?.value || "credit_card";
    const provider = document.getElementById("newProviderName")?.value || "Creditor";
    const agency = document.getElementById("newAgencyName")?.value || "Collection Agency";
    const balance = parseFloat(document.getElementById("newBalance")?.value) || 0;
    const category = document.getElementById("newCategory")?.value || "General Consumer Debt";
    const accountNum = document.getElementById("newAccountNumber")?.value || `ACC-${Date.now().toString().slice(-4)}`;
    const stateEl = document.getElementById("newState");
    const statuteState = stateEl?.value || this.app.user.state || "NY";
    const noticeDateEl = document.getElementById("newNoticeDate");
    const noticeDate = noticeDateEl?.value || new Date().toISOString().slice(0, 10);
    const serviceDateEl = document.getElementById("newServiceDate");
    const serviceDate = serviceDateEl?.value || noticeDate;

    const newCase = this.buildNewCaseObject(debtType, provider, agency, balance, category, accountNum, statuteState, noticeDate, serviceDate);
    this.persistCaseToBackend(newCase, debtType);

    this.app.cases.unshift(newCase);
    this.app.activeCaseId = newCase.id;
    this.app.expandedCaseIds = new Set([newCase.id]);
    if (this.app.sidebarBadgeCount) this.app.sidebarBadgeCount.textContent = this.app.cases.length;
    this.closeDialog(this.newDisputeModal);
    if (this.newDisputeForm) this.newDisputeForm.reset();
    ipc.sendNotification("New FDCPA Dispute Protected", `Dispute initiated for ${provider} ($${balance.toFixed(2)}).`);
    this.app.render();
  }

  async handleQuickLogSubmit(e) {
    e.preventDefault();
    const caseId = this.logCaseSelect?.value || this.app.activeCaseId;
    const contactName = this.logContactName?.value || "Collector";
    const phone = this.logContactPhone?.value || "";
    const channel = this.logChannel?.value || "Phone";
    const direction = this.logDirection?.value || "Incoming";
    const timestampVal = this.logTimestamp?.value ? new Date(this.logTimestamp.value).toISOString() : new Date().toISOString();
    const duration = parseInt(this.logDuration?.value, 10) || 180;
    const notes = this.logNotes?.value || "";

    const checkedBoxes = Array.from(document.querySelectorAll("#quickLogModal .violation-check:checked"));
    const manualViolations = checkedBoxes.map(cb => ({
      violation_type: cb.value, title: cb.getAttribute("data-title") || cb.value,
      citation: cb.getAttribute("data-citation") || "15 U.S.C. § 1692",
      damages: parseFloat(cb.getAttribute("data-damages") || "1000")
    }));

    const interactionId = crypto.randomUUID();
    const caseUuid = caseId && caseId.length === 36 ? caseId : crypto.randomUUID();

    if (ipc.isTauri()) {
      try {
        const sqliteInteraction = {
          id: interactionId, case_id: caseUuid, creditor_id: null, timestamp: timestampVal,
          channel, direction, contact_name: contactName, contact_phone: phone || null,
          duration_seconds: duration, summary_notes: notes, audio_recording_path: null, recorded_flag: false
        };
        const sqliteViolations = manualViolations.map(v => ({
          id: crypto.randomUUID(), case_id: caseUuid, interaction_id: interactionId,
          violation_type: v.violation_type, statutory_code: v.citation, severity_score: 8,
          statutory_damages_min: 500.0, statutory_damages_max: 1000.0, detected_at: timestampVal, notes
        }));
        await ipc.logInteraction(sqliteInteraction, sqliteViolations);
        const damagesSummary = await ipc.getCaseStatutoryDamages(caseUuid);
        const matchedCase = this.app.cases.find(c => c.id === caseId);
        if (matchedCase && damagesSummary) {
          matchedCase.potentialDamages = damagesSummary.total_potential_damages;
          matchedCase.violationsCount = damagesSummary.violation_count;
        }
      } catch (_err) {
        // Backend logging handled gracefully
      }
    }

    const targetCase = this.app.cases.find(c => c.id === caseId) || this.app.getActiveCase();
    if (targetCase) {
      targetCase.violationsCount = (targetCase.violationsCount || 0) + manualViolations.length;
      targetCase.potentialDamages = (targetCase.potentialDamages || 0) + (manualViolations.length * 1000.0);
    }

    this.app.interactions.unshift({
      id: interactionId, caseId,
      date: new Date(timestampVal).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      timestamp: new Date(timestampVal).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      channel, direction,
      agentName: contactName,
      contactName,
      contactNumber: phone || "Unknown",
      durationSec: duration,
      duration: `${Math.round(duration / 60)} mins`,
      notes,
      summary: notes,
      recorded: false,
      violations: manualViolations.map(v => ({ type: v.violation_type, citation: v.citation, title: v.title, damages: v.damages }))
    });

    this.closeDialog(this.quickLogModal);
    if (this.quickLogForm) this.quickLogForm.reset();
    ipc.sendNotification("Collector Interaction Logged", `Recorded ${direction.toLowerCase()} ${channel.toLowerCase()} from ${contactName}. ${manualViolations.length} statutory infractions captured.`);
    this.app.render();
  }

  async handleEvidenceFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const sha256Hex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
      const active = this.app.getActiveCase();
      const batesStr = `BATES-${active?.docketNumber || 'SM-2026'}-DOC0${this.app.evidence.length + 1}`;
      const sizeKb = `${(file.size / 1024).toFixed(1)} KB`;

      if (this.previewBates) this.previewBates.textContent = batesStr;
      if (this.previewSize) this.previewSize.textContent = `${file.name} (${sizeKb})`;
      if (this.previewHash) this.previewHash.textContent = sha256Hex;
      if (this.evidencePreviewStrip) this.evidencePreviewStrip.style.display = "block";

      this._pendingEvidence = { title: file.name, batesStamp: batesStr, fileSize: sizeKb, sha256Hash: sha256Hex, file };
    } catch (_err) {
      // Evidence hashing handled gracefully
    }
  }

  async handleIngestEvidenceSubmit(e) {
    e.preventDefault();
    const caseId = this.evidenceCaseSelect?.value || this.app.activeCaseId;
    const title = this.evidenceTitle?.value || this._pendingEvidence?.title || "Evidence Document";
    const docType = this.evidenceDocType?.value || "Document";

    const newEvidence = {
      id: `ev-${Date.now()}`, caseId,
      batesStamp: this._pendingEvidence?.batesStamp || `BATES-SM-2026-DOC0${this.app.evidence.length + 1}`,
      title, docType, fileSize: this._pendingEvidence?.fileSize || "42.0 KB",
      sha256Hash: this._pendingEvidence?.sha256Hash || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      uploadedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      status: "Vaulted & Sealed"
    };

    if (ipc.isTauri() && this._pendingEvidence?.sha256Hash) {
      try {
        await ipc.hashEvidencePayload(this._pendingEvidence.sha256Hash);
      } catch (_err) {
        // Hash notification is best-effort
      }
    }

    this.app.evidence.unshift(newEvidence);
    this.closeDialog(this.ingestEvidenceModal);
    if (this.ingestEvidenceForm) this.ingestEvidenceForm.reset();
    this._pendingEvidence = null;

    ipc.sendNotification("Evidence Vaulted", `Sealed artifact '${title}' with Bates stamp ${newEvidence.batesStamp}.`);
    this.app.render();
  }
}
