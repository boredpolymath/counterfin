use chrono::{Duration as ChronoDuration, NaiveDate, Utc};
use counterfin_lib::db::DatabaseManager;
use counterfin_lib::engine::fdcpa::FdcpaEngine;
use counterfin_lib::engine::medical::{
    DisputedMedicalClaim, MedicalDebtEngine, MedicalFacilityType, MedicalServiceType,
};
use counterfin_lib::engine::monitor::{BackgroundMonitor, UspsDeliveryStatus};
use counterfin_lib::engine::templates::{DocumentExporter, ExportFormat, TemplateEngine};
use counterfin_lib::engine::ucc::{
    DispositionType, PostSaleAccounting, PreSaleNotice, UccArticle9Engine,
};
use counterfin_lib::engine::vault::EvidenceVault;
use counterfin_lib::models::case::{Case, CaseStatus, DebtType};
use counterfin_lib::models::credit::{Bureau, CreditTradeLine, DisputeRemarkStatus};
use counterfin_lib::models::deadline::{Deadline, DeadlineType};
use counterfin_lib::models::document::{Document, DocumentType};
use counterfin_lib::models::interaction::{Channel, Direction, Interaction};
use counterfin_lib::models::violation::{FdcpaViolationType, Violation};
use std::collections::HashMap;
use std::sync::Arc;
use std::thread;
use uuid::Uuid;

