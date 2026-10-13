/**
 * SettleMint Core Application Bootstrap & Controller
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

class SettleMintApp {
  constructor() {
    this.cases = [...INITIAL_CASES];
    this.interactions = [...INITIAL_INTERACTIONS];
    this.evidence = [...INITIAL_EVIDENCE];
    this.tradelines = [...INITIAL_CREDIT_TRADELINES];

    this.activeCaseId = this.cases[0]?.id || null;
    this.currentView = "dashboard";

    this.initElements();
    this.bindEvents();
    this.render();
  }

  initElements() {
    // Registry & workbench
    this.caseListContainer = document.getElementById("caseListContainer");
    this.caseSearchInput = document.getElementById("caseSearchInput");
    this.caseCountChip = document.getElementById("caseCountChip");
    this.viewNavTabs = document.getElementById("viewNavTabs");
    this.activeBatesStamp = document.getElementById("activeBatesStamp");

    // Views
    this.viewDashboard = document.getElementById("viewDashboard");
    this.viewInteractions = document.getElementById("viewInteractions");
    this.viewLetters = document.getElementById("viewLetters");
    this.viewEvidence = document.getElementById("viewEvidence");
    this.viewCredit = document.getElementById("viewCredit");

    // Right pane statutory indicators
    this.daysRemainingVal = document.getElementById("daysRemainingVal");
    this.statuteNoticeDate = document.getElementById("statuteNoticeDate");
    this.statuteExpiryDate = document.getElementById("statuteExpiryDate");
    this.damagesTotalVal = document.getElementById("damagesTotalVal");
    this.damagesCountVal = document.getElementById("damagesCountVal");
    this.damagesViolationList = document.getElementById("damagesViolationList");

    // Modals
    this.quickLogModal = document.getElementById("quickLogModal");
    this.quickLogCallBtn = document.getElementById("quickLogCallBtn");
    this.closeQuickLogModal = document.getElementById("closeQuickLogModal");
    this.cancelQuickLogBtn = document.getElementById("cancelQuickLogBtn");
    this.quickLogForm = document.getElementById("quickLogForm");
    this.quickLogCaseSelect = document.getElementById("quickLogCaseSelect");
    this.quickLogTimestamp = document.getElementById("quickLogTimestamp");

    this.callScriptModal = document.getElementById("callScriptModal");
    this.callScriptBtn = document.getElementById("callScriptBtn");
    this.closeCallScriptModal = document.getElementById("closeCallScriptModal");
    this.dismissCallScriptBtn = document.getElementById("dismissCallScriptBtn");
  }

  getActiveCase() {
    return this.cases.find(c => c.id === this.activeCaseId) || this.cases[0];
  }

  bindEvents() {
    // View navigation tabs
    this.viewNavTabs.addEventListener("click", (e) => {
      const tab = e.target.closest(".tab-item");
      if (!tab) return;
      const view = tab.getAttribute("data-view");
      this.switchView(view);
    });

    // Case search filtering
    this.caseSearchInput.addEventListener("input", (e) => {
      this.renderCaseList(e.target.value.toLowerCase());
    });

    // Quick-Log Modal
    this.quickLogCallBtn.addEventListener("click", () => this.openQuickLog());
    this.closeQuickLogModal.addEventListener("click", () => this.quickLogModal.close());
    this.cancelQuickLogBtn.addEventListener("click", () => this.quickLogModal.close());
    this.quickLogForm.addEventListener("submit", (e) => this.handleQuickLogSubmit(e));

    // Call Script Modal
    this.callScriptBtn.addEventListener("click", () => this.callScriptModal.showModal());
    this.closeCallScriptModal.addEventListener("click", () => this.callScriptModal.close());
    this.dismissCallScriptBtn.addEventListener("click", () => this.callScriptModal.close());
  }

  switchView(view) {
    this.currentView = view;
    // Update active tab class
    const tabs = this.viewNavTabs.querySelectorAll(".tab-item");
    tabs.forEach(tab => {
      tab.classList.toggle("active", tab.getAttribute("data-view") === view);
    });

    // Show active view panel
    const panels = [
      { id: "dashboard", el: this.viewDashboard },
      { id: "interactions", el: this.viewInteractions },
      { id: "letters", el: this.viewLetters },
      { id: "evidence", el: this.viewEvidence },
      { id: "credit", el: this.viewCredit }
    ];

    panels.forEach(p => {
      if (p.id === view) {
        p.el.classList.add("active");
      } else {
        p.el.classList.remove("active");
      }
    });

    this.renderCurrentView();
  }

  openQuickLog() {
    // Populate case select
    this.quickLogCaseSelect.innerHTML = this.cases.map(c => `
      <option value="${c.id}" ${c.id === this.activeCaseId ? 'selected' : ''}>
        ${c.docketNumber} - ${c.collectionAgency} ($${c.disputedBalance.toFixed(2)})
      </option>
    `).join("");

    // Set default timestamp to now
    const now = new Date();
    const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    this.quickLogTimestamp.value = localIso;

    this.quickLogModal.showModal();
  }

  handleQuickLogSubmit(e) {
    e.preventDefault();
    const caseId = this.quickLogCaseSelect.value;
    const agent = document.getElementById("quickLogAgentName").value;
    const timestampStr = this.quickLogTimestamp.value.replace("T", " ");
    const notes = document.getElementById("quickLogNotes").value;

    const violations = [];
    if (document.getElementById("vHourCheck").checked) {
      violations.push({
        citation: "15 U.S.C. § 1692c(a)(1)",
        title: "Call outside 8:00 AM - 9:00 PM statutory limit",
        damages: 1000.00
      });
    }
    if (document.getElementById("vWorkCheck").checked) {
      violations.push({
        citation: "15 U.S.C. § 1692c(a)(3)",
        title: "Workplace contact after consumer refusal",
        damages: 1000.00
      });
    }
    if (document.getElementById("vThreatCheck").checked) {
      violations.push({
        citation: "15 U.S.C. § 1692e(4)",
        title: "Unlawful threat of arrest or asset attachment",
        damages: 1000.00
      });
    }
    if (document.getElementById("vProfanityCheck").checked) {
      violations.push({
        citation: "15 U.S.C. § 1692d(2)",
        title: "Harassing or abusive language",
        damages: 1000.00
      });
    }
    if (document.getElementById("vPostDvlCheck").checked) {
      violations.push({
        citation: "15 U.S.C. § 1692g(b)",
        title: "Collection activities conducted prior to verification",
        damages: 1000.00
      });
    }

    const newInteraction = {
      id: "int-" + Date.now(),
      caseId: caseId,
      timestamp: timestampStr,
      direction: "Incoming",
      channel: "Phone",
      contactName: agent,
      durationSec: 90,
      summary: notes || "Incoming collection agency communication logged via live intake.",
      violations: violations,
      recorded: false
    };

    this.interactions.unshift(newInteraction);

    // Update case potential damages
    const targetCase = this.cases.find(c => c.id === caseId);
    if (targetCase && violations.length > 0) {
      targetCase.violationsCount += violations.length;
      targetCase.potentialDamages += violations.reduce((acc, v) => acc + v.damages, 0);
    }

    this.quickLogModal.close();
    this.quickLogForm.reset();

    // Notify user via IPC bridge
    ipc.sendNotification(
      "Collector Interaction Logged",
      `Call recorded for ${targetCase?.collectionAgency}. ${violations.length} statutory violations flagged.`
    );

    this.render();
  }

  renderCaseList(filterText = "") {
    const filtered = this.cases.filter(c => {
      if (!filterText) return true;
      return (
        c.docketNumber.toLowerCase().includes(filterText) ||
        c.collectionAgency.toLowerCase().includes(filterText) ||
        c.originalProvider.toLowerCase().includes(filterText) ||
        c.debtorName.toLowerCase().includes(filterText)
      );
    });

    this.caseCountChip.textContent = `${this.cases.length} ACTIVE`;

    this.caseListContainer.innerHTML = filtered.map(c => {
      const isActive = c.id === this.activeCaseId;
      return `
        <div class="case-card ${isActive ? 'active' : ''}" data-case-id="${c.id}">
          <div class="case-card-header">
            <span class="case-id-tag">${c.docketNumber}</span>
            <span class="specimen-chip ${c.violationsCount > 0 ? 'chip-violation' : 'chip-compliant'}">
              ${c.violationsCount > 0 ? `■ ${c.violationsCount} VIOLATIONS` : 'COMPLIANT'}
            </span>
          </div>
          <div class="case-patient-name">${c.debtorName}</div>
          <div class="case-provider-name">${c.originalProvider}</div>
          <div style="font-size: 11px; font-weight:600; color:var(--color-primary-slate); margin-bottom: 4px;">
            ${c.collectionAgency}
          </div>
          <div class="case-financial-row">
            <span style="color:var(--color-tertiary-light);">DISPUTED:</span>
            <span class="case-balance highlight-danger">$${c.disputedBalance.toFixed(2)}</span>
          </div>
        </div>
      `;
    }).join("");

    // Bind card click
    this.caseListContainer.querySelectorAll(".case-card").forEach(card => {
      card.addEventListener("click", () => {
        this.activeCaseId = card.getAttribute("data-case-id");
        this.render();
      });
    });
  }

  renderRightPane() {
    const activeCase = this.getActiveCase();
    if (!activeCase) return;

    this.activeBatesStamp.textContent = activeCase.docketNumber;
    this.daysRemainingVal.textContent = activeCase.statutoryDaysRemaining;
    this.statuteNoticeDate.textContent = activeCase.initialNoticeDate;
    
    // Calculate expiry 30 days after initial notice
    const noticeDate = new Date(activeCase.initialNoticeDate);
    const expiryDate = new Date(noticeDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    this.statuteExpiryDate.textContent = expiryDate.toISOString().slice(0, 10);

    this.damagesTotalVal.textContent = `$${activeCase.potentialDamages.toFixed(2)}`;
    this.damagesCountVal.textContent = `${activeCase.violationsCount} FLAGGED VIOLATIONS + ACTUAL`;

    // Populate violation list in right pane
    const caseInteractions = this.interactions.filter(i => i.caseId === activeCase.id);
    const allViolations = caseInteractions.flatMap(i => i.violations || []);

    if (allViolations.length === 0) {
      this.damagesViolationList.innerHTML = `
        <li style="font-size: 11px; color: var(--color-tertiary-light); padding: 4px;">
          No statutory infractions flagged yet.
        </li>
      `;
    } else {
      this.damagesViolationList.innerHTML = allViolations.map(v => `
        <li class="damages-violation-item">
          <div>
            <strong>${v.citation}</strong>
            <div style="font-size: 10px; color: var(--color-tertiary-light);">${v.title}</div>
          </div>
          <span class="label-code text-danger" style="font-weight:700;">+$${v.damages.toFixed(2)}</span>
        </li>
      `).join("");
    }
  }

  renderCurrentView() {
    const activeCase = this.getActiveCase();
    if (!activeCase) return;

    switch (this.currentView) {
      case "dashboard":
        this.viewDashboard.innerHTML = renderDashboard(activeCase);
        break;
      case "interactions":
        this.viewInteractions.innerHTML = renderInteractions(this.interactions, activeCase);
        break;
      case "letters":
        this.viewLetters.innerHTML = renderLetterStudio(activeCase);
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
    this.renderCaseList(this.caseSearchInput.value.toLowerCase());
    this.renderRightPane();
    this.renderCurrentView();
  }
}

// Bootstrap application on DOM load
window.addEventListener("DOMContentLoaded", () => {
  window.app = new SettleMintApp();
  console.log("SettleMint Console Initialized. Evidentiary Brutalism Loaded.");
});
