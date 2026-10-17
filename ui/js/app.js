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

import { getStorageItem, setStorageItem, removeStorageItem } from './utils/storage.js';
import { setSafeViewContent } from './utils/dom.js';
import { showToast } from './components/toast.js';
import { 
  loadUserProfileFromStorage, 
  saveUserProfileToStorage, 
  updateSidebarProfileUI 
} from './state/user-profile.js';
import { 
  initBackendData, 
  syncBackendCases, 
  syncBackendInteractions, 
  subscribeBackendEvents 
} from './state/backend-sync.js';
import {
  handleDashboardClick,
  handleDashboardNavActions,
  handleDashboardCardToggle,
  handleInteractionsClick,
  handleEvidenceClick,
  handleCreditClick,
  handleLettersClick
} from './components/event-handlers.js';

class DebtSharkApp {
  constructor() {
    this.PROFILE_STORAGE_SLOT = "debtshark_user_profile_v1";
    this.DEMO_MODE_STORAGE_SLOT = "debtshark_demo_mode";

    const demoStored = getStorageItem(this.DEMO_MODE_STORAGE_SLOT) ?? getStorageItem("counterfin_demo_mode") ?? getStorageItem("settlemint_demo_mode");
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
      const toastHandler = (e) => {
        if (e.detail) {
          this.showToast(e.detail.title, e.detail.message, e.detail.type);
        }
      };
      window.addEventListener("debtshark:toast", toastHandler);
      window.addEventListener("counterfin:toast", toastHandler);
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
    this.user = loadUserProfileFromStorage(this.PROFILE_STORAGE_SLOT);
  }

  saveUserProfile(profileData) {
    this.user = saveUserProfileToStorage(this.PROFILE_STORAGE_SLOT, profileData);
    this.updateSidebarProfile();
    this.render();
  }

  updateSidebarProfile() {
    updateSidebarProfileUI(this.user);
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
    ipc.sendNotification("Demo Mode Enabled", "Pre-loaded 4 sample consumer debt defense dossiers.", "info");
  }

  async clearAllData() {
    removeStorageItem(this.DEMO_MODE_STORAGE_SLOT);
    removeStorageItem("debtshark_demo_mode");
    removeStorageItem("counterfin_demo_mode");
    removeStorageItem("settlemint_demo_mode");
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
    ipc.sendNotification("Workspace Cleared", "All cases and records cleared. Ready for new disputes.", "success");
  }

  showToast(title, message, type = "info") {
    showToast(title, message, type);
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
    handleDashboardClick(this, e);
  }

  handleDashboardNavActions(e) {
    return handleDashboardNavActions(this, e);
  }

  handleDashboardCardToggle(e) {
    handleDashboardCardToggle(this, e);
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
    handleInteractionsClick(this, e);
  }

  handleEvidenceClick(e) {
    handleEvidenceClick(this, e);
  }

  handleCreditClick(e) {
    handleCreditClick(this, e);
  }

  handleLettersClick(e) {
    handleLettersClick(this, e);
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
      console.error("[DebtShark] Render loop error in view:", this.currentView, err);
    }
  }

  setSafeViewContent(container, htmlContent) {
    setSafeViewContent(container, htmlContent);
  }

  renderDashboardView(activeCase) {
    const filteredCases = this.getFilteredCases();
    this.setSafeViewContent(this.viewDashboard, renderDashboard(activeCase, filteredCases, this.expandedCaseIds, this.user, this.isDemoMode));
    const filterEl = document.getElementById("disputeFilterSelect");
    if (filterEl) filterEl.value = this.disputeFilter;
  }

  renderInteractionsView(activeCase) {
    this.setSafeViewContent(this.viewInteractions, renderInteractions(this.interactions, activeCase));
  }

  renderEvidenceView(activeCase) {
    this.setSafeViewContent(this.viewEvidence, renderEvidenceVault(this.evidence, activeCase));
  }

  renderCreditView(activeCase) {
    this.setSafeViewContent(this.viewCredit, renderCreditAudit(this.tradelines, activeCase));
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
    return initBackendData(this);
  }

  async syncBackendCases() {
    return syncBackendCases(this);
  }

  async syncBackendInteractions() {
    return syncBackendInteractions(this);
  }

  async subscribeBackendEvents() {
    return subscribeBackendEvents(this);
  }
}

function bootstrapApp() {
  if (typeof window !== "undefined" && !window.app) {
    if (typeof document !== "undefined" && document.getElementById && document.getElementById("viewDashboard")) {
      window.app = new DebtSharkApp();
      console.info("DebtShark Consumer Debt Protection Dashboard Initialized.");
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

export { DebtSharkApp, DebtSharkApp as CounterFinApp, DebtSharkApp as SettleMintApp };