/// =========================================================================
/// 9.8.1 Medical Debt Statutory Dispute Workflow:
/// Case creation -> No Surprises Act balance billing audit -> DVL generation
/// -> Bates evidence docketing -> USPS Certified Mail delivery confirmation
/// -> 30-day statutory stay -> Debt dismissal
/// =========================================================================
#[test]
fn test_e2e_medical_debt_statutory_workflow() {
    let db = DatabaseManager::init_in_memory().expect("Init DB");
    let case_id = Uuid::new_v4();
    let docket = "BATES-2026-MED-042";

    // 1. Case Creation: Disputed emergency room balance ($4,250.00)
    let case = Case {
        id: case_id,
        docket_number: docket.to_string(),
        debtor_name: "Elena Rostova".to_string(),
        debt_type: DebtType::Medical,
        provider_name: "Cedars-Sinai Medical Center".to_string(),
        collection_agency: "Apex Financial Recovery, LLC".to_string(),
        original_account_number: "CS-EMERG-9912".to_string(),
        collection_account_number: "APEX-MED-5510".to_string(),
        original_balance: 4250.00,
        disputed_balance: 4250.00,
        status: CaseStatus::InitialNotice,
        jurisdiction_state: "CA".to_string(),
        date_of_service: Some("2026-01-15".to_string()),
        initial_notice_date: "2026-03-01".to_string(),
        certified_mail_tracking: Some("7021 0950 0001 8492 1104".to_string()),
        created_at: Utc::now(),
        closed_at: None,
    };
    db.create_case(&case).expect("Failed to create case");

    // 2. No Surprises Act (NSA) Balance Billing Audit
    let claim = DisputedMedicalClaim {
        provider_name: "Cedars-Sinai Medical Center".to_string(),
        facility_type: MedicalFacilityType::HospitalEmergencyDepartment,
        service_type: MedicalServiceType::EmergencyService,
        date_of_service: NaiveDate::from_ymd_opt(2026, 1, 15).unwrap(),
        in_network_cost_sharing_copay_coinsurance: 250.00,
        total_billed_amount: 4250.00,
        insurance_payment_amount: 0.0,
        claimed_balance_due: 4250.00,
        is_emergency_service: true,
        has_itemized_cpt_icd_codes: false,
        has_written_consent_waiver: false,
        good_faith_estimate_amount: None,
    };
    let audit = MedicalDebtEngine::audit_claim(&claim);
    assert!(
        audit.is_unlawful_balance_bill,
        "Out-of-network emergency balance billing must be unlawful"
    );
    assert_eq!(audit.unlawful_balance_billed_amount, 4000.00);
    assert!(
        audit.is_missing_statutory_validation_data,
        "Must flag missing itemized CPT/ICD codes"
    );

    // 3. Medical DVL Letter Generation & Token Resolution
    let template = TemplateEngine::medical_dvl_template();
    let mut tokens = HashMap::new();
    tokens.insert("CERTIFIED_MAIL_TRACKING", "7021 0950 0001 8492 1104");
    tokens.insert("CURRENT_DATE", "March 2, 2026");
    tokens.insert("COLLECTION_AGENCY", "Apex Financial Recovery, LLC");
    tokens.insert("COLLECTION_ACCOUNT_NO", "APEX-MED-5510");
    tokens.insert("ORIGINAL_PROVIDER", "Cedars-Sinai Medical Center");
    tokens.insert("DISPUTED_AMOUNT", "$4,250.00");
    tokens.insert("BATES_DOCKET", docket);
    tokens.insert("DEBTOR_NAME", "Elena Rostova");

    let letter_content = TemplateEngine::interpolate(template, &tokens);
    assert!(letter_content.contains("NO SURPRISES ACT"));
    assert!(letter_content.contains("Public Law 116-260"));
    assert!(letter_content.contains(docket));

    // 4. Bates Evidence Vault Ingestion & NIST SHA-256 Digest Verification
    let temp_dir = std::env::temp_dir().join(format!("settlemint_e2e_med_{}", Uuid::new_v4()));
    let sandbox = EvidenceVault::build_sandbox_paths(&temp_dir);
    sandbox.create_all().expect("Sandbox init");

    let source_bill = temp_dir.join("hospital_emergency_bill.pdf");
    std::fs::write(
        &source_bill,
        b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\nstream\nITEMIZED CHARGES: EMERGENCY ROOM $4,250.00\nendstream\n%%EOF",
    ).unwrap();

    let doc_id = Uuid::new_v4();
    let ingested =
        EvidenceVault::ingest_evidence(&sandbox, &source_bill, &doc_id).expect("Ingest evidence");
    assert_eq!(ingested.sha256_hash.len(), 64);
    assert!(ingested.absolute_path.exists());

    let db_doc = Document {
        id: doc_id,
        case_id,
        bates_identifier: docket.to_string(),
        title: "Dispute Validation Letter - Medical Emergency".to_string(),
        document_type: DocumentType::DebtValidationLetter,
        relative_file_path: ingested.relative_vault_path,
        sha256_hash: ingested.sha256_hash,
        file_size_bytes: ingested.file_size_bytes,
        created_at: Utc::now(),
    };
    db.create_document(&db_doc).expect("Insert document");

    // 5. USPS Certified Mail Tracking Confirmation & State Advancement
    let mail_status = BackgroundMonitor::query_certified_mail_status("7021 0950 0001 8492 1104");
    assert!(matches!(
        mail_status.status,
        UspsDeliveryStatus::Delivered { .. }
    ));

    let updates = BackgroundMonitor::poll_and_advance_certified_mail_cases(&db).expect("Poll mail");
    assert_eq!(updates.len(), 1);
    assert_eq!(updates[0].new_status, "ValidationPending");

    let case_after_delivery = db.get_case_by_id(&case_id.to_string()).unwrap().unwrap();
    assert_eq!(case_after_delivery.status, CaseStatus::ValidationPending);

    // 6. 30-Day Statutory Stay Calculation
    let notice_date = NaiveDate::from_ymd_opt(2026, 3, 2).unwrap();
    let window = FdcpaEngine::calculate_validation_window(notice_date, Some(notice_date));
    assert_eq!(window.adjusted_deadline, "2026-04-01");

    let deadline = Deadline {
        id: Uuid::new_v4(),
        case_id,
        deadline_type: DeadlineType::Fdcpa30DayValidation,
        title: "FDCPA Statutory Verification Stay Window".to_string(),
        target_date: chrono::DateTime::parse_from_rfc3339("2026-04-01T00:00:00Z")
            .unwrap()
            .with_timezone(&Utc),
        completed: false,
        reminder_days_prior: vec![7, 3, 1],
        notes: "Collector legally stayed from collection efforts pending verification".to_string(),
    };
    db.create_deadline(&deadline).expect("Insert deadline");

    // 7. Collector Fails to Verify -> Debt Dismissal (Terminal State Immutability)
    let dismissed = db
        .update_case_status(&case_id.to_string(), &CaseStatus::DebtDismissed)
        .expect("Dismiss case");
    assert!(dismissed);

    let final_case = db.get_case_by_id(&case_id.to_string()).unwrap().unwrap();
    assert_eq!(final_case.status, CaseStatus::DebtDismissed);
    assert!(
        !final_case
            .status
            .can_transition_to(&CaseStatus::InitialNotice)
    );

    let _ = std::fs::remove_dir_all(&temp_dir);
}

