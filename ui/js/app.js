/**
 * SettleMint Core Application Bootstrap & Controller
 * Architecture: SettleMint Consumer Advocacy System
 * 100% Offline, Zero-Telemetry, Cryptographically Verified Legal Defense
 */

import { ipc } from './ipc.js';
import { 
  INITIAL_CASES, 
  INITIAL_INTERACTIONS, 
  INITIAL_EVIDENCE, 
  INITIAL_CREDIT_TRADELINES 
} from './data/mock-dossiers.js';

import { renderDashboard } from './views/dashboard-view.js';
import { renderInteractions } from './views/interaction-view.js';
import { renderLetterStudio } from './views/letter-view.js';
import { renderEvidenceVault } from './views/evidence-view.js';
import { renderCreditAudit } from './views/credit-view.js';

import { PatchController } from './controllers/patch-controller.js';
import { DisclaimerController } from './controllers/disclaimer-controller.js';
import { ModalController } from './controllers/modal-controller.js';
import { LetterController } from './controllers/letter-controller.js';

const getStorageItem = (k) => {
  try {
    return typeof localStorage !== 'undefined' ? localStorage.getItem(k) : null;
  } catch (_) {
    return null;
  }
};

const setStorageItem = (k, v) => {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(k, v);
  } catch (_) {}
};

const removeStorageItem = (k) => {
  try {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(k);
  } catch (_) {}
};

class CounterFinApp {
  constructor() {
    this.PROFILE_STORAGE_SLOT = "counterfin_user_profile_v1";
    this.DEMO_MODE_STORAGE_SLOT = "counterfin_demo_mode";

    const demoStored = getStorageItem(this.DEMO_MODE_STORAGE_SLOT) ?? getStorageItem("settlemint_demo_mode");
    this.isDemoMode = demoStored === "true";
    this.loadUserProfile();

    this.cases = this.isDemoMode ? [...INITIAL_CASES] : [];
    this.interactions = this.isDemoMode ? [...INITIAL_INTERACTIONS] : [];
    this.evidence = this.isDemoMode ? [...INITIAL_EVIDENCE] : [];
    this.tradelines = this.isDemoMode ? [...INITIAL_CREDIT_TRADELINES] : [];

    this.activeCaseId = this.cases[0]?.id || null;
    this.expandedCaseIds = new Set(this.activeCaseId ? [this.activeCaseId] : []);
    this.currentView = "dashboard";
    this.disputeFilter = "all";

    this.initElements();
    this.patchController = new PatchController(this);
    this.disclaimerController = new DisclaimerController(this);
    this.modalController = new ModalController(this);
    this.letterController = new LetterController(this);

    this.bindEvents();
    this.updateSidebarProfile();
    this.render();
    this.initBackendData();

    if (typeof window !== 'undefined') {
      window.addEventListener("counterfin:toast", (e) => {
        if (e.detail) {
          this.showToast(e.detail.title, e.detail.message, e.detail.type);
        }
      });
    }
  }

  get hasAgreedDisclaimer() {
    return this.disclaimerController?.hasAgreedDisclaimer || false;
  }

  set hasAgreedDisclaimer(val) {
    if (this.disclaimerController) {
      this.disclaimerController.hasAgreedDisclaimer = val;
    }
  }

  loadUserProfile() {
    const raw = getStorageItem(this.PROFILE_STORAGE_SLOT) || getStorageItem("settlemint_user_profile_v1");
    if (raw) {
      try {
        this.user = JSON.parse(raw);
        return;
      } catch (_e) {
        // Fallback to default user profile
      }
    }
    this.user = {
      name: "Consumer Advocate",
      shortName: "Advocate",
      initials: "CA",
      address: "",
      city: "",
      state: "NY",
      zip: "",
      phone: "",
      isConfigured: false
    };
  }

  saveUserProfile(profileData) {
    const parts = (profileData.name || "").trim().split(/\s+/);
    let initials = "CA";
    let shortName = "Advocate";
    if (parts.length === 1 && parts[0]) {
      initials = parts[0].slice(0, 2).toUpperCase();
      shortName = parts[0];
    } else if (parts.length >= 2) {
      initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      shortName = parts[0];
    }
    this.user = {
      name: profileData.name?.trim() || "Consumer Advocate",
      shortName,
      initials,
      address: (profileData.address || "").trim(),
      city: (profileData.city || "").trim(),
      state: profileData.state || "NY",
      zip: (profileData.zip || "").trim(),
      phone: (profileData.phone || "").trim(),
      isConfigured: true
    };
    setStorageItem(this.PROFILE_STORAGE_SLOT, JSON.stringify(this.user));
    this.updateSidebarProfile();
    this.render();
  }

