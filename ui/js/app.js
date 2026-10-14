/**
 * SettleMint Core Application Bootstrap & Controller
 * Architecture: SettleMint Consumer Advocacy System
 * Expansively supports all consumer debts covered by the FDCPA:
 * Credit Card Portfolios, Medical Debts, Auto Loan Deficiencies, Installment Loans, Utilities
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
    this.expandedCaseIds = new Set(this.activeCaseId ? [this.activeCaseId] : []);
    this.currentView = "dashboard";
    this.disputeFilter = "all";

    // Legal compliance & disclaimer gate state
    this.DISCLAIMER_STORAGE_KEY = "settlemint_legal_disclaimer_agreed_v1";
    this.hasAgreedDisclaimer = false;

    this.initElements();
    this.bindEvents();
    this.render();
    this.initLegalDisclaimer();
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

    // Mandatory Legal Disclaimer Splash Screen & Gate
    this.legalDisclaimerModal = document.getElementById("legalDisclaimerModal");
    this.closeLegalDisclaimerModal = document.getElementById("closeLegalDisclaimerModal");
    this.disclaimerSplashTag = document.getElementById("disclaimerSplashTag");
    this.legalDisclaimerTitle = document.getElementById("legalDisclaimerTitle");
    this.legalDisclaimerSubtitle = document.getElementById("legalDisclaimerSubtitle");
    this.disclaimerConsentSection = document.getElementById("disclaimerConsentSection");
    this.disclaimerConsentCheckbox = document.getElementById("disclaimerConsentCheckbox");
    this.disclaimerValidationMsg = document.getElementById("disclaimerValidationMsg");
    this.disclaimerAgreedCard = document.getElementById("disclaimerAgreedCard");
    this.disclaimerAgreedMeta = document.getElementById("disclaimerAgreedMeta");
    this.resetDisclaimerBtn = document.getElementById("resetDisclaimerBtn");
    this.agreeDisclaimerBtn = document.getElementById("agreeDisclaimerBtn");
    this.declineDisclaimerBtn = document.getElementById("declineDisclaimerBtn");
    this.closeDisclaimerReviewBtn = document.getElementById("closeDisclaimerReviewBtn");
    this.footerDisclaimerBtn = document.getElementById("footerDisclaimerBtn");

    // Access Restricted (Disclaimer Declined) Modal
    this.disclaimerDeclinedModal = document.getElementById("disclaimerDeclinedModal");
    this.returnToDisclaimerBtn = document.getElementById("returnToDisclaimerBtn");
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
      this.closeDisputeGuidesModal.addEventListener("click", () => this.disputeGuidesModal.showModal());
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

    // 4b. Mandatory Legal Disclaimer Splash Screen & Gate
    if (this.disclaimerConsentCheckbox) {
      this.disclaimerConsentCheckbox.addEventListener("change", () => this.handleDisclaimerConsentToggle());
    }
    if (this.agreeDisclaimerBtn) {
      this.agreeDisclaimerBtn.addEventListener("click", () => this.handleDisclaimerAgreementSubmit());
    }
    if (this.declineDisclaimerBtn) {
      this.declineDisclaimerBtn.addEventListener("click", () => {
        if (this.legalDisclaimerModal) this.legalDisclaimerModal.close();
        if (this.disclaimerDeclinedModal) this.disclaimerDeclinedModal.showModal();
      });
    }
    if (this.returnToDisclaimerBtn) {
      this.returnToDisclaimerBtn.addEventListener("click", () => {
        if (this.disclaimerDeclinedModal) this.disclaimerDeclinedModal.close();
        this.openLegalDisclaimer(true);
      });
    }
    if (this.resetDisclaimerBtn) {
      this.resetDisclaimerBtn.addEventListener("click", () => {
        try {
          localStorage.removeItem(this.DISCLAIMER_STORAGE_KEY);
        } catch (e) {}
        this.hasAgreedDisclaimer = false;
        this.openLegalDisclaimer(true);
      });
    }
    if (this.closeLegalDisclaimerModal) {
      this.closeLegalDisclaimerModal.addEventListener("click", () => {
        if (this.hasAgreedDisclaimer && this.legalDisclaimerModal) {
          this.legalDisclaimerModal.close();
        }
      });
    }
    if (this.closeDisclaimerReviewBtn) {
      this.closeDisclaimerReviewBtn.addEventListener("click", () => {
        if (this.hasAgreedDisclaimer && this.legalDisclaimerModal) {
          this.legalDisclaimerModal.close();
        }
      });
    }
    if (this.legalDisclaimerModal) {
      // Intercept Escape key when agreement has not been accepted
      this.legalDisclaimerModal.addEventListener("cancel", (e) => {
        if (!this.hasAgreedDisclaimer) {
          e.preventDefault();
          this.handleDisclaimerAgreementSubmit();
        }
      });
      // Click on backdrop should not dismiss splash screen
      this.legalDisclaimerModal.addEventListener("click", (e) => {
        if (e.target === this.legalDisclaimerModal) {
          if (!this.hasAgreedDisclaimer) {
            this.handleDisclaimerAgreementSubmit();
          } else {
            this.legalDisclaimerModal.close();
          }
        }
      });
    }
    if (this.footerDisclaimerBtn) {
      this.footerDisclaimerBtn.addEventListener("click", () => {
        this.openLegalDisclaimer(!this.hasAgreedDisclaimer);
      });
    }

    // Dynamic intake subcategory synchronization
    const debtTypeSelect = document.getElementById("newDebtType");
    const categorySelect = document.getElementById("newCategory");
    if (debtTypeSelect && categorySelect) {
      debtTypeSelect.addEventListener("change", (e) => {
        const type = e.target.value;
        if (type === "credit_card") {
          categorySelect.innerHTML = `
            <option value="Credit Card (Revolving)">Revolving Consumer Credit Card</option>
            <option value="Store / Retail Credit Card">Retail / Store Card</option>
            <option value="Secured Credit Card">Secured Credit Line</option>
          `;
        } else if (type === "medical") {
          categorySelect.innerHTML = `
            <option value="Emergency Department">Emergency Room (ER Visit)</option>
            <option value="Specialist Consultation">Specialist / Surgery</option>
            <option value="Diagnostic Radiology">Radiology / MRI Scan</option>
            <option value="Pathology / Laboratory">Clinical Laboratory Services</option>
          `;
        } else if (type === "auto_deficiency") {
          categorySelect.innerHTML = `
            <option value="Auto Finance (Deficiency)">Repossession Deficiency Balance</option>
            <option value="Auto Lease Return">Lease End Wear & Tear Arrears</option>
          `;
        } else if (type === "personal_loan") {
          categorySelect.innerHTML = `
            <option value="Personal Installment Loan">Unsecured Installment / Fintech</option>
            <option value="Peer-to-Peer Note">P2P Lending Note</option>
          `;
        } else {
          categorySelect.innerHTML = `
            <option value="Telecom / Mobile Service">Cellular / Telecom Arrears</option>
            <option value="Residential Lease / Rent">Apartment Lease / Rent Balance</option>
            <option value="Consumer Account">Other FDCPA Consumer Debt</option>
          `;
        }
      });
    }

    // 5. Dynamic Dashboard View event delegation
    if (this.viewDashboard) {
      this.viewDashboard.addEventListener("click", (e) => {
        // Legal compliance notice bar disclaimer button
        const complianceBtn = e.target.closest("#openComplianceModalBtn");
        if (complianceBtn) {
          this.openLegalDisclaimer(!this.hasAgreedDisclaimer);
          return;
        }

        // Dispute action button (e.g. View Details or Review Letter)
        const actionBtn = e.target.closest(".dispute-action-btn");
        if (actionBtn) {
          const caseId = actionBtn.getAttribute("data-case-id");
          const action = actionBtn.getAttribute("data-action");
          this.activeCaseId = caseId;
          if (action === "letters") {
            this.switchView("letters");
          } else {
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

        // Toggle All Dossiers Button (Collapse All / Expand All)
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

        // Expandable card header or toggle button click
        const expandTrigger = e.target.closest(".expandable-card-header, .dossier-expand-toggle");
        if (expandTrigger) {
          const cardItem = expandTrigger.closest(".orderly-dispute-card");
          if (cardItem) {
            const caseId = cardItem.getAttribute("data-case-id");
            if (this.expandedCaseIds.has(caseId)) {
              // Collapse this card
              this.expandedCaseIds.delete(caseId);
            } else {
              // Expand this card (single-accordion mode keeps screen compact without scrolling)
              this.expandedCaseIds.clear();
              this.expandedCaseIds.add(caseId);
              this.activeCaseId = caseId;
            }
            this.renderCurrentView();
            return;
          }
        }

        // Fallback: Click on card background outside the body drawer
        const cardItem = e.target.closest(".orderly-dispute-card");
        if (cardItem && !e.target.closest(".expandable-card-body")) {
          const caseId = cardItem.getAttribute("data-case-id");
          if (!this.expandedCaseIds.has(caseId)) {
            this.expandedCaseIds.clear();
            this.expandedCaseIds.add(caseId);
            this.activeCaseId = caseId;
            this.renderCurrentView();
          }
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
    const debtType = document.getElementById("newDebtType") ? document.getElementById("newDebtType").value : "credit_card";
    const provider = document.getElementById("newProviderName").value;
    const agency = document.getElementById("newAgencyName").value;
    const balance = parseFloat(document.getElementById("newBalance").value) || 0;
    const category = document.getElementById("newCategory").value;
    const accountNum = document.getElementById("newAccountNumber").value || `ACC-${Date.now().toString().slice(-4)}`;

    const caseCount = this.cases.length + 1;
    const batesStr = `BATES-SM-2026-004${caseCount}`;

    let iconType = "credit_card";
    let legalFramework = "CFPB Reg F § 1006.34 & TILA";
    let notes = "Newly ingested credit card debt portfolio. Demanding chain of title and full accounting.";

    if (debtType === "medical") {
      iconType = "medical";
      legalFramework = "No Surprises Act & FDCPA § 1692g";
      notes = "Newly ingested healthcare debt. Initiating 30-day verification demand and clinical billing audit.";
    } else if (debtType === "auto_deficiency") {
      iconType = "auto";
      legalFramework = "UCC Article 9 & FDCPA";
      notes = "Auto loan deficiency dispute under UCC Article 9 & 15 U.S.C. § 1692g.";
    } else if (debtType === "personal_loan") {
      iconType = "loan";
      legalFramework = "15 U.S.C. § 1692g & State Consumer Act";
      notes = "Personal installment loan verification demand under federal FDCPA standards.";
    }

    const newCase = {
      id: `case-sm-2026-004${caseCount}`,
      docketNumber: batesStr,
      debtorName: this.user.name,
      debtType: debtType,
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
      certifiedMailTracking: `7021 0950 000${caseCount} 8891 0021`,
      actionLabel: "Review Letter",
      violationsCount: 0,
      potentialDamages: 0.00,
      collectionStatus: "Dispute letter ready to send",
      notes: notes,
      legalFramework: legalFramework
    };

    this.cases.unshift(newCase);
    this.activeCaseId = newCase.id;
    this.expandedCaseIds = new Set([newCase.id]);

    if (this.sidebarBadgeCount) {
      this.sidebarBadgeCount.textContent = this.cases.length;
    }

    this.newDisputeModal.close();
    this.newDisputeForm.reset();

    ipc.sendNotification(
      "New FDCPA Dispute Protected",
      `Dispute initiated for ${provider} ($${balance.toFixed(2)}).`
    );

    this.render();
  }

  renderCurrentView() {
    const activeCase = this.getActiveCase();
    if (!activeCase) return;

    let filteredCases = [...this.cases];
    if (this.disputeFilter === "credit_card") {
      filteredCases = this.cases.filter(c => c.debtType === "credit_card" || c.iconType === "credit_card");
    } else if (this.disputeFilter === "medical") {
      filteredCases = this.cases.filter(c => c.debtType === "medical" || (!c.debtType && !c.iconType?.includes("credit") && !c.iconType?.includes("auto") && !c.iconType?.includes("loan")));
    } else if (this.disputeFilter === "auto_deficiency") {
      filteredCases = this.cases.filter(c => c.debtType === "auto_deficiency" || c.iconType === "auto");
    } else if (this.disputeFilter === "personal_loan") {
      filteredCases = this.cases.filter(c => c.debtType === "personal_loan" || c.iconType === "loan");
    }

    switch (this.currentView) {
      case "dashboard":
        this.viewDashboard.innerHTML = renderDashboard(activeCase, filteredCases, this.expandedCaseIds);
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
        
        // Live input synchronization
        const templateRecipientInput = document.getElementById("templateRecipient");
        if (templateRecipientInput) {
          templateRecipientInput.addEventListener("input", (e) => {
            const el = document.getElementById("docRecipient");
            if (el) el.textContent = e.target.value;
          });
        }
        const templateAmountInput = document.getElementById("templateAmount");
        if (templateAmountInput) {
          templateAmountInput.addEventListener("input", (e) => {
            const el = document.getElementById("docDisputedAmount");
            if (el) el.textContent = e.target.value;
          });
        }
        const templateTrackingInput = document.getElementById("templateCertifiedMail");
        if (templateTrackingInput) {
          templateTrackingInput.addEventListener("input", (e) => {
            const el = document.getElementById("docTrackingNo");
            if (el) el.textContent = e.target.value;
          });
        }

        const copyBtn = document.getElementById("copyTextBtn");
        if (copyBtn) {
          copyBtn.addEventListener("click", () => {
            const paper = document.getElementById("legalDocumentPaper");
            if (paper) {
              navigator.clipboard?.writeText(paper.innerText);
              const label = copyBtn.querySelector(".btn-label") || copyBtn;
              label.textContent = "Copied ✓";
              setTimeout(() => { label.textContent = "Copy Text"; }, 2000);
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
            const label = exportPdfBtn.querySelector(".btn-label") || exportPdfBtn;
            label.textContent = "Exported ✓";
            setTimeout(() => { label.textContent = "Export Certified PDF"; }, 2000);
          });
        }

        // Live Statutory Demands Checklist Synchronization
        document.querySelectorAll(".statutory-demand-checkbox").forEach(cb => {
          cb.addEventListener("change", (e) => {
            const docItemId = e.target.getAttribute("data-doc-item");
            if (docItemId) {
              const docEl = document.getElementById(docItemId);
              if (docEl) {
                docEl.style.display = e.target.checked ? "list-item" : "none";
              }
            }
          });
        });
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

  // =========================================================================
  // Statutory Disclaimer Splash Screen & Gate Methods
  // =========================================================================

  getStoredDisclaimerAgreement() {
    try {
      const raw = localStorage.getItem(this.DISCLAIMER_STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  initLegalDisclaimer() {
    const urlParams = new URLSearchParams(window.location.search);
    const forceSplash = urlParams.get("splash") === "1" || urlParams.get("reset_terms") === "1";

    if (forceSplash) {
      try {
        localStorage.removeItem(this.DISCLAIMER_STORAGE_KEY);
      } catch (e) {}
      this.hasAgreedDisclaimer = false;
      this.openLegalDisclaimer(true);
      return;
    }

    const record = this.getStoredDisclaimerAgreement();
    if (record && record.agreed) {
      this.hasAgreedDisclaimer = true;
    } else {
      this.hasAgreedDisclaimer = false;
      // Launch popup splash screen gate immediately before software can be used
      this.openLegalDisclaimer(true);
    }
  }

  openLegalDisclaimer(isSplash = false) {
    if (!this.legalDisclaimerModal) return;

    if (isSplash) {
      this.legalDisclaimerModal.classList.add("is-splash-screen");
      if (this.disclaimerSplashTag) this.disclaimerSplashTag.style.display = "inline-flex";
      if (this.legalDisclaimerTitle) this.legalDisclaimerTitle.textContent = "Legal & Statutory Disclaimer";
      if (this.legalDisclaimerSubtitle) this.legalDisclaimerSubtitle.textContent = "Procedural Self-Advocacy Instrument — Mandatory Agreement Required";
      if (this.closeLegalDisclaimerModal) this.closeLegalDisclaimerModal.style.display = "none";
      if (this.disclaimerConsentSection) {
        this.disclaimerConsentSection.style.display = "block";
        this.disclaimerConsentSection.classList.remove("shake-error", "is-agreed");
      }
      if (this.disclaimerConsentCheckbox) this.disclaimerConsentCheckbox.checked = false;
      if (this.disclaimerValidationMsg) this.disclaimerValidationMsg.style.display = "none";
      if (this.disclaimerAgreedCard) this.disclaimerAgreedCard.style.display = "none";
      if (this.declineDisclaimerBtn) this.declineDisclaimerBtn.style.display = "inline-flex";
      if (this.closeDisclaimerReviewBtn) this.closeDisclaimerReviewBtn.style.display = "none";
      if (this.agreeDisclaimerBtn) {
        this.agreeDisclaimerBtn.style.display = "inline-flex";
        this.agreeDisclaimerBtn.innerHTML = `<span>I Agree & Enter Application</span><span aria-hidden="true" style="font-size: 15px;">→</span>`;
      }
    } else {
      // Review mode
      this.legalDisclaimerModal.classList.remove("is-splash-screen");
      if (this.disclaimerSplashTag) this.disclaimerSplashTag.style.display = "none";
      if (this.legalDisclaimerTitle) this.legalDisclaimerTitle.textContent = "Mandatory Legal & Statutory Compliance Terms";
      if (this.legalDisclaimerSubtitle) this.legalDisclaimerSubtitle.textContent = "Procedural Self-Advocacy Instrument — Not Attorney Representation";
      if (this.closeLegalDisclaimerModal) this.closeLegalDisclaimerModal.style.display = "flex";
      if (this.disclaimerConsentSection) this.disclaimerConsentSection.style.display = "none";
      if (this.disclaimerAgreedCard) {
        this.disclaimerAgreedCard.style.display = "flex";
        const record = this.getStoredDisclaimerAgreement();
        const dateStr = record?.agreedAt ? new Date(record.agreedAt).toLocaleString() : "Active Session";
        if (this.disclaimerAgreedMeta) {
          this.disclaimerAgreedMeta.textContent = `User agreed on ${dateStr} (v${record?.version || "1.0"})`;
        }
      }
      if (this.declineDisclaimerBtn) this.declineDisclaimerBtn.style.display = "none";
      if (this.agreeDisclaimerBtn) this.agreeDisclaimerBtn.style.display = "none";
      if (this.closeDisclaimerReviewBtn) this.closeDisclaimerReviewBtn.style.display = "inline-flex";
    }

    if (!this.legalDisclaimerModal.open) {
      this.legalDisclaimerModal.showModal();
    }
  }

  handleDisclaimerConsentToggle() {
    if (!this.disclaimerConsentCheckbox || !this.disclaimerConsentSection) return;
    const checked = this.disclaimerConsentCheckbox.checked;
    this.disclaimerConsentSection.classList.toggle("is-agreed", checked);
    if (checked && this.disclaimerValidationMsg) {
      this.disclaimerValidationMsg.style.display = "none";
      this.disclaimerConsentSection.classList.remove("shake-error");
    }
  }

  handleDisclaimerAgreementSubmit() {
    if (!this.disclaimerConsentCheckbox?.checked) {
      if (this.disclaimerConsentSection) {
        this.disclaimerConsentSection.classList.remove("shake-error");
        void this.disclaimerConsentSection.offsetWidth;
        this.disclaimerConsentSection.classList.add("shake-error");
      }
      if (this.disclaimerValidationMsg) {
        this.disclaimerValidationMsg.style.display = "block";
      }
      return;
    }

    const record = {
      agreed: true,
      agreedAt: new Date().toISOString(),
      version: "1.0"
    };
    try {
      localStorage.setItem(this.DISCLAIMER_STORAGE_KEY, JSON.stringify(record));
    } catch (e) {
      console.warn("Could not save disclaimer agreement to localStorage:", e);
    }
    this.hasAgreedDisclaimer = true;

    if (this.agreeDisclaimerBtn) {
      this.agreeDisclaimerBtn.innerHTML = `<span>Agreed ✓ Unlocking Console...</span>`;
    }

    setTimeout(() => {
      if (this.legalDisclaimerModal) {
        this.legalDisclaimerModal.close();
      }
      ipc.sendNotification(
        "SettleMint Console Ready",
        "Statutory compliance agreement acknowledged. All self-advocacy modules unlocked."
      );
    }, 250);
  }
}

// Bootstrap application on DOM load
window.addEventListener("DOMContentLoaded", () => {
  window.app = new SettleMintApp();
  console.log("SettleMint Consumer Debt Protection Dashboard Initialized.");
});