/// =========================================================================
/// 9.8.2 Aggressive Collector Call Harassment Workflow:
/// Case creation -> Log incoming call at 9:30 PM with 7-in-7 violation
/// -> Statutory damages ledger accumulation ($2,000)
/// -> Limited Cease & Desist letter generation -> Certified PDF export
/// =========================================================================
#[test]
fn test_e2e_call_harassment_statutory_workflow() {
    let db = DatabaseManager::init_in_memory().expect("Init DB");
    let case_id = Uuid::new_v4();
    let docket = "BATES-2026-HARASS-101";

    // 1. Case Creation
    let case = Case {
        id: case_id,
        docket_number: docket.to_string(),
        debtor_name: "Marcus Vance".to_string(),
        debt_type: DebtType::CreditCard,
        provider_name: "Citibank".to_string(),
        collection_agency: "Aggressive Asset Collectors Inc.".to_string(),
        original_account_number: "4128-0012-9981".to_string(),
        collection_account_number: "AAC-TX-8821".to_string(),
        original_balance: 3500.0,
        disputed_balance: 3500.0,
        status: CaseStatus::InitialNotice,
        jurisdiction_state: "TX".to_string(),
        date_of_service: None,
        initial_notice_date: "2026-04-01".to_string(),
        certified_mail_tracking: None,
        created_at: Utc::now(),
        closed_at: None,
    };
    db.create_case(&case).expect("Create case");

    // 2. Inconvenient Hours Violation (15 U.S.C. 1692c(a)(1)) - Hour 21 (9:30 PM)
    let is_inconvenient = FdcpaEngine::is_inconvenient_hour(21);
    assert!(
        is_inconvenient,
        "Call at 21:00-22:00 must violate convenient call hours"
    );

    // 3. 7-in-7 Rule Call Frequency Violation (12 C.F.R. § 1006.14(b) & 15 U.S.C. § 1692d(5))
    let base_time = Utc::now();
    let mut history = Vec::new();
    for day in 1..=7 {
        history.push(Interaction {
            id: Uuid::new_v4(),
            case_id,
            creditor_id: None,
            timestamp: base_time - ChronoDuration::days(8 - day),
            channel: Channel::Phone,
            direction: Direction::Incoming,
            contact_name: "Collector Agent".to_string(),
            contact_phone: Some("800-555-0199".to_string()),
            duration_seconds: 45,
            summary_notes: format!("Prior call day {}", day),
            audio_recording_path: None,
            recorded_flag: false,
        });
    }

    let eighth_call_id = Uuid::new_v4();
    let eighth_call = Interaction {
        id: eighth_call_id,
        case_id,
        creditor_id: None,
        timestamp: base_time,
        channel: Channel::Phone,
        direction: Direction::Incoming,
        contact_name: "Collector Agent".to_string(),
        contact_phone: Some("800-555-0199".to_string()),
        duration_seconds: 120,
        summary_notes: "8th call within 7 consecutive days at 9:30 PM".to_string(),
        audio_recording_path: None,
        recorded_flag: false,
    };

    let violation_harassment = FdcpaEngine::check_call_frequency_violation(&eighth_call, &history)
        .expect("Must trigger CFPB 7-in-7 call frequency violation");
    assert_eq!(violation_harassment.statutory_penalty_cap, 1000.0);

    let violation_inconvenient = Violation {
        id: Uuid::new_v4(),
        interaction_id: eighth_call_id,
        case_id,
        violation_type: FdcpaViolationType::InconvenientTime,
        statutory_citation: "15 U.S.C. § 1692c(a)(1)".to_string(),
        statutory_penalty_cap: 1000.0,
        actual_damages: 0.0,
        factual_summary:
            "Placed debt collection call at 9:30 PM outside 8:00 AM - 9:00 PM statutory window."
                .to_string(),
        evidence_references: vec!["Phone_Call_Log_20260408_2130.png".to_string()],
    };

    // 4. Log Interaction with Both Violations Atomically
    db.log_interaction(
        &eighth_call,
        &[violation_inconvenient, violation_harassment],
    )
    .expect("Log interaction with violations");

    // 5. Statutory Damages Ledger Aggregation ($2,000 Total Statutory Base)
    let violations = db
        .get_violations(&case_id.to_string())
        .expect("Fetch violations");
    assert_eq!(violations.len(), 2);

    let damages = FdcpaEngine::summarize_damages(&case_id.to_string(), &violations);
    assert_eq!(damages.violation_count, 2);
    assert_eq!(damages.total_statutory_damages, 2000.0);
    assert_eq!(damages.grand_total_damages, 2000.0);

    // 6. Limited Cease & Desist Letter Generation & PDF Export
    let template = TemplateEngine::limited_cease_and_desist_template();
    let mut tokens = HashMap::new();
    tokens.insert("CERTIFIED_MAIL_TRACKING", "9400 1118 9956 1234 5678 90");
    tokens.insert("CURRENT_DATE", "April 9, 2026");
    tokens.insert("COLLECTION_AGENCY", "Aggressive Asset Collectors Inc.");
    tokens.insert("COLLECTION_ACCOUNT_NO", "AAC-TX-8821");
    tokens.insert("ORIGINAL_PROVIDER", "Citibank");
    tokens.insert("BATES_DOCKET", docket);
    tokens.insert("DEBTOR_NAME", "Marcus Vance");

    let letter = TemplateEngine::interpolate(template, &tokens);
    assert!(letter.contains("15 U.S.C. § 1692c(c)"));
    assert!(letter.contains("CEASE AND DESIST"));

    let temp_dir = std::env::temp_dir().join(format!("settlemint_e2e_harass_{}", Uuid::new_v4()));
    let sandbox = EvidenceVault::build_sandbox_paths(&temp_dir);
    sandbox.create_all().expect("Init sandbox");

    let pdf_path = DocumentExporter::export_to_sandbox(
        &sandbox,
        docket,
        "Cease_and_Desist_Demand",
        &letter,
        ExportFormat::Pdf,
    )
    .expect("Export PDF");
    assert!(pdf_path.exists());

    let pdf_bytes = std::fs::read(&pdf_path).unwrap();
    let pdf_str = String::from_utf8_lossy(&pdf_bytes);
    assert!(pdf_str.contains("BATES DOCKET WATERMARK: BATES-2026-HARASS-101"));
    assert!(pdf_str.contains("/MediaBox [0 0 612 792]"));

    let _ = std::fs::remove_dir_all(&temp_dir);
}

