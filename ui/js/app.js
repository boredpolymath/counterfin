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

class SettleMintApp {
  constructor() {
    this.PROFILE_STORAGE_SLOT = "settlemint_user_profile_v1";
    this.DEMO_MODE_STORAGE_SLOT = "settlemint_demo_mode";

    this.isDemoMode = localStorage.getItem(this.DEMO_MODE_STORAGE_SLOT) === "true";
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
    const raw = localStorage.getItem(this.PROFILE_STORAGE_SLOT);
    if (raw) {
      try {
        this.user = JSON.parse(raw);
        return;
      } catch (e) {
        console.debug("Failed parsing user profile:", e);
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
    localStorage.setItem(this.PROFILE_STORAGE_SLOT, JSON.stringify(this.user));
    this.updateSidebarProfile();
    this.render();
  }

  updateSidebarProfile() {
    const avatar = document.getElementById("userAvatarInitials");
    const nameEl = document.getElementById("sidebarUserName");
    const roleEl = document.getElementById("sidebarUserRole");
    if (avatar) avatar.textContent = this.user.initials || "CA";
    if (nameEl) nameEl.textContent = this.user.shortName || "Advocate";
    if (roleEl) roleEl.textContent = this.user.isConfigured ? `${this.user.state} Resident` : "Setup Profile";
  }

  async loadDemoData() {
    localStorage.setItem(this.DEMO_MODE_STORAGE_SLOT, "true");
    this.isDemoMode = true;
    this.cases = [...INITIAL_CASES];
    this.interactions = [...INITIAL_INTERACTIONS];
    this.evidence = [...INITIAL_EVIDENCE];
    this.tradelines = [...INITIAL_CREDIT_TRADELINES];
    this.activeCaseId = this.cases[0]?.id || null;
    this.expandedCaseIds = new Set(this.activeCaseId ? [this.activeCaseId] : []);
    this.render();
    ipc.sendNotification("Demo Mode Enabled", "Pre-loaded 4 sample consumer debt defense dossiers.");
  }

  async clearAllData() {
    localStorage.removeItem(this.DEMO_MODE_STORAGE_SLOT);
    this.isDemoMode = false;
    this.cases = [];
    this.interactions = [];
    this.evidence = [];
    this.tradelines = [];
    this.activeCaseId = null;
    this.expandedCaseIds.clear();
    this.render();
    ipc.sendNotification("Workspace Cleared", "Local cases reset. Ready for new consumer disputes.");
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

    if (this.viewDashboard) {
      this.viewDashboard.addEventListener("click", (e) => this.handleDashboardClick(e));
      this.viewDashboard.addEventListener("change", (e) => {
        if (e.target.id === "disputeFilterSelect") {
          this.disputeFilter = e.target.value;
          this.renderCurrentView();
        }
      });
    }
  }

  handleDashboardClick(e) {
    if (this.handleDashboardNavActions(e)) return;
    this.handleDashboardCardToggle(e);
  }

  handleDashboardNavActions(e) {
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
        this.expandedCaseIds.has(id) ? this.expandedCaseIds.delete(id) : (this.expandedCaseIds.clear(), this.expandedCaseIds.add(id), this.activeCaseId = id);
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

  renderCurrentView() {
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
  }

  renderEvidenceView(activeCase) {
    this.setSafeViewContent(this.viewEvidence, renderEvidenceVault(this.evidence, activeCase));
    document.getElementById("evidenceEmptyNewCaseBtn")?.addEventListener("click", () => this.openNewDisputeModal());
  }

  renderCreditView(activeCase) {
    this.setSafeViewContent(this.viewCredit, renderCreditAudit(this.tradelines, activeCase));
    document.getElementById("creditEmptyNewCaseBtn")?.addEventListener("click", () => this.openNewDisputeModal());
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
    } catch (err) {
      console.warn("Failed initializing backend SQLite data:", err);
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
        try { await ipc.deleteCase(bc.id); } catch (e) { /* ignore */ }
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
          agentName: dbi.contact_name,
          contactNumber: dbi.contact_phone || "Unknown",
          duration: `${Math.round(dbi.duration_seconds / 60)} mins`,
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
    } catch (e) {
      console.debug("Backend interaction/damages sync note:", e);
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
  }
}

window.addEventListener("DOMContentLoaded", () => {
  window.app = new SettleMintApp();
  console.info("SettleMint Consumer Debt Protection Dashboard Initialized.");
});
