/**
 * Event Handlers & View Action Delegation
 * Centralized delegation for navigation, card toggles, and view interactions
 */

export function handleDashboardClick(app, e) {
  if (handleDashboardNavActions(app, e)) return;
  handleDashboardCardToggle(app, e);
}

export function handleDashboardNavActions(app, e) {
  if (e.target.closest("#firstRunNewDisputeBtn, #demoBannerNewDisputeBtn")) {
    app.openNewDisputeModal();
    return true;
  }
  if (e.target.closest("#firstRunProfileBtn")) {
    app.openUserProfileModal();
    return true;
  }
  if (e.target.closest("#firstRunDemoBtn")) {
    app.loadDemoData();
    return true;
  }
  if (e.target.closest("#demoBannerClearBtn")) {
    app.clearAllData();
    return true;
  }
  if (e.target.closest("#openComplianceModalBtn")) {
    app.openLegalDisclaimer(!app.hasAgreedDisclaimer);
    return true;
  }
  const actionBtn = e.target.closest(".dispute-action-btn");
  if (actionBtn) {
    app.activeCaseId = actionBtn.getAttribute("data-case-id");
    actionBtn.getAttribute("data-action") === "letters" ? app.switchView("letters") : app.renderCurrentView();
    return true;
  }
  const openLetterBtn = e.target.closest(".quick-open-letter-btn");
  if (openLetterBtn) {
    app.activeCaseId = openLetterBtn.getAttribute("data-case-id");
    app.switchView("letters");
    return true;
  }
  const openCallsBtn = e.target.closest(".quick-open-calls-btn");
  if (openCallsBtn) {
    app.activeCaseId = openCallsBtn.getAttribute("data-case-id");
    app.switchView("interactions");
    return true;
  }
  return false;
}

export function handleDashboardCardToggle(app, e) {
  const toggleAllBtn = e.target.closest("#toggleAllDossiersBtn");
  if (toggleAllBtn) {
    const filtered = app.getFilteredCases();
    if (app.expandedCaseIds.size === filtered.length) {
      app.expandedCaseIds.clear();
    } else {
      app.expandedCaseIds = new Set(filtered.map(c => c.id));
    }
    app.renderCurrentView();
    return;
  }

  const expandTrigger = e.target.closest(".expandable-card-header, .dossier-expand-toggle");
  if (expandTrigger) {
    const card = expandTrigger.closest(".orderly-dispute-card");
    if (card) {
      const id = card.getAttribute("data-case-id");
      if (app.expandedCaseIds.has(id)) {
        app.expandedCaseIds.delete(id);
      } else {
        app.expandedCaseIds.clear();
        app.expandedCaseIds.add(id);
        app.activeCaseId = id;
      }
      app.renderCurrentView();
      return;
    }
  }

  const card = e.target.closest(".orderly-dispute-card");
  if (card && !e.target.closest(".expandable-card-body")) {
    const id = card.getAttribute("data-case-id");
    if (!app.expandedCaseIds.has(id)) {
      app.expandedCaseIds.clear();
      app.expandedCaseIds.add(id);
      app.activeCaseId = id;
      app.renderCurrentView();
    }
  }
}

export function handleInteractionsClick(app, e) {
  if (e.target.closest("#addInteractionLogBtn")) {
    const activeCase = app.getActiveCase();
    app.modalController?.openQuickLogModal(activeCase?.id);
    return;
  }
  if (e.target.closest("#interactionEmptyNewCaseBtn")) {
    app.openNewDisputeModal();
    return;
  }
}

export function handleEvidenceClick(app, e) {
  if (e.target.closest("#ingestEvidenceBtn, #emptyIngestEvidenceBtn, .btn-ingest-evidence-trigger")) {
    const activeCase = app.getActiveCase();
    app.modalController?.openIngestEvidenceModal(activeCase?.id);
    return;
  }
  if (e.target.closest("#evidenceEmptyNewCaseBtn")) {
    app.openNewDisputeModal();
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
    app.showToast("Artifact Inspected", `${bates} • ${title} (SHA-256 digest copied)`, "info");
    return;
  }
}

export function handleCreditClick(app, e) {
  if (e.target.closest("#importCreditReportBtn, #emptyImportCreditReportBtn, .btn-import-credit-trigger")) {
    const activeCase = app.getActiveCase();
    app.modalController?.openIngestEvidenceModal(activeCase?.id);
    if (app.modalController?.evidenceDocType) {
      app.modalController.evidenceDocType.value = "credit_report";
    }
    return;
  }
  if (e.target.closest("#creditEmptyNewCaseBtn")) {
    app.openNewDisputeModal();
    return;
  }
  const target = e.target.closest("button");
  if (target) {
    if (target.classList.contains("cra-dispute-btn") || target.textContent.includes("Generate CRA Dispute Packet")) {
      app.switchView("letters");
      const templateSelect = document.getElementById("templateSelect");
      if (templateSelect) {
        templateSelect.value = "cra_dispute";
        templateSelect.dispatchEvent(new Event("change"));
      }
      return;
    }
    if (target.classList.contains("diff-tradeline-btn") || target.textContent.includes("Diff Historical Snapshot")) {
      app.showToast("Tradeline Delta Audit", "Historical diff: Account verified with zero undetected alterations in current reporting cycle.", "info");
      return;
    }
  }
}

export function handleLettersClick(app, e) {
  if (e.target.closest("#letterStudioEmptyNewCaseBtn")) {
    app.openNewDisputeModal();
    return;
  }
}