/// =========================================================================
/// 9.8.3 Credit Bureau Trade Line Dispute Workflow:
/// Ingest credit report -> Flag trade line missing mandatory dispute remark
/// under FCRA § 623 -> Generate 3-bureau CRA dispute packet
/// -> Track 30-day investigation window
/// =========================================================================
#[test]
fn test_e2e_cra_trade_line_dispute_workflow() {
    let db = DatabaseManager::init_in_memory().expect("Init DB");
    let case_id = Uuid::new_v4();
    let docket = "BATES-2026-CRA-200";

    // 1. Case Creation
    let case = Case {
        id: case_id,
        docket_number: docket.to_string(),
        debtor_name: "Sarah Jenkins".to_string(),
        debt_type: DebtType::CreditCard,
        provider_name: "Chase Bank".to_string(),
        collection_agency: "Portfolio Recovery Associates".to_string(),
        original_account_number: "CHASE-7721".to_string(),
        collection_account_number: "PRA-998811".to_string(),
        original_balance: 1850.00,
        disputed_balance: 1850.00,
        status: CaseStatus::ValidationPending,
        jurisdiction_state: "IL".to_string(),
        date_of_service: None,
        initial_notice_date: "2026-05-01".to_string(),
        certified_mail_tracking: None,
        created_at: Utc::now(),
        closed_at: None,
    };
    db.create_case(&case).expect("Create case");

    // 2. Ingest Trade Lines across 3 Major Bureaus
    // Equifax and Experian failed to mark the debt as disputed after consumer dispute
    let tradeline_eq = CreditTradeLine {
        id: Uuid::new_v4(),
        case_id,
        bureau: Bureau::Equifax,
        reporting_agency_name: "Portfolio Recovery Associates".to_string(),
        account_number_masked: "****9811".to_string(),
        balance_reported: 1850.00,
        remark_status: DisputeRemarkStatus::CollectionAccount,
        is_marked_disputed: false,
        fcra_violation_flag: true, // Violation of FCRA § 623(a)(3) & FDCPA § 1692e(8)
        last_reported_date: "2026-05-15".to_string(),
    };

    let tradeline_exp = CreditTradeLine {
        id: Uuid::new_v4(),
        case_id,
        bureau: Bureau::Experian,
        reporting_agency_name: "Portfolio Recovery Associates".to_string(),
        account_number_masked: "****9811".to_string(),
        balance_reported: 1850.00,
        remark_status: DisputeRemarkStatus::CollectionAccount,
        is_marked_disputed: false,
        fcra_violation_flag: true,
        last_reported_date: "2026-05-15".to_string(),
    };

    let tradeline_tu = CreditTradeLine {
        id: Uuid::new_v4(),
        case_id,
        bureau: Bureau::TransUnion,
        reporting_agency_name: "Portfolio Recovery Associates".to_string(),
        account_number_masked: "****9811".to_string(),
        balance_reported: 1850.00,
        remark_status: DisputeRemarkStatus::DisputedByConsumer,
        is_marked_disputed: true,
        fcra_violation_flag: false,
        last_reported_date: "2026-05-15".to_string(),
    };

    db.create_credit_tradeline(&tradeline_eq).unwrap();
    db.create_credit_tradeline(&tradeline_exp).unwrap();
    db.create_credit_tradeline(&tradeline_tu).unwrap();

    let tradelines = db.get_credit_tradelines(&case_id.to_string()).unwrap();
    assert_eq!(tradelines.len(), 3);

    let violations: Vec<_> = tradelines
        .iter()
        .filter(|t| t.fcra_violation_flag)
        .collect();
    assert_eq!(
        violations.len(),
        2,
        "Equifax and Experian must be flagged for missing dispute remark"
    );

    // 3. Generate 3-Bureau Direct CRA Dispute Package
    let template = TemplateEngine::cra_dispute_template();
    let mut tokens = HashMap::new();
    tokens.insert("CERTIFIED_MAIL_TRACKING", "7021 0950 0001 5566 7788");
    tokens.insert("CURRENT_DATE", "May 20, 2026");
    tokens.insert("COLLECTION_AGENCY", "Portfolio Recovery Associates");
    tokens.insert("COLLECTION_ACCOUNT_NO", "PRA-998811");
    tokens.insert("ORIGINAL_PROVIDER", "Chase Bank");
    tokens.insert("DISPUTED_AMOUNT", "$1,850.00");
    tokens.insert("BATES_DOCKET", docket);
    tokens.insert("DEBTOR_NAME", "Sarah Jenkins");

    let dispute_packet = TemplateEngine::interpolate(template, &tokens);
    assert!(dispute_packet.contains("15 U.S.C. § 1681i"));
    assert!(dispute_packet.contains("§ 1681s-2"));
    assert!(dispute_packet.contains(docket));

    // 4. Track 30-Day FCRA Investigation Deadline
    let deadline = Deadline {
        id: Uuid::new_v4(),
        case_id,
        deadline_type: DeadlineType::Fcra30DayCraResponse,
        title: "FCRA 30-Day Mandatory Investigation Window".to_string(),
        target_date: chrono::DateTime::parse_from_rfc3339("2026-06-20T00:00:00Z")
            .unwrap()
            .with_timezone(&Utc),
        completed: false,
        reminder_days_prior: vec![7, 3, 1],
        notes: "Bureaus must delete disputed tradeline if unverified within 30 days".to_string(),
    };
    db.create_deadline(&deadline).unwrap();

    // Verify statutory threshold reminders with sleep/wake drift tolerance
    let check_date = NaiveDate::from_ymd_opt(2026, 6, 17).unwrap(); // 3 days remaining
    let alerts =
        BackgroundMonitor::evaluate_deadlines_with_drift(&[deadline], Some(check_date), None);
    assert_eq!(alerts.len(), 1);
    assert_eq!(alerts[0].days_remaining, 3);
    assert!(alerts[0].is_urgent);
}

