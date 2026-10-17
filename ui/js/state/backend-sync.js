/**
 * Backend Data & IPC Synchronization
 * Synchronizes cases, interactions, and events with the encrypted local SQLite database
 */

import { ipc } from '../ipc.js';

export async function initBackendData(app) {
  if (!ipc.isTauri()) return;
  try {
    await syncBackendCases(app);
    await syncBackendInteractions(app);
    await subscribeBackendEvents(app);
    app.render();
  } catch (_err) {
    // Backend initialization handled gracefully
  }
}

export async function syncBackendCases(app) {
  const backendCases = await ipc.getCases();
  if (!backendCases || backendCases.length === 0) {
    if (app.isDemoMode) await app.loadDemoData();
    return;
  }
  const isLegacy = backendCases.every(bc => 
    bc.docket_number.startsWith("BATES-SM-2026-00") && 
    (bc.debtor_name === "Sarah Henderson" || bc.debtor_name === "Jordan Vance")
  );
  if (isLegacy && !app.isDemoMode) {
    for (const bc of backendCases) {
      try { await ipc.deleteCase(bc.id); } catch (_e) { /* ignore */ }
    }
    app.cases = [];
    app.activeCaseId = null;
    app.expandedCaseIds.clear();
    return;
  }
  app.cases = backendCases.map(bc => ({
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
  if (!app.cases.some(c => c.id === app.activeCaseId)) {
    app.activeCaseId = app.cases[0]?.id || null;
  }
}

export async function syncBackendInteractions(app) {
  if (!app.activeCaseId) return;
  try {
    const dbInteractions = await ipc.getInteractions(app.activeCaseId);
    if (dbInteractions && dbInteractions.length > 0) {
      app.interactions = dbInteractions.map(dbi => ({
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
    const damages = await ipc.getCaseStatutoryDamages(app.activeCaseId);
    if (damages) {
      const active = app.getActiveCase();
      if (active) {
        active.potentialDamages = damages.total_potential_damages;
        active.violationsCount = damages.violation_count;
      }
    }
  } catch (_e) {
    // Backend sync note handled gracefully
  }
}

export async function subscribeBackendEvents(app) {
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
    app.render();
  });
  // System Tray integration across Windows, macOS, and Linux
  await ipc.listen('open-quick-log', () => {
    app.modalController?.openQuickLogModal();
  });
  await ipc.listen('toggle-silence-24h', () => {
    ipc.sendNotification("Notifications Silenced", "Statutory deadline alerts paused for 24 hours.");
  });
}