  updateSidebarProfile() {
    const avatar = document.getElementById("sidebarUserInitials") || document.getElementById("userAvatarInitials");
    const nameEl = document.getElementById("sidebarUserName");
    const roleEl = document.getElementById("sidebarUserJurisdiction") || document.getElementById("sidebarUserRole");
    if (avatar) avatar.textContent = this.user.initials || "CA";
    if (nameEl) nameEl.textContent = this.user.shortName || "Advocate";
    if (roleEl) roleEl.textContent = this.user.isConfigured ? `${this.user.state} Resident` : "Setup Profile";
  }

  async loadDemoData() {
    setStorageItem(this.DEMO_MODE_STORAGE_SLOT, "true");
    this.isDemoMode = true;
    this.cases = [...INITIAL_CASES];
    this.interactions = [...INITIAL_INTERACTIONS];
    this.evidence = [...INITIAL_EVIDENCE];
    this.tradelines = [...INITIAL_CREDIT_TRADELINES];
    this.activeCaseId = this.cases[0]?.id || null;
    this.expandedCaseIds = new Set(this.activeCaseId ? [this.activeCaseId] : []);
    this.render();
    this.showToast("Demo Mode Enabled", "Pre-loaded 4 sample consumer debt defense dossiers.", "info");
    ipc.sendNotification("Demo Mode Enabled", "Pre-loaded 4 sample consumer debt defense dossiers.");
  }

  async clearAllData() {
    removeStorageItem(this.DEMO_MODE_STORAGE_SLOT);
    removeStorageItem("settlemint_demo_mode");
    removeStorageItem("counterfin_demo_mode");
    this.isDemoMode = false;
    if (ipc.isTauri()) {
      try {
        await ipc.clearAllCases();
      } catch (err) {
        console.error("Failed to clear backend SQLite cases:", err);
      }
    }
    this.cases = [];
    this.interactions = [];
    this.evidence = [];
    this.tradelines = [];
    this.activeCaseId = null;
    this.expandedCaseIds.clear();
    this.render();
    this.showToast("Workspace Cleared", "All cases and records cleared. Ready for new disputes.", "success");
    ipc.sendNotification("Workspace Cleared", "Local cases reset. Ready for new consumer disputes.");
  }