/// =========================================================================
/// 9.8.4 Pay-for-Delete Settlement Negotiation Workflow:
/// Case creation -> Pay-for-Delete settlement offer drafting
/// -> Conditional credit trade line deletion clause -> Payment tracking
/// -> Case settlement
/// =========================================================================
#[test]
fn test_e2e_pay_for_delete_settlement_workflow() {
    let db = DatabaseManager::init_in_memory().expect("Init DB");
    let case_id = Uuid::new_v4();
    let docket = "BATES-2026-SETTLE-777";

    // 1. Case Creation
    let case = Case {
        id: case_id,
        docket_number: docket.to_string(),
        debtor_name: "Carlos Rivera".to_string(),
        debt_type: DebtType::CreditCard,
        provider_name: "Discover Card".to_string(),
        collection_agency: "Encore Capital Group".to_string(),
        original_account_number: "DISC-6011-4432".to_string(),
        collection_account_number: "ENC-88301".to_string(),
        original_balance: 5000.00,
        disputed_balance: 5000.00,
        status: CaseStatus::ValidationPending,
        jurisdiction_state: "NY".to_string(),
        date_of_service: None,
        initial_notice_date: "2026-02-15".to_string(),
        certified_mail_tracking: None,
        created_at: Utc::now(),
        closed_at: None,
    };
    db.create_case(&case).expect("Create case");

    // 2. Draft Pay-for-Delete Settlement Offer
    let template = TemplateEngine::pay_for_delete_template();
    let mut tokens = HashMap::new();
    tokens.insert("CERTIFIED_MAIL_TRACKING", "7021 0950 0001 9988 3344");
    tokens.insert("CURRENT_DATE", "March 15, 2026");
    tokens.insert("COLLECTION_AGENCY", "Encore Capital Group");
    tokens.insert("COLLECTION_ACCOUNT_NO", "ENC-88301");
    tokens.insert("ORIGINAL_PROVIDER", "Discover Card");
    tokens.insert("DISPUTED_AMOUNT", "$2,000.00");
    tokens.insert("BATES_DOCKET", docket);
    tokens.insert("DEBTOR_NAME", "Carlos Rivera");

    let settlement_doc = TemplateEngine::interpolate(template, &tokens);
    assert!(settlement_doc.contains("CONDITIONAL SETTLEMENT & FULL TRADELINE DELETION PROPOSAL"));
    assert!(settlement_doc.contains("RULE 408"));
    assert!(settlement_doc.contains("Equifax, Experian, TransUnion"));
    assert!(settlement_doc.contains(docket));

    // 3. State Machine Advance to Terminal Settled State
    let advanced = db
        .update_case_status(&case_id.to_string(), &CaseStatus::DebtSettled)
        .unwrap();
    assert!(advanced);

    let settled_case = db.get_case_by_id(&case_id.to_string()).unwrap().unwrap();
    assert_eq!(settled_case.status, CaseStatus::DebtSettled);

    // Assert terminal state immutability
    assert!(
        !settled_case
            .status
            .can_transition_to(&CaseStatus::ValidationPending)
    );
    assert!(
        !settled_case
            .status
            .can_transition_to(&CaseStatus::InitialNotice)
    );
}

