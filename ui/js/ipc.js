/**
 * SettleMint IPC Bridge
 * Abstraction layer for Tauri v2 IPC invocations with graceful offline browser fallback
 */

export const ipc = {
  isTauri() {
    return Boolean(window.__TAURI__ && window.__TAURI__.core && window.__TAURI__.core.invoke);
  },

  async invoke(cmd, args = {}) {
    if (this.isTauri()) {
      try {
        return await window.__TAURI__.core.invoke(cmd, args);
      } catch (err) {
        console.error(`[IPC Error] Command '${cmd}' failed:`, err);
        throw err;
      }
    } else {
      return null;
    }
  },

  // -------------------------------------------------------------------------
  // Case DAO & State Machine Operations
  // -------------------------------------------------------------------------
  async getCases() {
    return await this.invoke('get_cases');
  },

  async getCaseById(caseId) {
    return await this.invoke('get_case_by_id', { caseId });
  },

  async createCase(caseData) {
    return await this.invoke('create_case', { caseData });
  },

  async updateCaseStatus(caseId, newStatus) {
    return await this.invoke('update_case_status', { caseId, newStatus });
  },

  async deleteCase(caseId) {
    return await this.invoke('delete_case', { caseId });
  },

  async clearAllCases() {
    return await this.invoke('clear_all_cases');
  },

  // -------------------------------------------------------------------------
  // Interactions & FDCPA Violation Logging
  // -------------------------------------------------------------------------
  async getInteractions(caseId) {
    return await this.invoke('get_interactions', { caseId });
  },

  async logInteraction(interaction, violations = []) {
    return await this.invoke('log_interaction', { interaction, violations });
  },

  async getViolations(caseId) {
    return await this.invoke('get_violations', { caseId });
  },

  async detectInteractionViolations(caseId, interaction, debtorTzOffsetHours = -5) {
    return await this.invoke('detect_interaction_violations', {
      caseId,
      interaction,
      debtorTzOffsetHours,
    });
  },

  async getCaseStatutoryDamages(caseId) {
    return await this.invoke('get_case_statutory_damages', { caseId });
  },

  // -------------------------------------------------------------------------
  // Document Generation & Forensic Evidence Vault
  // -------------------------------------------------------------------------
  async generateDisputeDocument(docType, tokens = {}) {
    return await this.invoke('generate_dispute_document', { docType, tokens });
  },

  async exportDocumentFile(docketNumber, title, content, format = 'txt') {
    return await this.invoke('export_document_file', {
      docketNumber,
      title,
      content,
      format,
    });
  },

  async hashEvidencePayload(payload) {
    return await this.invoke('hash_evidence_payload', { payload });
  },


  // -------------------------------------------------------------------------
  // Deadlines, SOL Clocks & USPS Tracking
  // -------------------------------------------------------------------------
  async getDeadlines(caseId) {
    return await this.invoke('get_deadlines', { caseId });
  },

  async createDeadline(deadline) {
    return await this.invoke('create_deadline', { deadline });
  },

  async checkDeadlinesNow(referenceDateStr = null) {
    return await this.invoke('check_deadlines_now', { referenceDateStr });
  },

  async calculateFdcpaDeadline(noticeDateStr) {
    return await this.invoke('calculate_fdcpa_deadline', { noticeDateStr });
  },

  async calculateFdcpaValidationWindow(noticeDateStr, referenceDateStr = null) {
    return await this.invoke('calculate_fdcpa_validation_window', {
      noticeDateStr,
      referenceDateStr,
    });
  },

  async getSolRule(stateCode) {
    return await this.invoke('get_state_sol_rule', { stateCode });
  },

  async calculateSolClock(stateCode, debtType, defaultDateStr, referenceDateStr = null) {
    return await this.invoke('calculate_sol_clock', {
      stateCode,
      debtType,
      defaultDateStr,
      referenceDateStr,
    });
  },

  async checkDebtTimeBarred(stateCode, debtType, defaultDateStr) {
    return await this.invoke('check_debt_time_barred', {
      stateCode,
      debtType,
      defaultDateStr,
    });
  },

  async queryCertifiedMailStatus(trackingNumber) {
    return await this.invoke('query_certified_mail_status', { trackingNumber });
  },

  async pollCertifiedMailCases() {
    return await this.invoke('poll_certified_mail_cases');
  },

  // -------------------------------------------------------------------------
  // Air-Gapped Statutory Patches & Offline Updates
  // -------------------------------------------------------------------------
  async importStatutoryPatch(signedPatchJson) {
    return await this.invoke('import_statutory_patch', { signedPatchJson });
  },

  async getActiveStatutoryPatches() {
    return await this.invoke('get_active_statutory_patches');
  },

  async rollbackStatutoryPatch(patchId) {
    return await this.invoke('rollback_statutory_patch', { patchId });
  },

  async rollbackAllStatutoryPatches() {
    return await this.invoke('rollback_all_statutory_patches');
  },

  async getOfficialStatutoryAuthorityKey() {
    return await this.invoke('get_official_statutory_authority_key');
  },

  // -------------------------------------------------------------------------
  // Credit Tradelines
  // -------------------------------------------------------------------------
  async getCreditTradelines(caseId) {
    return await this.invoke('get_credit_tradelines', { caseId });
  },

  async createCreditTradeline(tradeline) {
    return await this.invoke('create_credit_tradeline', { tradeline });
  },

  // -------------------------------------------------------------------------
  // Cryptographic Vault & Encrypted Backups
  // -------------------------------------------------------------------------
  async isMasterPassphraseEnrolled() {
    return await this.invoke('is_master_passphrase_enrolled');
  },

  async enrollMasterPassphrase(passphrase) {
    return await this.invoke('enroll_master_passphrase', { passphrase });
  },

  async verifyMasterPassphrase(passphrase) {
    return await this.invoke('verify_master_passphrase', { passphrase });
  },

  async exportEncryptedBackup(passphrase) {
    return await this.invoke('export_encrypted_backup', { passphrase });
  },

  async restoreEncryptedBackup(passphrase, archiveData) {
    return await this.invoke('restore_encrypted_backup', { passphrase, archiveData });
  },

  // -------------------------------------------------------------------------
  // Native OS Notifications & System Events
  // -------------------------------------------------------------------------
  async sendNotification(title, body) {
    if (window.__TAURI__ && window.__TAURI__.notification) {
      return await window.__TAURI__.notification.sendNotification({ title, body });
    }
  },

  async listen(event, callback) {
    if (window.__TAURI__ && window.__TAURI__.event && window.__TAURI__.event.listen) {
      return await window.__TAURI__.event.listen(event, callback);
    } else {
      return () => {};
    }
  },

  async emit(event, payload = {}) {
    if (window.__TAURI__ && window.__TAURI__.event && window.__TAURI__.event.emit) {
      return await window.__TAURI__.event.emit(event, payload);
    }
  }
};