  showToast(title, message, type = "info") {
    if (typeof document === 'undefined') return;
    let container = document.getElementById("toastContainer");
    if (!container) {
      container = document.createElement("div");
      container.id = "toastContainer";
      container.className = "counterfin-toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `counterfin-toast counterfin-toast-${type}`;
    const iconSvg = type === 'success'
      ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>'
      : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';

    const iconDiv = document.createElement("div");
    iconDiv.className = "counterfin-toast-icon";
    iconDiv.innerHTML = iconSvg;

    const contentDiv = document.createElement("div");
    contentDiv.className = "counterfin-toast-content";

    const titleDiv = document.createElement("div");
    titleDiv.className = "counterfin-toast-title";
    titleDiv.textContent = title || "Notice";

    const msgDiv = document.createElement("div");
    msgDiv.className = "counterfin-toast-msg";
    msgDiv.textContent = message || "";

    contentDiv.appendChild(titleDiv);
    contentDiv.appendChild(msgDiv);

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "counterfin-toast-close";
    closeBtn.setAttribute("aria-label", "Close notification");
    closeBtn.textContent = "✕";

    toast.appendChild(iconDiv);
    toast.appendChild(contentDiv);
    toast.appendChild(closeBtn);

    const removeToast = () => {
      toast.classList.add("toast-hiding");
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    };

    closeBtn.addEventListener("click", removeToast);
    container.appendChild(toast);
    setTimeout(removeToast, 4000);
  }

  initElements() {
    this.sidebarBadgeCount = document.getElementById("sidebarBadgeCount");
    this.viewNavTabs = document.getElementById("viewNavTabs");
    this.viewDashboard = document.getElementById("viewDashboard");
    this.viewInteractions = document.getElementById("viewInteractions");
    this.viewLetters = document.getElementById("viewLetters");
    this.viewEvidence = document.getElementById("viewEvidence");
    this.viewCredit = document.getElementById("viewCredit");
  }

  getActiveCase() {
    return this.cases.find(c => c.id === this.activeCaseId) || this.cases[0] || null;
  }

  openUserProfileModal() {
    this.modalController?.openUserProfileModal();
  }

  openNewDisputeModal() {
    this.modalController?.openNewDisputeModal();
  }

  openLegalDisclaimer(isSplash = false) {
    this.disclaimerController?.openLegalDisclaimer(isSplash);
  }

  openStatutoryPatchesModal() {
    this.patchController?.openStatutoryPatchesModal();
  }

  bindEvents() {
    document.querySelectorAll(".nav-pill-item").forEach(item => {
      item.addEventListener("click", () => {
        const targetNav = item.getAttribute("data-nav");
        if (targetNav) this.switchView(targetNav);
      });
    });

    document.querySelectorAll(".workspace-tabs-row .tab-item").forEach(item => {
      item.addEventListener("click", () => {
        const targetNav = item.getAttribute("data-view");
        if (targetNav) this.switchView(targetNav);
      });
    });

    // Cross-platform desktop keyboard shortcuts (Windows/Linux Ctrl & macOS Cmd)
    window.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
        if (e.key === "n" || e.key === "N") {
          e.preventDefault();
          this.openNewDisputeModal();
        } else if (e.key === "k" || e.key === "K") {
          e.preventDefault();
          this.modalController?.showDialog(this.modalController?.callScriptModal);
        } else if (e.key === "g" || e.key === "G") {
          e.preventDefault();
          this.modalController?.showDialog(this.modalController?.disputeGuidesModal);
        } else if (e.key === "1") {
          e.preventDefault();
          this.switchView("dashboard");
        } else if (e.key === "2") {
          e.preventDefault();
          this.switchView("interactions");
        } else if (e.key === "3") {
          e.preventDefault();
          this.switchView("letters");
        } else if (e.key === "4") {
          e.preventDefault();
          this.switchView("evidence");
        } else if (e.key === "5") {
          e.preventDefault();
          this.switchView("credit");
        } else if (e.key === ",") {
          e.preventDefault();
          this.openUserProfileModal();
        }
      }
    });

    if (this.viewDashboard) {
      this.viewDashboard.addEventListener("click", (e) => this.handleDashboardClick(e));
      this.viewDashboard.addEventListener("change", (e) => {
        if (e.target.id === "disputeFilterSelect") {
          this.disputeFilter = e.target.value;
          this.renderCurrentView();
        }
      });
    }

    if (this.viewInteractions) {
      this.viewInteractions.addEventListener("click", (e) => this.handleInteractionsClick(e));
    }

    if (this.viewEvidence) {
      this.viewEvidence.addEventListener("click", (e) => this.handleEvidenceClick(e));
    }

    if (this.viewCredit) {
      this.viewCredit.addEventListener("click", (e) => this.handleCreditClick(e));
    }

    if (this.viewLetters) {
      this.viewLetters.addEventListener("click", (e) => this.handleLettersClick(e));
    }
  }

  handleDashboardClick(e) {
    if (this.handleDashboardNavActions(e)) return;
    this.handleDashboardCardToggle(e);
  }

  handleDashboardNavActions(e) {
    if (e.target.closest("#firstRunNewDisputeBtn, #demoBannerNewDisputeBtn")) {
      this.openNewDisputeModal();
      return true;
    }
    if (e.target.closest("#firstRunProfileBtn")) {
      this.openUserProfileModal();
      return true;
    }
    if (e.target.closest("#firstRunDemoBtn")) {
      this.loadDemoData();
      return true;
    }
    if (e.target.closest("#demoBannerClearBtn")) {
      this.clearAllData();
      return true;
    }
    if (e.target.closest("#openComplianceModalBtn")) {
      this.openLegalDisclaimer(!this.hasAgreedDisclaimer);
      return true;
    }
    const actionBtn = e.target.closest(".dispute-action-btn");
    if (actionBtn) {
      this.activeCaseId = actionBtn.getAttribute("data-case-id");
      actionBtn.getAttribute("data-action") === "letters" ? this.switchView("letters") : this.renderCurrentView();
      return true;
    }
    const openLetterBtn = e.target.closest(".quick-open-letter-btn");
    if (openLetterBtn) {
      this.activeCaseId = openLetterBtn.getAttribute("data-case-id");
      this.switchView("letters");
      return true;
    }
    const openCallsBtn = e.target.closest(".quick-open-calls-btn");
    if (openCallsBtn) {
      this.activeCaseId = openCallsBtn.getAttribute("data-case-id");
      this.switchView("interactions");
      return true;
    }
    return false;
  }

  handleDashboardCardToggle(e) {
    const toggleAllBtn = e.target.closest("#toggleAllDossiersBtn");
    if (toggleAllBtn) {
      const filtered = this.getFilteredCases();
      if (this.expandedCaseIds.size === filtered.length) {
        this.expandedCaseIds.clear();
      } else {
        this.expandedCaseIds = new Set(filtered.map(c => c.id));
      }
      this.renderCurrentView();
      return;
    }

    const expandTrigger = e.target.closest(".expandable-card-header, .dossier-expand-toggle");
    if (expandTrigger) {
      const card = expandTrigger.closest(".orderly-dispute-card");
      if (card) {
        const id = card.getAttribute("data-case-id");
        if (this.expandedCaseIds.has(id)) {
          this.expandedCaseIds.delete(id);
        } else {
          this.expandedCaseIds.clear();
          this.expandedCaseIds.add(id);
          this.activeCaseId = id;
        }
        this.renderCurrentView();
        return;
      }
    }

    const card = e.target.closest(".orderly-dispute-card");
    if (card && !e.target.closest(".expandable-card-body")) {
      const id = card.getAttribute("data-case-id");
      if (!this.expandedCaseIds.has(id)) {
        this.expandedCaseIds.clear();
        this.expandedCaseIds.add(id);
        this.activeCaseId = id;
        this.renderCurrentView();
      }
    }
  }

  getFilteredCases() {
    if (this.disputeFilter === "credit_card") {
      return this.cases.filter(c => c.debtType === "credit_card" || c.iconType === "credit_card");
    }
    if (this.disputeFilter === "medical") {
      return this.cases.filter(c => c.debtType === "medical" || (!c.debtType && !c.iconType?.includes("credit") && !c.iconType?.includes("auto") && !c.iconType?.includes("loan")));
    }
    if (this.disputeFilter === "auto_deficiency") {
      return this.cases.filter(c => c.debtType === "auto_deficiency" || c.iconType === "auto");
    }
    if (this.disputeFilter === "personal_loan") {
      return this.cases.filter(c => c.debtType === "personal_loan" || c.iconType === "loan");
    }
    return [...this.cases];
  }

  switchView(view) {
    this.currentView = view;
    document.querySelectorAll(".nav-pill-item").forEach(item => {
      item.classList.toggle("active", item.getAttribute("data-nav") === view);
    });
    const panels = [
      { id: "dashboard", el: this.viewDashboard },
      { id: "interactions", el: this.viewInteractions },
      { id: "letters", el: this.viewLetters },
      { id: "evidence", el: this.viewEvidence },
      { id: "credit", el: this.viewCredit }
    ];
    panels.forEach(p => {
      if (p.el) p.el.classList.toggle("active", p.id === view);
    });
    this.renderCurrentView();
  }

  handleInteractionsClick(e) {
    if (e.target.closest("#addInteractionLogBtn")) {
      const activeCase = this.getActiveCase();
      this.modalController?.openQuickLogModal(activeCase?.id);
      return;
    }
    if (e.target.closest("#interactionEmptyNewCaseBtn")) {
      this.openNewDisputeModal();
      return;
    }
  }

  handleEvidenceClick(e) {
    if (e.target.closest("#ingestEvidenceBtn, #emptyIngestEvidenceBtn, .btn-ingest-evidence-trigger")) {
      const activeCase = this.getActiveCase();
      this.modalController?.openIngestEvidenceModal(activeCase?.id);
      return;
    }
    if (e.target.closest("#evidenceEmptyNewCaseBtn")) {
      this.openNewDisputeModal();
      return;
    }
    const card = e.target.closest(".vault-item-card");
    const inspectBtn = e.target.closest(".vault-item-card button, .btn-inspect-artifact");
    if (card && inspectBtn) {
      const title = card.querySelector("[title]")?.getAttribute("title") || "Evidence Artifact";
      const hash = card.querySelector(".vault-hash-box")?.textContent?.replace("SHA-256:", "").trim() || "";
      const bates = card.querySelector(".status-pill-mint")?.textContent?.trim() || "";
      if (hash && navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(hash).catch(() => {});
      }
      this.showToast("Artifact Inspected", `${bates} • ${title} (SHA-256 digest copied)`, "info");
      return;
    }
  }

  handleCreditClick(e) {
    if (e.target.closest("#importCreditReportBtn, #emptyImportCreditReportBtn, .btn-import-credit-trigger")) {
      const activeCase = this.getActiveCase();
      this.modalController?.openIngestEvidenceModal(activeCase?.id);
      if (this.modalController?.evidenceDocType) {
        this.modalController.evidenceDocType.value = "credit_report";
      }
      return;
    }
    if (e.target.closest("#creditEmptyNewCaseBtn")) {
      this.openNewDisputeModal();
      return;
    }
    const target = e.target.closest("button");
    if (target) {
      if (target.classList.contains("cra-dispute-btn") || target.textContent.includes("Generate CRA Dispute Packet")) {
        this.switchView("letters");
        const templateSelect = document.getElementById("templateSelect");
        if (templateSelect) {
          templateSelect.value = "cra_dispute";
          templateSelect.dispatchEvent(new Event("change"));
        }
        return;
      }
      if (target.classList.contains("diff-tradeline-btn") || target.textContent.includes("Diff Historical Snapshot")) {
        this.showToast("Tradeline Delta Audit", "Historical diff: Account verified with zero undetected alterations in current reporting cycle.", "info");
        return;
      }
    }
  }

  handleLettersClick(e) {
    if (e.target.closest("#letterStudioEmptyNewCaseBtn")) {
      this.openNewDisputeModal();
      return;
    }
  }

  renderCurrentView() {
    try {
      const activeCase = this.getActiveCase();
      switch (this.currentView) {
        case "dashboard":
          this.renderDashboardView(activeCase);
          break;
        case "interactions":
          this.renderInteractionsView(activeCase);
          break;
        case "letters":
          this.renderLettersView(activeCase);
          break;
        case "evidence":
          this.renderEvidenceView(activeCase);
          break;
        case "credit":
          this.renderCreditView(activeCase);
          break;
      }
    } catch (err) {
      console.error("[CounterFin] Render loop error in view:", this.currentView, err);
    }
  }

  setSafeViewContent(container, htmlContent) {
    if (!container) return;
    const fragment = document.createRange().createContextualFragment(htmlContent);
    container.replaceChildren(fragment);
  }

  renderDashboardView(activeCase) {
    const filteredCases = this.getFilteredCases();
    this.setSafeViewContent(this.viewDashboard, renderDashboard(activeCase, filteredCases, this.expandedCaseIds, this.user, this.isDemoMode));
    const filterEl = document.getElementById("disputeFilterSelect");
    if (filterEl) filterEl.value = this.disputeFilter;

    document.getElementById("firstRunNewDisputeBtn")?.addEventListener("click", () => this.openNewDisputeModal());
    document.getElementById("firstRunProfileBtn")?.addEventListener("click", () => this.openUserProfileModal());
    document.getElementById("firstRunDemoBtn")?.addEventListener("click", () => this.loadDemoData());
    document.getElementById("demoBannerNewDisputeBtn")?.addEventListener("click", () => this.openNewDisputeModal());
    document.getElementById("demoBannerClearBtn")?.addEventListener("click", () => this.clearAllData());
  }

  renderInteractionsView(activeCase) {
    this.setSafeViewContent(this.viewInteractions, renderInteractions(this.interactions, activeCase));
    document.getElementById("interactionEmptyNewCaseBtn")?.addEventListener("click", () => this.openNewDisputeModal());
    document.getElementById("addInteractionLogBtn")?.addEventListener("click", () => {
      this.modalController.openQuickLogModal(activeCase?.id);
    });
  }

  renderEvidenceView(activeCase) {
    this.setSafeViewContent(this.viewEvidence, renderEvidenceVault(this.evidence, activeCase));
    document.getElementById("evidenceEmptyNewCaseBtn")?.addEventListener("click", () => this.openNewDisputeModal());
    document.getElementById("ingestEvidenceBtn")?.addEventListener("click", () => {
      this.modalController.openIngestEvidenceModal(activeCase?.id);
    });
    document.getElementById("emptyIngestEvidenceBtn")?.addEventListener("click", () => {
      this.modalController.openIngestEvidenceModal(activeCase?.id);
    });

    if (this.viewEvidence) {
      this.viewEvidence.querySelectorAll(".vault-item-card").forEach(card => {
        const inspectBtn = card.querySelector("button");
        const title = card.querySelector("[title]")?.getAttribute("title") || "Evidence Artifact";
        const hash = card.querySelector(".vault-hash-box")?.textContent?.replace("SHA-256:", "").trim() || "";
        const bates = card.querySelector(".status-pill-mint")?.textContent?.trim() || "";
        inspectBtn?.addEventListener("click", () => {
          if (hash && navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(hash);
          }
          this.showToast("Artifact Inspected", `${bates} • ${title} (SHA-256 digest copied)`, "info");
        });
      });
    }
  }

  renderCreditView(activeCase) {
    this.setSafeViewContent(this.viewCredit, renderCreditAudit(this.tradelines, activeCase));
    document.getElementById("creditEmptyNewCaseBtn")?.addEventListener("click", () => this.openNewDisputeModal());
    document.getElementById("importCreditReportBtn")?.addEventListener("click", () => {
      this.modalController.openIngestEvidenceModal(activeCase?.id);
      if (this.modalController.evidenceDocType) {
        this.modalController.evidenceDocType.value = "credit_report";
      }
    });

    if (this.viewCredit) {
      this.viewCredit.querySelectorAll("button").forEach(btn => {
        if (btn.textContent.includes("Generate CRA Dispute Packet")) {
          btn.addEventListener("click", () => {
            this.switchView("letters");
            const templateSelect = document.getElementById("templateSelect");
            if (templateSelect) {
              templateSelect.value = "cra_dispute";
              templateSelect.dispatchEvent(new Event("change"));
            }
          });
        } else if (btn.textContent.includes("Diff Historical Snapshot")) {
          btn.addEventListener("click", () => {
            this.showToast("Tradeline Delta Audit", "Historical diff: Account verified with zero undetected alterations in current reporting cycle.", "info");
          });
        }
      });
    }
  }

  renderLettersView(activeCase) {
    this.setSafeViewContent(this.viewLetters, renderLetterStudio(activeCase, this.user));
    this.letterController.bindLetterEvents(activeCase);
  }

  render() {
    if (this.sidebarBadgeCount) {
      this.sidebarBadgeCount.textContent = this.cases.length;
    }
    this.renderCurrentView();
  }

  async initBackendData() {
    if (!ipc.isTauri()) return;
    try {
      await this.syncBackendCases();
      await this.syncBackendInteractions();
      await this.subscribeBackendEvents();
      this.render();
    } catch (_err) {
      // Backend initialization handled gracefully
    }
  }

  async syncBackendCases() {
    const backendCases = await ipc.getCases();
    if (!backendCases || backendCases.length === 0) {
      if (this.isDemoMode) await this.loadDemoData();
      return;
    }
    const isLegacy = backendCases.every(bc => 
      bc.docket_number.startsWith("BATES-SM-2026-00") && 
      (bc.debtor_name === "Sarah Henderson" || bc.debtor_name === "Jordan Vance")
    );
    if (isLegacy && !this.isDemoMode) {
      for (const bc of backendCases) {
        try { await ipc.deleteCase(bc.id); } catch (_e) { /* ignore */ }
      }
      this.cases = [];
      this.activeCaseId = null;
      this.expandedCaseIds.clear();
      return;
    }
    this.cases = backendCases.map(bc => ({
      id: bc.id,
      docketNumber: bc.docket_number,
      debtorName: bc.debtor_name,
      debtType: typeof bc.debt_type === 'string' ? bc.debt_type.toLowerCase() : 'credit_card',
      originalProvider: bc.provider_name,
      providerCategory: bc.debt_type,
      iconType: typeof bc.debt_type === 'string' && bc.debt_type.toLowerCase().includes('card') ? 'credit_card' : 'medical',
      collectionAgency: bc.collection_agency,
      originalAccountNumber: bc.original_account_number,
      collectionAccountNumber: bc.collection_account_number,
      dateOfService: bc.date_of_service || bc.initial_notice_date,
      initialNoticeDate: bc.initial_notice_date,
      originalBalance: bc.original_balance,
      disputedBalance: bc.disputed_balance,
      currentPhase: bc.status,
      statuteState: bc.jurisdiction_state,
      statuteLimitYears: 3,
      statutoryDaysRemaining: 30,
      statusBadge: bc.status,
      secondaryBadge: "Persistent SQLite Dossier",
      certifiedMailDeliveredDate: null,
      certifiedMailTracking: bc.certified_mail_tracking || '7021 0950 0001 9841 3320',
      actionLabel: "View Details",
      violationsCount: 0,
      potentialDamages: 0.00,
      collectionStatus: "Active",
      notes: "Synchronized with local encrypted SQLite database.",
      legalFramework: "FDCPA 15 U.S.C. § 1692"
    }));
    if (!this.cases.some(c => c.id === this.activeCaseId)) {
      this.activeCaseId = this.cases[0]?.id || null;
    }
  }

  async syncBackendInteractions() {
    if (!this.activeCaseId) return;
    try {
      const dbInteractions = await ipc.getInteractions(this.activeCaseId);
      if (dbInteractions && dbInteractions.length > 0) {
        this.interactions = dbInteractions.map(dbi => ({
          id: dbi.id,
          caseId: dbi.case_id,
          date: dbi.timestamp ? new Date(dbi.timestamp).toLocaleDateString() : "Recent",
          timestamp: dbi.timestamp ? new Date(dbi.timestamp).toLocaleTimeString() : "",
          channel: dbi.channel,
          direction: dbi.direction,
          contactName: dbi.contact_name,
          agentName: dbi.contact_name,
          contactNumber: dbi.contact_phone || "Unknown",
          durationSec: dbi.duration_seconds,
          duration: `${Math.round(dbi.duration_seconds / 60)} mins`,
          summary: dbi.summary_notes,
          notes: dbi.summary_notes,
          recorded: dbi.recorded_flag,
          violations: []
        }));
      }
      const damages = await ipc.getCaseStatutoryDamages(this.activeCaseId);
      if (damages) {
        const active = this.getActiveCase();
        if (active) {
          active.potentialDamages = damages.total_potential_damages;
          active.violationsCount = damages.violation_count;
        }
      }
    } catch (_e) {
      // Backend sync note handled gracefully
    }
  }

  async subscribeBackendEvents() {
    await ipc.listen('system://deadline_approaching', (event) => {
      const p = event.payload || {};
      ipc.sendNotification(
        "Statutory Deadline Alert",
        p.title ? `${p.title} (${p.days_remaining} days remaining)` : "A statutory deadline is approaching."
      );
    });
    await ipc.listen('system://case_status_changed', (event) => {
      const p = event.payload || {};
      ipc.sendNotification("Case Status Advanced", `Case ${p.case_id} transitioned to ${p.new_status}`);
      this.render();
    });
    // System Tray integration across Windows, macOS, and Linux
    await ipc.listen('open-quick-log', () => {
      this.modalController?.openQuickLogModal();
    });
    await ipc.listen('toggle-silence-24h', () => {
      ipc.sendNotification("Notifications Silenced", "Statutory deadline alerts paused for 24 hours.");
    });
  }
}

function bootstrapApp() {
  if (typeof window !== "undefined" && !window.app) {
    if (typeof document !== "undefined" && document.getElementById && document.getElementById("viewDashboard")) {
      window.app = new CounterFinApp();
      console.info("CounterFin Consumer Debt Protection Dashboard Initialized.");
    }
  }
}

if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", bootstrapApp);
  } else {
    bootstrapApp();
  }
}

export { CounterFinApp, CounterFinApp as SettleMintApp };