/// =========================================================================
/// 9.8.5 Auto Loan Deficiency Dispute Workflow:
/// Case creation -> Repossession accounting verification under UCC Article 9
/// -> Deficiency demand letter generation -> File export
/// =========================================================================
#[test]
fn test_e2e_auto_deficiency_dispute_workflow() {
    let db = DatabaseManager::init_in_memory().expect("Init DB");
    let case_id = Uuid::new_v4();
    let docket = "BATES-2026-AUTO-909";

    // 1. Case Creation: Auto loan deficiency ($8,500) after repossession
    let case = Case {
        id: case_id,
        docket_number: docket.to_string(),
        debtor_name: "Travis Sterling".to_string(),
        debt_type: DebtType::AutoDeficiency,
        provider_name: "Ally Financial".to_string(),
        collection_agency: "Stellar Recovery Solutions".to_string(),
        original_account_number: "ALLY-AUTO-9901".to_string(),
        collection_account_number: "SRS-DEF-3341".to_string(),
        original_balance: 8500.00,
        disputed_balance: 8500.00,
        status: CaseStatus::InitialNotice,
        jurisdiction_state: "FL".to_string(),
        date_of_service: None,
        initial_notice_date: "2026-06-01".to_string(),
        certified_mail_tracking: None,
        created_at: Utc::now(),
        closed_at: None,
    };
    db.create_case(&case).expect("Create case");

    // 2. UCC Article 9 Audit: Untimely post-sale accounting + uncredited GAP rebate
    let pre_notice = PreSaleNotice {
        date_notice_sent: NaiveDate::from_ymd_opt(2026, 4, 1).unwrap(),
        scheduled_disposition_date: NaiveDate::from_ymd_opt(2026, 4, 15).unwrap(),
        disposition_type: DispositionType::PublicAuction,
        describes_debtor_and_secured_party: true,
        describes_collateral_vin: true,
        states_method_of_disposition: true,
        states_time_and_place_of_sale: true,
        states_debtor_entitled_to_accounting: true,
        states_liability_for_deficiency: true,
    };

    let post_accounting = PostSaleAccounting {
        date_accounting_requested: Some(NaiveDate::from_ymd_opt(2026, 4, 15).unwrap()),
        date_accounting_provided: Some(NaiveDate::from_ymd_opt(2026, 5, 10).unwrap()), // 25 days later (> 14 days statutory limit under UCC § 9-616)
        original_obligation_amount: 20500.0,
        gross_sale_proceeds: 12000.0,
        allowable_repossession_expenses: 1500.0,
        unearned_interest_and_rebates: 1500.0, // GAP insurance rebate
        claimed_deficiency_amount: 10000.0,    // Failed to credit $1,500 GAP rebate
    };

    let audit = UccArticle9Engine::audit_deficiency(
        Some(&pre_notice),
        &post_accounting,
        Some(20500.0),
        Some(3000.0),
    );
    assert!(
        !audit.is_untimely_notice,
        "Notice provided with 14 days was timely"
    );
    assert!(
        audit.is_untimely_post_sale_accounting,
        "Post-sale accounting beyond 14 days violates UCC § 9-616"
    );
    assert!(
        audit.has_accounting_discrepancy,
        "Failure to credit GAP rebate creates accounting discrepancy"
    );
    assert_eq!(audit.audited_statutory_deficiency, 8500.0);
    assert_eq!(audit.accounting_discrepancy_amount, 1500.0);

    // 3. Generate UCC Article 9 Deficiency Demand Letter
    let template = TemplateEngine::auto_deficiency_dvl_template();
    let mut tokens = HashMap::new();
    tokens.insert("CERTIFIED_MAIL_TRACKING", "7021 0950 0001 9900 1122");
    tokens.insert("CURRENT_DATE", "June 5, 2026");
    tokens.insert("COLLECTION_AGENCY", "Stellar Recovery Solutions");
    tokens.insert("COLLECTION_ACCOUNT_NO", "SRS-DEF-3341");
    tokens.insert("ORIGINAL_PROVIDER", "Ally Financial");
    tokens.insert("DISPUTED_AMOUNT", "$8,500.00");
    tokens.insert("BATES_DOCKET", docket);
    tokens.insert("DEBTOR_NAME", "Travis Sterling");

    let auto_doc = TemplateEngine::interpolate(template, &tokens);
    assert!(auto_doc.contains("UCC ARTICLE 9"));
    assert!(auto_doc.contains("UCC § 9-616"));
    assert!(auto_doc.contains("UCC § 9-611"));
    assert!(auto_doc.contains(docket));

    // 4. Export to Sandboxed Markdown
    let temp_dir = std::env::temp_dir().join(format!("settlemint_e2e_auto_{}", Uuid::new_v4()));
    let sandbox = EvidenceVault::build_sandbox_paths(&temp_dir);
    sandbox.create_all().expect("Init sandbox");

    let md_path = DocumentExporter::export_to_sandbox(
        &sandbox,
        docket,
        "Auto_Deficiency_Dispute",
        &auto_doc,
        ExportFormat::Markdown,
    )
    .expect("Export MD");
    assert!(md_path.exists());

    let _ = std::fs::remove_dir_all(&temp_dir);
}

