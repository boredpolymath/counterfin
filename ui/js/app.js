/**
 * SettleMint Core Application Bootstrap & Controller
 * Architecture: SettleMint Consumer Advocacy System
 */

import { ipc } from './ipc.js';
import { 
  USER_PROFILE,
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

class SettleMintApp {
  constructor() {
    this.user = { ...USER_PROFILE };
    this.cases = [...INITIAL_CASES];
    this.interactions = [...INITIAL_INTERACTIONS];
    this.evidence = [...INITIAL_EVIDENCE];
    this.tradelines = [...INITIAL_CREDIT_TRADELINES];

    this.activeCaseId = this.cases[0]?.id || null;
    this.currentView = "dashboard";
    this.disputeFilter = "all";

    this.initElements();
    this.bindEvents();
    this.render();
  }

  initElements() {
    // Navigation & header
    this.sidebarBadgeCount = document.getElementById("sidebarBadgeCount");
    this.viewNavTabs = document.getElementById("viewNavTabs");

    // View panels
    this.viewDashboard = document.getElementById("viewDashboard");
    this.viewInteractions = document.getElementById("viewInteractions");
    this.viewLetters = document.getElementById("viewLetters");
    this.viewEvidence = document.getElementById("viewEvidence");
    this.viewCredit = document.getElementById("viewCredit");

    // Call Script Modal
    this.callScriptModal = document.getElementById("callScriptModal");
    this.callScriptBtn = document.getElementById("callScriptBtn");
    this.closeCallScriptModal = document.getElementById("closeCallScriptModal");
    this.dismissCallScriptBtn = document.getElementById("dismissCallScriptBtn");

    // Dispute Guides Modal
    this.disputeGuidesModal = document.getElementById("disputeGuidesModal");
    this.closeDisputeGuidesModal = document.getElementById("closeDisputeGuidesModal");
    this.dismissDisputeGuidesBtn = document.getElementById("dismissDisputeGuidesBtn");

    // New Dispute Modal
    this.newDisputeModal = document.getElementById("newDisputeModal");
    this.newCaseBtn = document.getElementById("newCaseBtn");
    this.closeNewDisputeModal = document.getElementById("closeNewDisputeModal");
    this.cancelNewDisputeBtn = document.getElementById("cancelNewDisputeBtn");
    this.newDisputeForm = document.getElementById("newDisputeForm");
  }

  getActiveCase() {
    return this.cases.find(c => c.id === this.activeCaseId) || this.cases[0];
  }

  bindEvents() {
    // 1. Sidebar Nav Pills
    document.querySelectorAll(".nav-pill-item").forEach(item => {
      item.addEventListener("click", () => {
        const targetNav = item.getAttribute("data-nav");
        if (targetNav) {
          this.switchView(targetNav);
        }
      });
    });

    // 2. Call Script Modal
    if (this.callScriptBtn) {
      this.callScriptBtn.addEventListener("click", () => this.callScriptModal.showModal());
    }
    if (this.closeCallScriptModal) {
      this.closeCallScriptModal.addEventListener("click", () => this.callScriptModal.close());
    }
    if (this.dismissCallScriptBtn) {
      this.dismissCallScriptBtn.addEventListener("click", () => this.callScriptModal.close());
    }

    // 3. Dispute Guides Modal
    if (this.closeDisputeGuidesModal) {
      this.closeDisputeGuidesModal.addEventListener("click", () => this.disputeGuidesModal.close());
    }
    if (this.dismissDisputeGuidesBtn) {
      this.dismissDisputeGuidesBtn.addEventListener("click", () => this.disputeGuidesModal.close());
    }

    // 4. New Dispute Modal
    if (this.newCaseBtn) {
      this.newCaseBtn.addEventListener("click", () => this.newDisputeModal.showModal());
    }
    if (this.closeNewDisputeModal) {
      this.closeNewDisputeModal.addEventListener("click", () => this.newDisputeModal.close());
    }
    if (this.cancelNewDisputeBtn) {
      this.cancelNewDisputeBtn.addEventListener("click", () => this.newDisputeModal.close());
    }
    if (this.newDisputeForm) {
      this.newDisputeForm.addEventListener("submit", (e) => this.handleNewDisputeSubmit(e));
    }

    // 5. Dynamic Dashboard View event delegation
    if (this.viewDashboard) {
      this.viewDashboard.addEventListener("click", (e) => {
        // Dispute action button (e.g. View Details or Review Letter)
        const actionBtn = e.target.closest(".dispute-action-btn");
        if (actionBtn) {
          const caseId = actionBtn.getAttribute("data-case-id");
          const action = actionBtn.getAttribute("data-action");
          this.activeCaseId = caseId;
          if (action === "letters") {
            this.switchView("letters");
          } else {
            // Toggle expansion of active case
            this.renderCurrentView();
          }
          return;
        }

        // Quick open letter studio from expanded tray
        const openLetterBtn = e.target.closest(".quick-open-letter-btn");
        if (openLetterBtn) {
          const caseId = openLetterBtn.getAttribute("data-case-id");
          this.activeCaseId = caseId;
          this.switchView("letters");
          return;
        }

        // Quick open calls log from expanded tray
        const openCallsBtn = e.target.closest(".quick-open-calls-btn");
        if (openCallsBtn) {
          const caseId = openCallsBtn.getAttribute("data-case-id");
          this.activeCaseId = caseId;
          this.switchView("interactions");
          return;
        }

        // Dispute Card row select
        const cardItem = e.target.closest(".orderly-dispute-card");
        if (cardItem) {
          const caseId = cardItem.getAttribute("data-case-id");
          this.activeCaseId = caseId;
          this.renderCurrentView();
        }
      });

      // Dispute filter select change
      this.viewDashboard.addEventListener("change", (e) => {
        if (e.target.id === "disputeFilterSelect") {
          this.disputeFilter = e.target.value;
          this.renderCurrentView();
        }
      });
    }
  }

  switchView(view) {
    this.currentView = view;

    // Update active class on nav pills
    document.querySelectorAll(".nav-pill-item").forEach(item => {
      item.classList.toggle("active", item.getAttribute("data-nav") === view);
    });

    // Toggle view panels
    const panels = [
      { id: "dashboard", el: this.viewDashboard },
      { id: "interactions", el: this.viewInteractions },
      { id: "letters", el: this.viewLetters },
      { id: "evidence", el: this.viewEvidence },
      { id: "credit", el: this.viewCredit }
    ];

    panels.forEach(p => {
      if (p.el) {
        if (p.id === view) {
          p.el.classList.add("active");
        } else {
          p.el.classList.remove("active");
        }
      }
    });

    this.renderCurrentView();
  }

  handleNewDisputeSubmit(e) {
    e.preventDefault();
    const provider = document.getElementById("newProviderName").value;
    const agency = document.getElementById("newAgencyName").value;
    const balance = parseFloat(document.getElementById("newBalance").value) || 0;
    const category = document.getElementById("newCategory").value;
    const accountNum = document.getElementById("newAccountNumber").value || `ACC-${Date.now().toString().slice(-5)}`;

    const caseCount = this.cases.length + 1;
    const batesStr = `BATES-SM-2026-004${caseCount}`;

    let iconType = "emergency";
    if (category.includes("Imaging") || category.includes("Radiology")) iconType = "imaging";
    else if (category.includes("Cardiology") || category.includes("Specialist")) iconType = "cardiology";

    const newCase = {
      id: `case-sm-2026-004${caseCount}`,
      docketNumber: batesStr,
      debtorName: this.user.name,
      originalProvider: provider,
      providerCategory: category,
      iconType: iconType,
      collectionAgency: agency,
      originalAccountNumber: accountNum,
      collectionAccountNumber: `AGY-${Date.now().toString().slice(-4)}`,
      dateOfService: new Date().toISOString().slice(0, 10),
      initialNoticeDate: new Date().toISOString().slice(0, 10),
      originalBalance: balance,
      disputedBalance: balance,
      currentPhase: "InitialNotice",
      statuteState: "NY",
      statuteLimitYears: 3,
      statutoryDaysRemaining: 30,
      statusBadge: "Notice Received",
      secondaryBadge: "Standard 30-day window",
      certifiedMailDeliveredDate: null,
      certifiedMailTracking: "",
      actionLabel: "Review Letter",
      violationsCount: 0,
      potentialDamages: 0.00,
      collectionStatus: "Dispute letter ready to send",
      notes: "Newly ingested clinical debt dossier. Initiating 30-day verification demand."
    };

    this.cases.push(newCase);
    this.activeCaseId = newCase.id;

    if (this.sidebarBadgeCount) {
      this.sidebarBadgeCount.textContent = this.cases.length;
    }

    this.newDisputeModal.close();
    this.newDisputeForm.reset();

    ipc.sendNotification(
      "New Dispute Opened",
      `Dispute initiated for ${provider} ($${balance.toFixed(2)}).`
    );

    this.render();
  }

  renderCurrentView() {
    const activeCase = this.getActiveCase();
    if (!activeCase) return;

    let filteredCases = [...this.cases];
    if (this.disputeFilter === "er") {
      filteredCases = this.cases.filter(c => c.providerCategory.includes("Emergency"));
    } else if (this.disputeFilter === "specialist") {
      filteredCases = this.cases.filter(c => c.providerCategory.includes("Specialist") || c.providerCategory.includes("Cardiology"));
    } else if (this.disputeFilter === "imaging") {
      filteredCases = this.cases.filter(c => c.providerCategory.includes("Radiology") || c.providerCategory.includes("Imaging"));
    }

    switch (this.currentView) {
      case "dashboard":
        this.viewDashboard.innerHTML = renderDashboard(activeCase, filteredCases);
        const filterEl = document.getElementById("disputeFilterSelect");
        if (filterEl) {
          filterEl.value = this.disputeFilter;
        }
        break;
      case "interactions":
        this.viewInteractions.innerHTML = renderInteractions(this.interactions, activeCase);
        break;
      case "letters":
        this.viewLetters.innerHTML = renderLetterStudio(activeCase);
        const copyBtn = document.getElementById("copyTextBtn");
        if (copyBtn) {
          copyBtn.addEventListener("click", () => {
            const paper = document.getElementById("legalDocumentPaper");
            if (paper) {
              navigator.clipboard?.writeText(paper.innerText);
              copyBtn.textContent = "Copied ✓";
              setTimeout(() => { copyBtn.textContent = "Copy Text"; }, 2000);
            }
          });
        }
        const exportPdfBtn = document.getElementById("exportPdfBtn");
        if (exportPdfBtn) {
          exportPdfBtn.addEventListener("click", () => {
            ipc.sendNotification(
              "Certified PDF Dispatched",
              `Bates stamped letter ${activeCase.docketNumber}-DOC01 generated and encrypted to vault.`
            );
            exportPdfBtn.textContent = "Exported ✓";
            setTimeout(() => { exportPdfBtn.textContent = "Export Certified PDF"; }, 2000);
          });
        }
        break;
      case "evidence":
        this.viewEvidence.innerHTML = renderEvidenceVault(this.evidence, activeCase);
        break;
      case "credit":
        this.viewCredit.innerHTML = renderCreditAudit(this.tradelines, activeCase);
        break;
    }
  }

  render() {
    if (this.sidebarBadgeCount) {
      this.sidebarBadgeCount.textContent = this.cases.length;
    }
    this.renderCurrentView();
  }
}

// Bootstrap application on DOM load
window.addEventListener("DOMContentLoaded", () => {
  window.app = new SettleMintApp();
  console.log("SettleMint Patient Protection Dashboard Initialized.");
});