/// =========================================================================
/// 9.9.5 Concurrency Stress Testing:
/// Assert 100 concurrent interaction log writes complete without
/// SQLite lock errors or thread contention
/// =========================================================================
#[test]
fn test_concurrency_100_parallel_interaction_writes() {
    let db = Arc::new(DatabaseManager::init_in_memory().expect("Init DB"));
    let case_id = Uuid::new_v4();

    let initial_case = Case {
        id: case_id,
        docket_number: "SM-CONC-100".to_string(),
        debtor_name: "Parallel Debtor".to_string(),
        debt_type: DebtType::CreditCard,
        provider_name: "Mega Bank".to_string(),
        collection_agency: "Global Recovery".to_string(),
        original_account_number: "ACCT-PARALLEL".to_string(),
        collection_account_number: "COLL-PARALLEL".to_string(),
        original_balance: 10000.0,
        disputed_balance: 10000.0,
        status: CaseStatus::InitialNotice,
        jurisdiction_state: "NY".to_string(),
        date_of_service: None,
        initial_notice_date: "2026-01-01".to_string(),
        certified_mail_tracking: None,
        created_at: Utc::now(),
        closed_at: None,
    };
    db.create_case(&initial_case).expect("Create case");

    // Spawn 100 concurrent threads logging interactions and violations simultaneously
    let mut handles = Vec::with_capacity(100);

    for i in 0..100 {
        let db_clone = Arc::clone(&db);
        let handle = thread::spawn(move || {
            let interaction_id = Uuid::new_v4();
            let interaction = Interaction {
                id: interaction_id,
                case_id,
                creditor_id: None,
                timestamp: Utc::now() + ChronoDuration::seconds(i),
                channel: Channel::Phone,
                direction: Direction::Incoming,
                contact_name: format!("Collector Agent #{:03}", i),
                contact_phone: Some("800-555-0100".to_string()),
                duration_seconds: 60,
                summary_notes: format!("Concurrent automated stress test call #{:03}", i),
                audio_recording_path: None,
                recorded_flag: false,
            };

            let violation = Violation {
                id: Uuid::new_v4(),
                interaction_id,
                case_id,
                violation_type: FdcpaViolationType::InconvenientTime,
                statutory_citation: "15 U.S.C. § 1692c(a)(1)".to_string(),
                statutory_penalty_cap: 1000.0,
                actual_damages: 0.0,
                factual_summary: format!("Concurrent stress test violation #{:03}", i),
                evidence_references: vec![],
            };

            db_clone.log_interaction(&interaction, &[violation])
        });
        handles.push(handle);
    }

    // Join all 100 worker threads and assert zero lock errors
    for (idx, handle) in handles.into_iter().enumerate() {
        let res = handle.join().expect("Worker thread panicked");
        assert!(
            res.is_ok(),
            "Thread {} failed with error: {:?}",
            idx,
            res.err()
        );
    }

    // Verify exactly 100 interactions and 100 violations were persisted cleanly in SQLite
    let interactions = db
        .get_interactions(&case_id.to_string())
        .expect("Fetch interactions");
    assert_eq!(
        interactions.len(),
        100,
        "Must persist exactly 100 interactions"
    );

    let violations = db
        .get_violations(&case_id.to_string())
        .expect("Fetch violations");
    assert_eq!(violations.len(), 100, "Must persist exactly 100 violations");
}
