pub mod dao;
pub mod schema;

pub use dao::{
    CaseDao, CreditTradelineDao, CreditorDao, DeadlineDao, DocumentDao, InteractionDao,
    ViolationDao,
};

use crate::error::{AppError, AppResult};
use crate::models::case::{Case, CaseStatus};
use crate::models::credit::CreditTradeLine;
use crate::models::creditor::Creditor;
use crate::models::deadline::Deadline;
use crate::models::document::Document;
use crate::models::interaction::Interaction;
use crate::models::violation::Violation;
use rusqlite::Connection;
use std::path::Path;
use std::sync::Mutex;
use uuid::Uuid;

pub struct DatabaseManager {
    pub conn: Mutex<Connection>,
}

impl DatabaseManager {
    /// Initialize local embedded SQLite database with WAL mode, run schema migrations,
    /// and verify database integrity.
    pub fn init<P: AsRef<Path>>(path: P) -> Result<Self, AppError> {
        let conn = Connection::open(path)?;

        // Execute WAL and DDL migrations
        conn.execute_batch(schema::CREATE_TABLES_SQL)?;

        // Startup database integrity check
        let integrity: String = conn.query_row("PRAGMA integrity_check;", [], |row| row.get(0))?;
        if integrity != "ok" {
            return Err(AppError::Database(format!(
                "SQLite integrity check failed: {}",
                integrity
            )));
        }

        Ok(Self {
            conn: Mutex::new(conn),
        })
    }

    /// In-memory initialization for testing and rapid verification
    pub fn init_in_memory() -> Result<Self, AppError> {
        let conn = Connection::open_in_memory()?;
        conn.execute_batch(schema::CREATE_TABLES_SQL)?;

        let integrity: String = conn.query_row("PRAGMA integrity_check;", [], |row| row.get(0))?;
        if integrity != "ok" {
            return Err(AppError::Database(format!(
                "SQLite integrity check failed: {}",
                integrity
            )));
        }

        Ok(Self {
            conn: Mutex::new(conn),
        })
    }

    /// Force an explicit SQLite WAL checkpoint to flush all WAL journal pages into the main database file
    pub fn checkpoint(&self) -> AppResult<()> {
        let conn = self
            .conn
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        conn.execute_batch("PRAGMA wal_checkpoint(TRUNCATE);")?;
        Ok(())
    }

    pub fn create_case(&self, case: &Case) -> AppResult<Uuid> {
        let conn = self
            .conn
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        CaseDao::insert(&conn, case)
    }

    pub fn create_case_bundle(
        &self,
        case: &Case,
        creditors: &[Creditor],
        documents: &[Document],
    ) -> AppResult<Uuid> {
        let mut conn = self
            .conn
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        CaseDao::insert_bundle(&mut conn, case, creditors, documents)
    }

    pub fn get_cases(&self) -> AppResult<Vec<Case>> {
        let conn = self
            .conn
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        CaseDao::get_all(&conn)
    }

    pub fn get_case_by_id(&self, case_id: &str) -> AppResult<Option<Case>> {
        let conn = self
            .conn
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        CaseDao::get_by_id(&conn, case_id)
    }

    pub fn update_case_status(&self, case_id: &str, new_status: &CaseStatus) -> AppResult<bool> {
        let conn = self
            .conn
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        CaseDao::update_status(&conn, case_id, new_status)
    }

    pub fn create_creditor(&self, creditor: &Creditor) -> AppResult<Uuid> {
        let conn = self
            .conn
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        CreditorDao::insert(&conn, creditor)
    }

    pub fn get_creditors(&self, case_id: &str) -> AppResult<Vec<Creditor>> {
        let conn = self
            .conn
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        CreditorDao::get_by_case(&conn, case_id)
    }

    pub fn log_interaction(
        &self,
        interaction: &Interaction,
        violations: &[Violation],
    ) -> AppResult<Uuid> {
        let mut conn = self
            .conn
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        InteractionDao::log(&mut conn, interaction, violations)
    }

    pub fn get_interactions(&self, case_id: &str) -> AppResult<Vec<Interaction>> {
        let conn = self
            .conn
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        InteractionDao::get_by_case(&conn, case_id)
    }

    pub fn get_violations(&self, case_id: &str) -> AppResult<Vec<Violation>> {
        let conn = self
            .conn
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        ViolationDao::get_by_case(&conn, case_id)
    }

    pub fn create_document(&self, doc: &Document) -> AppResult<Uuid> {
        let conn = self
            .conn
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        DocumentDao::insert(&conn, doc)
    }

    pub fn get_documents(&self, case_id: &str) -> AppResult<Vec<Document>> {
        let conn = self
            .conn
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        DocumentDao::get_by_case(&conn, case_id)
    }

    pub fn create_credit_tradeline(&self, tradeline: &CreditTradeLine) -> AppResult<Uuid> {
        let conn = self
            .conn
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        CreditTradelineDao::insert(&conn, tradeline)
    }

    pub fn get_credit_tradelines(&self, case_id: &str) -> AppResult<Vec<CreditTradeLine>> {
        let conn = self
            .conn
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        CreditTradelineDao::get_by_case(&conn, case_id)
    }

    pub fn create_deadline(&self, deadline: &Deadline) -> AppResult<Uuid> {
        let conn = self
            .conn
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        DeadlineDao::insert(&conn, deadline)
    }

    pub fn get_deadlines(&self, case_id: &str) -> AppResult<Vec<Deadline>> {
        let conn = self
            .conn
            .lock()
            .map_err(|e| AppError::Internal(e.to_string()))?;
        DeadlineDao::get_by_case(&conn, case_id)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::case::DebtType;
    use crate::models::credit::Bureau;
    use crate::models::creditor::AgencyType;
    use crate::models::deadline::DeadlineType;
    use crate::models::document::DocumentType;
    use crate::models::interaction::{Channel, Direction};
    use crate::models::violation::FdcpaViolationType;
    use chrono::Utc;

    #[test]
    fn test_database_init_and_integrity_check() {
        let db = DatabaseManager::init_in_memory().expect("Should initialize in-memory DB");
        let conn = db.conn.lock().expect("Lock connection");
        let integrity: String = conn
            .query_row("PRAGMA integrity_check;", [], |row| row.get(0))
            .expect("Run integrity check");
        assert_eq!(integrity, "ok");
    }

    #[test]
    fn test_full_dao_workflow() {
        let db = DatabaseManager::init_in_memory().expect("Should initialize in-memory DB");

        // 1. Case DAO
        let case_id = Uuid::new_v4();
        let case = Case {
            id: case_id,
            docket_number: "2026-CV-009".to_string(),
            debtor_name: "Jane Doe".to_string(),
            debt_type: DebtType::CreditCard,
            provider_name: "National Bank".to_string(),
            collection_agency: "Apex Collections LLC".to_string(),
            original_account_number: "4111-XXXX-XXXX-1234".to_string(),
            collection_account_number: "APX-99812".to_string(),
            original_balance: 4500.0,
            disputed_balance: 4500.0,
            status: CaseStatus::InitialNotice,
            jurisdiction_state: "TX".to_string(),
            date_of_service: None,
            initial_notice_date: "2026-01-10".to_string(),
            certified_mail_tracking: Some("9405500000000000000000".to_string()),
            created_at: Utc::now(),
            closed_at: None,
        };

        let inserted_case_id = db.create_case(&case).expect("Create case");
        assert_eq!(inserted_case_id, case_id);

        let cases = db.get_cases().expect("Get cases");
        assert_eq!(cases.len(), 1);
        assert_eq!(cases[0].docket_number, "2026-CV-009");

        let fetched = db
            .get_case_by_id(&case_id.to_string())
            .expect("Get case by ID");
        assert!(fetched.is_some());
        assert_eq!(fetched.unwrap().debtor_name, "Jane Doe");

        let status_updated = db
            .update_case_status(&case_id.to_string(), &CaseStatus::ValidationPending)
            .expect("Update status");
        assert!(status_updated);

        // 2. Creditor DAO
        let creditor = Creditor {
            id: Uuid::new_v4(),
            case_id,
            entity_name: "Apex Collections LLC".to_string(),
            agency_type: AgencyType::ThirdPartyServicer,
            corporate_address: "100 Recovery Way, Dallas, TX 75201".to_string(),
            phone_number: "800-555-0199".to_string(),
            registered_agent: Some("Corporate Agents Inc".to_string()),
            state_license_id: Some("TX-BOND-2026-01".to_string()),
        };
        db.create_creditor(&creditor).expect("Create creditor");
        let creditors = db
            .get_creditors(&case_id.to_string())
            .expect("Get creditors");
        assert_eq!(creditors.len(), 1);
        assert_eq!(creditors[0].entity_name, "Apex Collections LLC");

        // 3. Interaction & Violation DAO
        let interaction_id = Uuid::new_v4();
        let interaction = Interaction {
            id: interaction_id,
            case_id,
            creditor_id: Some(creditor.id),
            timestamp: Utc::now(),
            channel: Channel::Phone,
            direction: Direction::Incoming,
            contact_name: "Collector Smith".to_string(),
            contact_phone: Some("800-555-0199".to_string()),
            duration_seconds: 180,
            summary_notes: "Threatened legal action before debt validation".to_string(),
            audio_recording_path: None,
            recorded_flag: false,
        };

        let violation = Violation {
            id: Uuid::new_v4(),
            case_id,
            interaction_id,
            violation_type: FdcpaViolationType::UnlawfulThreat,
            statutory_citation: "15 U.S.C. § 1692e(5)".to_string(),
            statutory_penalty_cap: 1000.0,
            actual_damages: 0.0,
            factual_summary: "Threat of lawsuit before 30-day dispute window closed".to_string(),
            evidence_references: vec!["SM-0001".to_string()],
        };

        let logged_id = db
            .log_interaction(&interaction, &[violation])
            .expect("Log interaction");
        assert_eq!(logged_id, interaction_id);

        let interactions = db
            .get_interactions(&case_id.to_string())
            .expect("Get interactions");
        assert_eq!(interactions.len(), 1);

        let violations = db
            .get_violations(&case_id.to_string())
            .expect("Get violations");
        assert_eq!(violations.len(), 1);
        assert_eq!(violations[0].statutory_penalty_cap, 1000.0);

        // 4. Document DAO
        let doc = Document {
            id: Uuid::new_v4(),
            case_id,
            bates_identifier: "BATES-0001".to_string(),
            title: "Initial Dunning Notice".to_string(),
            document_type: DocumentType::DebtValidationLetter,
            relative_file_path: "evidence/bates-0001.pdf".to_string(),
            sha256_hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
                .to_string(),
            file_size_bytes: 4096,
            created_at: Utc::now(),
        };
        db.create_document(&doc).expect("Create document");
        let docs = db
            .get_documents(&case_id.to_string())
            .expect("Get documents");
        assert_eq!(docs.len(), 1);
        assert_eq!(docs[0].bates_identifier, "BATES-0001");

        // 5. Deadline DAO
        let deadline = Deadline {
            id: Uuid::new_v4(),
            case_id,
            deadline_type: DeadlineType::Fdcpa30DayValidation,
            title: "30-Day FDCPA Dispute Window".to_string(),
            target_date: Utc::now() + chrono::Duration::days(30),
            completed: false,
            reminder_days_prior: vec![7, 3, 1],
            notes: "Send validation response before expiry".to_string(),
        };
        db.create_deadline(&deadline).expect("Create deadline");
        let deadlines = db
            .get_deadlines(&case_id.to_string())
            .expect("Get deadlines");
        assert_eq!(deadlines.len(), 1);
        assert!(!deadlines[0].completed);

        // 6. Credit Tradeline DAO
        let tradeline = CreditTradeLine {
            id: Uuid::new_v4(),
            case_id,
            bureau: Bureau::Experian,
            reporting_agency_name: "Apex Coll".to_string(),
            account_number_masked: "XXXX-1234".to_string(),
            balance_reported: 4500.0,
            remark_status: crate::models::credit::DisputeRemarkStatus::NotReported,
            is_marked_disputed: false,
            fcra_violation_flag: false,
            last_reported_date: "2026-01-15".to_string(),
        };
        db.create_credit_tradeline(&tradeline)
            .expect("Create tradeline");
        let tradelines = db
            .get_credit_tradelines(&case_id.to_string())
            .expect("Get tradelines");
        assert_eq!(tradelines.len(), 1);
        assert_eq!(tradelines[0].bureau, Bureau::Experian);
    }

    #[test]
    fn test_case_state_machine_transitions() {
        let db = DatabaseManager::init_in_memory().expect("Init DB");
        let case_id = Uuid::new_v4();
        let case = Case {
            id: case_id,
            docket_number: "SM-2026-FSM".to_string(),
            debtor_name: "Alice Smith".to_string(),
            debt_type: DebtType::CreditCard,
            provider_name: "Capital Bank".to_string(),
            collection_agency: "Global Collections".to_string(),
            original_account_number: "9876".to_string(),
            collection_account_number: "5432".to_string(),
            original_balance: 3200.0,
            disputed_balance: 3200.0,
            status: CaseStatus::InitialNotice,
            jurisdiction_state: "CA".to_string(),
            date_of_service: None,
            initial_notice_date: "2026-05-01".to_string(),
            certified_mail_tracking: None,
            created_at: Utc::now(),
            closed_at: None,
        };
        db.create_case(&case).expect("Create case");

        // 1. Invalid jump: InitialNotice -> CollectorResponded (skipped ValidationPending)
        let invalid_jump =
            db.update_case_status(&case_id.to_string(), &CaseStatus::CollectorResponded);
        assert!(matches!(
            invalid_jump,
            Err(AppError::InvalidStateTransition { ref current, ref attempted })
                if current == "InitialNotice" && attempted == "CollectorResponded"
        ));

        // 2. Valid transition: InitialNotice -> ValidationPending
        let v1 = db.update_case_status(&case_id.to_string(), &CaseStatus::ValidationPending);
        assert!(v1.is_ok());

        // 3. Valid transition: ValidationPending -> CollectorResponded
        let v2 = db.update_case_status(&case_id.to_string(), &CaseStatus::CollectorResponded);
        assert!(v2.is_ok());

        // 4. Valid transition: CollectorResponded -> DebtDismissed (terminal state)
        let v3 = db.update_case_status(&case_id.to_string(), &CaseStatus::DebtDismissed);
        assert!(v3.is_ok());

        // Verify closed_at timestamp was set
        let fetched = db.get_case_by_id(&case_id.to_string()).unwrap().unwrap();
        assert_eq!(fetched.status, CaseStatus::DebtDismissed);
        assert!(fetched.closed_at.is_some());

        // 5. Invalid transition: cannot reopen or jump from terminal DebtDismissed back to InitialNotice
        let reopen_attempt =
            db.update_case_status(&case_id.to_string(), &CaseStatus::InitialNotice);
        assert!(matches!(
            reopen_attempt,
            Err(AppError::InvalidStateTransition { ref current, ref attempted })
                if current == "DebtDismissed" && attempted == "InitialNotice"
        ));
    }

    #[test]
    fn test_concurrent_state_updates_and_race_conditions() {
        use std::sync::Arc;
        use std::thread;

        let db = Arc::new(DatabaseManager::init_in_memory().expect("Init DB"));

        // Part 1: Competing concurrent updates on the SAME case
        let single_case_id = Uuid::new_v4();
        let initial_case = Case {
            id: single_case_id,
            docket_number: "SM-RACE-001".to_string(),
            debtor_name: "Robert Race".to_string(),
            debt_type: DebtType::CreditCard,
            provider_name: "First Bank".to_string(),
            collection_agency: "Asset Recovery".to_string(),
            original_account_number: "1111".to_string(),
            collection_account_number: "2222".to_string(),
            original_balance: 1500.0,
            disputed_balance: 1500.0,
            status: CaseStatus::InitialNotice,
            jurisdiction_state: "TX".to_string(),
            date_of_service: None,
            initial_notice_date: "2026-06-01".to_string(),
            certified_mail_tracking: None,
            created_at: Utc::now(),
            closed_at: None,
        };
        db.create_case(&initial_case).expect("Create initial case");

        let mut update_handles = Vec::new();
        let mut query_handles = Vec::new();

        // 10 threads attempt strictly invalid transition: InitialNotice -> CollectorResponded
        for _ in 0..10 {
            let db_clone = Arc::clone(&db);
            update_handles.push(thread::spawn(move || {
                db_clone.update_case_status(
                    &single_case_id.to_string(),
                    &CaseStatus::CollectorResponded,
                )
            }));
        }

        // 10 threads concurrently query the case status
        for _ in 0..10 {
            let db_clone = Arc::clone(&db);
            query_handles.push(thread::spawn(move || {
                let res = db_clone.get_case_by_id(&single_case_id.to_string());
                assert!(res.is_ok());
                res.unwrap().is_some()
            }));
        }

        for h in update_handles {
            let _ = h.join();
        }
        for h in query_handles {
            let _ = h.join();
        }

        // Verify the case was NOT corrupted by the invalid transition attempts
        let case_after_invalid_races = db
            .get_case_by_id(&single_case_id.to_string())
            .unwrap()
            .unwrap();
        assert_eq!(case_after_invalid_races.status, CaseStatus::InitialNotice);

        // Part 2: High-concurrency multi-threaded lifecycle advancement across 25 cases
        let case_count = 25;
        let mut case_ids = Vec::new();
        for i in 0..case_count {
            let cid = Uuid::new_v4();
            case_ids.push(cid);
            let c = Case {
                id: cid,
                docket_number: format!("SM-CONC-{:03}", i),
                debtor_name: format!("Debtor {:03}", i),
                debt_type: DebtType::Medical,
                provider_name: "County Hospital".to_string(),
                collection_agency: "Metro Debt Inc".to_string(),
                original_account_number: format!("ACCT-{}", i),
                collection_account_number: format!("COLL-{}", i),
                original_balance: 2000.0 + (i as f64 * 100.0),
                disputed_balance: 2000.0 + (i as f64 * 100.0),
                status: CaseStatus::InitialNotice,
                jurisdiction_state: "CA".to_string(),
                date_of_service: None,
                initial_notice_date: "2026-07-01".to_string(),
                certified_mail_tracking: None,
                created_at: Utc::now(),
                closed_at: None,
            };
            db.create_case(&c).expect("Create case");
        }

        let mut worker_handles = Vec::new();

        // Spawn 25 concurrent worker threads, each driving a case through its statutory lifecycle
        for cid in case_ids.clone() {
            let db_clone = Arc::clone(&db);
            worker_handles.push(thread::spawn(move || {
                // InitialNotice -> ValidationPending
                let s1 =
                    db_clone.update_case_status(&cid.to_string(), &CaseStatus::ValidationPending);
                assert!(s1.is_ok(), "Transition to ValidationPending should succeed");

                // ValidationPending -> CollectorResponded
                let s2 =
                    db_clone.update_case_status(&cid.to_string(), &CaseStatus::CollectorResponded);
                assert!(
                    s2.is_ok(),
                    "Transition to CollectorResponded should succeed"
                );

                // CollectorResponded -> DebtDismissed (terminal)
                let s3 = db_clone.update_case_status(&cid.to_string(), &CaseStatus::DebtDismissed);
                assert!(s3.is_ok(), "Transition to DebtDismissed should succeed");
            }));
        }

        // Simultaneously spawn 5 reader threads hammering get_cases()
        let mut reader_handles = Vec::new();
        for _ in 0..5 {
            let db_clone = Arc::clone(&db);
            reader_handles.push(thread::spawn(move || {
                for _ in 0..10 {
                    let all = db_clone.get_cases().expect("Concurrent get_cases");
                    assert!(all.len() >= case_count);
                }
            }));
        }

        for h in worker_handles {
            h.join().expect("Worker thread panicked");
        }
        for h in reader_handles {
            h.join().expect("Reader thread panicked");
        }

        // Verify all 25 cases reached DebtDismissed with closed_at set
        for cid in case_ids {
            let finalized = db.get_case_by_id(&cid.to_string()).unwrap().unwrap();
            assert_eq!(
                finalized.status,
                CaseStatus::DebtDismissed,
                "Case {} should be in DebtDismissed",
                cid
            );
            assert!(
                finalized.closed_at.is_some(),
                "Case {} should have closed_at timestamp",
                cid
            );
        }

        // Verify total case count and database integrity
        let all_cases = db.get_cases().expect("Get all cases");
        assert_eq!(all_cases.len(), case_count + 1); // 25 + 1 from Part 1
        let conn = db.conn.lock().expect("Lock connection");
        let integrity: String = conn
            .query_row("PRAGMA integrity_check;", [], |row| row.get(0))
            .expect("Integrity check");
        assert_eq!(integrity, "ok");
    }

    #[test]
    fn test_transaction_atomicity_and_rollback() {
        let db = DatabaseManager::init_in_memory().expect("Init DB");

        // Test 1: Case Bundle Ingestion Rollback on Duplicate Bates Identifier
        let case_id = Uuid::new_v4();
        let case = Case {
            id: case_id,
            docket_number: "SM-TX-ATOM-001".to_string(),
            debtor_name: "John Transaction".to_string(),
            debt_type: DebtType::CreditCard,
            provider_name: "First National".to_string(),
            collection_agency: "Asset Recovery".to_string(),
            original_account_number: "4444".to_string(),
            collection_account_number: "5555".to_string(),
            original_balance: 5000.0,
            disputed_balance: 5000.0,
            status: CaseStatus::InitialNotice,
            jurisdiction_state: "FL".to_string(),
            date_of_service: None,
            initial_notice_date: "2026-08-01".to_string(),
            certified_mail_tracking: None,
            created_at: Utc::now(),
            closed_at: None,
        };

        let creditor = Creditor {
            id: Uuid::new_v4(),
            case_id,
            entity_name: "Asset Recovery Inc".to_string(),
            agency_type: AgencyType::DebtBuyer,
            corporate_address: "500 Palm Way, Miami, FL 33101".to_string(),
            phone_number: "800-555-4321".to_string(),
            registered_agent: None,
            state_license_id: None,
        };

        // Document 1 has BATES-DUP-01
        let doc1 = Document {
            id: Uuid::new_v4(),
            case_id,
            bates_identifier: "BATES-DUP-01".to_string(),
            title: "Validation Notice".to_string(),
            document_type: DocumentType::DebtValidationLetter,
            relative_file_path: "evidence/doc1.pdf".to_string(),
            sha256_hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
                .to_string(),
            file_size_bytes: 1024,
            created_at: Utc::now(),
        };

        // Document 2 has the SAME Bates identifier (violates UNIQUE constraint on documents.bates_identifier)
        let doc2 = Document {
            id: Uuid::new_v4(),
            case_id,
            bates_identifier: "BATES-DUP-01".to_string(), // DUPLICATE UNIQUE KEY
            title: "Itemized Billing Statement".to_string(),
            document_type: DocumentType::ProviderBillingRecord,
            relative_file_path: "evidence/doc2.pdf".to_string(),
            sha256_hash: "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
                .to_string(),
            file_size_bytes: 2048,
            created_at: Utc::now(),
        };

        // Execute case bundle ingestion which MUST fail on doc2
        let bundle_result = db.create_case_bundle(&case, &[creditor], &[doc1, doc2]);
        assert!(
            bundle_result.is_err(),
            "Bundle insertion must fail due to duplicate Bates identifier"
        );

        // Verify complete rollback: Case, Creditor, and Document 1 MUST NOT exist in database!
        assert!(
            db.get_case_by_id(&case_id.to_string()).unwrap().is_none(),
            "Case should have rolled back"
        );
        assert_eq!(
            db.get_cases().unwrap().len(),
            0,
            "No cases should exist after rollback"
        );
        assert_eq!(
            db.get_creditors(&case_id.to_string()).unwrap().len(),
            0,
            "Creditor should have rolled back"
        );
        assert_eq!(
            db.get_documents(&case_id.to_string()).unwrap().len(),
            0,
            "Document 1 should have rolled back"
        );

        // Test 2: Interaction Logging Rollback on Violation Constraint Violation
        // First, insert a valid case
        db.create_case(&case).expect("Create standalone case");

        let interaction_id = Uuid::new_v4();
        let interaction = Interaction {
            id: interaction_id,
            case_id,
            creditor_id: None,
            timestamp: Utc::now(),
            channel: Channel::Phone,
            direction: Direction::Incoming,
            contact_name: "Agent Smith".to_string(),
            contact_phone: Some("800-555-9999".to_string()),
            duration_seconds: 120,
            summary_notes: "Debt collection call".to_string(),
            audio_recording_path: None,
            recorded_flag: false,
        };

        let v1_id = Uuid::new_v4();
        let violation_valid = Violation {
            id: v1_id,
            case_id,
            interaction_id,
            violation_type: FdcpaViolationType::InconvenientTime,
            statutory_citation: "15 U.S.C. § 1692c(a)(1)".to_string(),
            statutory_penalty_cap: 1000.0,
            actual_damages: 0.0,
            factual_summary: "Call placed before 8am".to_string(),
            evidence_references: vec![],
        };

        // Violation 2 has DUPLICATE primary key (v1_id)
        let violation_invalid = Violation {
            id: v1_id, // DUPLICATE PRIMARY KEY
            case_id,
            interaction_id,
            violation_type: FdcpaViolationType::WorkplaceContact,
            statutory_citation: "15 U.S.C. § 1692c(a)(3)".to_string(),
            statutory_penalty_cap: 1000.0,
            actual_damages: 0.0,
            factual_summary: "Call placed to workplace".to_string(),
            evidence_references: vec![],
        };

        let log_result =
            db.log_interaction(&interaction, &[violation_valid.clone(), violation_invalid]);
        assert!(
            log_result.is_err(),
            "Interaction log must fail on duplicate violation ID"
        );

        // Verify complete rollback: interaction and violation 1 MUST NOT exist
        assert_eq!(
            db.get_interactions(&case_id.to_string()).unwrap().len(),
            0,
            "Interaction should have rolled back"
        );
        assert_eq!(
            db.get_violations(&case_id.to_string()).unwrap().len(),
            0,
            "Violation 1 should have rolled back"
        );

        // Test 3: Successful Transaction Commit
        let violation2_valid = Violation {
            id: Uuid::new_v4(), // UNIQUE ID
            case_id,
            interaction_id,
            violation_type: FdcpaViolationType::WorkplaceContact,
            statutory_citation: "15 U.S.C. § 1692c(a)(3)".to_string(),
            statutory_penalty_cap: 1000.0,
            actual_damages: 0.0,
            factual_summary: "Call placed to workplace".to_string(),
            evidence_references: vec![],
        };

        let success_result = db.log_interaction(&interaction, &[violation_valid, violation2_valid]);
        assert!(
            success_result.is_ok(),
            "Valid transaction should commit successfully"
        );

        assert_eq!(db.get_interactions(&case_id.to_string()).unwrap().len(), 1);
        assert_eq!(db.get_violations(&case_id.to_string()).unwrap().len(), 2);
    }

    #[test]
    fn test_sql_injection_resistance_fuzzing() {
        let db = DatabaseManager::init_in_memory().expect("Init DB");

        // Comprehensive corpus of SQL injection vectors
        let injection_payloads = [
            // 1. Tautologies & auth bypasses
            "' OR '1'='1",
            "' OR 1=1 --",
            "admin' --",
            "\" OR \"\"=\"\"",
            "' OR '' = '",
            // 2. Piggybacked / stacked execution
            "'; DROP TABLE cases; --",
            "'; DROP TABLE interactions; --",
            "'; DELETE FROM cases WHERE '1'='1'; --",
            "'; UPDATE cases SET status = 'DebtDismissed'; --",
            // 3. Union-based extraction payloads
            "' UNION SELECT 'pwned', 'pwned', 'pwned', 'Medical', 'pwned', 'pwned', 'pwned', 'pwned', 0.0, 0.0, 'InitialNotice', 'CA', NULL, '2026-01-01', NULL, '2026-01-01', NULL FROM cases --",
            "' UNION ALL SELECT 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17 --",
            // 4. Blind & error-based subqueries
            "' AND (SELECT count(*) FROM cases WHERE substr(debtor_name,1,1)='A') > 0 --",
            "'; SELECT randomblob(1000000); --",
            // 5. Comment and hex obfuscation
            "test' /*!50000OR*/ 1=1 --",
            "test';--",
            "test'/*comment*/OR/*comment*/'1'='1",
            "0x27204f5220313d31202d2d",
            "\\'; DROP TABLE cases; --",
        ];

        // Part 1: Fuzzing Case insertion and lookups
        for (idx, &payload) in injection_payloads.iter().enumerate() {
            let cid = Uuid::new_v4();
            let docket = format!("SM-FUZZ-{:03}-{}", idx, payload);
            let case = Case {
                id: cid,
                docket_number: docket.clone(),
                debtor_name: format!("Debtor {} {}", idx, payload),
                debt_type: DebtType::Medical,
                provider_name: format!("Hospital {}", payload),
                collection_agency: format!("Agency {}", payload),
                original_account_number: format!("ACCT-{}", payload),
                collection_account_number: format!("COLL-{}", payload),
                original_balance: 1000.0,
                disputed_balance: 1000.0,
                status: CaseStatus::InitialNotice,
                jurisdiction_state: "CA".to_string(),
                date_of_service: Some("2026-01-01".to_string()),
                initial_notice_date: "2026-01-01".to_string(),
                certified_mail_tracking: Some(payload.to_string()),
                created_at: Utc::now(),
                closed_at: None,
            };

            // Insertion must treat payload as pure literal string data without executing SQL commands
            let insert_res = db.create_case(&case);
            assert!(
                insert_res.is_ok(),
                "Failed to safely insert case with payload: {}",
                payload
            );

            // Lookup by exact docket containing injection string
            let fetched = db.get_case_by_id(&docket).expect("Safe lookup by docket");
            assert!(
                fetched.is_some(),
                "Should find case matching exact literal string"
            );
            assert_eq!(fetched.unwrap().docket_number, docket);

            // Attempt status update using injection payload as case_id
            let update_res = db.update_case_status(payload, &CaseStatus::ValidationPending);
            // Must safely return NotFound or InvalidStateTransition error, NEVER execute SQL injection
            assert!(
                update_res.is_err(),
                "Update with injection case_id must not succeed"
            );
        }

        // Part 2: Fuzzing Creditor and Interaction DAOs with malicious payloads
        let base_case_id = Uuid::new_v4();
        let base_case = Case {
            id: base_case_id,
            docket_number: "SM-BASE-001".to_string(),
            debtor_name: "Alice Normal".to_string(),
            debt_type: DebtType::CreditCard,
            provider_name: "Main Hospital".to_string(),
            collection_agency: "Main Agency".to_string(),
            original_account_number: "1111".to_string(),
            collection_account_number: "2222".to_string(),
            original_balance: 500.0,
            disputed_balance: 500.0,
            status: CaseStatus::InitialNotice,
            jurisdiction_state: "NY".to_string(),
            date_of_service: None,
            initial_notice_date: "2026-01-01".to_string(),
            certified_mail_tracking: None,
            created_at: Utc::now(),
            closed_at: None,
        };
        db.create_case(&base_case).expect("Create base case");

        for &payload in injection_payloads.iter() {
            let creditor = Creditor {
                id: Uuid::new_v4(),
                case_id: base_case_id,
                entity_name: format!("Creditor {}", payload),
                agency_type: AgencyType::DebtBuyer,
                corporate_address: format!("Address {}", payload),
                phone_number: format!("555-{}", payload),
                registered_agent: Some(payload.to_string()),
                state_license_id: Some(payload.to_string()),
            };
            assert!(db.create_creditor(&creditor).is_ok());

            let interaction = Interaction {
                id: Uuid::new_v4(),
                case_id: base_case_id,
                creditor_id: Some(creditor.id),
                timestamp: Utc::now(),
                channel: Channel::Phone,
                direction: Direction::Incoming,
                contact_name: format!("Collector {}", payload),
                contact_phone: Some(payload.to_string()),
                duration_seconds: 60,
                summary_notes: format!("Notes with malicious payload: {}", payload),
                audio_recording_path: Some(payload.to_string()),
                recorded_flag: false,
            };

            let violation = Violation {
                id: Uuid::new_v4(),
                case_id: base_case_id,
                interaction_id: interaction.id,
                violation_type: FdcpaViolationType::UnlawfulThreat,
                statutory_citation: format!("15 U.S.C. § 1692e {}", payload),
                statutory_penalty_cap: 1000.0,
                actual_damages: 0.0,
                factual_summary: format!("Summary with payload: {}", payload),
                evidence_references: vec![payload.to_string()],
            };

            assert!(db.log_interaction(&interaction, &[violation]).is_ok());

            let doc = Document {
                id: Uuid::new_v4(),
                case_id: base_case_id,
                bates_identifier: format!("BATES-{}", Uuid::new_v4()),
                title: format!("Doc Title {}", payload),
                document_type: DocumentType::DebtValidationLetter,
                relative_file_path: format!("evidence/path_{}.pdf", payload.replace('/', "_")),
                sha256_hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
                    .to_string(),
                file_size_bytes: 1024,
                created_at: Utc::now(),
            };
            assert!(db.create_document(&doc).is_ok());
        }

        // Part 3: Verify complete database integrity - NO tables dropped, PRAGMA integrity_check passes
        let conn = db.conn.lock().expect("Lock connection");
        let integrity: String = conn
            .query_row("PRAGMA integrity_check;", [], |row| row.get(0))
            .expect("Integrity check");
        assert_eq!(
            integrity, "ok",
            "Database integrity check must be ok after fuzzing"
        );

        // Verify table existence - 'cases' and 'interactions' MUST still exist and have all records
        let case_table_count: i64 = conn
            .query_row(
                "SELECT count(*) FROM sqlite_master WHERE type='table' AND name IN ('cases', 'creditors', 'interactions', 'violations', 'documents')",
                [],
                |row| row.get(0),
            )
            .expect("Count tables");
        assert_eq!(
            case_table_count, 5,
            "All 5 core tables must exist (no DROP TABLE attacks succeeded)"
        );

        let count: i64 = conn
            .query_row("SELECT count(*) FROM cases", [], |row| row.get(0))
            .expect("Count cases");
        assert_eq!(count, (injection_payloads.len() + 1) as i64);
    }

    #[test]
    fn test_database_wal_mode_checkpointing_and_recovery() {
        let test_dir = std::env::temp_dir().join(format!("settlemint_wal_test_{}", Uuid::new_v4()));
        std::fs::create_dir_all(&test_dir).expect("Create temp test dir");
        let db_path = test_dir.join("settlemint_wal.db");

        // Step 1: Initialize on disk and assert WAL mode is activated
        {
            let db = DatabaseManager::init(&db_path).expect("Init disk DB");
            let conn = db.conn.lock().expect("Lock connection");
            let mode: String = conn
                .query_row("PRAGMA journal_mode;", [], |row| row.get(0))
                .expect("Query journal_mode");
            assert_eq!(
                mode.to_lowercase(),
                "wal",
                "Database must run in WAL journal mode"
            );
        }

        let case1_id = Uuid::new_v4();
        let case2_id = Uuid::new_v4();

        // Step 2: Write initial data and perform explicit WAL checkpointing
        {
            let db = DatabaseManager::init(&db_path).expect("Reopen disk DB");
            let c1 = Case {
                id: case1_id,
                docket_number: "SM-WAL-001".to_string(),
                debtor_name: "Wal Customer 1".to_string(),
                debt_type: DebtType::CreditCard,
                provider_name: "Bank A".to_string(),
                collection_agency: "Agency A".to_string(),
                original_account_number: "1111".to_string(),
                collection_account_number: "2222".to_string(),
                original_balance: 1200.0,
                disputed_balance: 1200.0,
                status: CaseStatus::InitialNotice,
                jurisdiction_state: "TX".to_string(),
                date_of_service: None,
                initial_notice_date: "2026-09-01".to_string(),
                certified_mail_tracking: None,
                created_at: Utc::now(),
                closed_at: None,
            };
            db.create_case(&c1).expect("Create case 1");

            // Flush via explicit WAL checkpoint
            db.checkpoint().expect("WAL checkpoint should succeed");

            let cases = db.get_cases().expect("Get cases");
            assert_eq!(cases.len(), 1);
        }

        // Step 3: Write second batch of un-checkpointed data, then simulate abrupt crash/drop
        {
            let db = DatabaseManager::init(&db_path).expect("Reopen disk DB");
            let c2 = Case {
                id: case2_id,
                docket_number: "SM-WAL-002".to_string(),
                debtor_name: "Wal Customer 2".to_string(),
                debt_type: DebtType::Medical,
                provider_name: "Hospital B".to_string(),
                collection_agency: "Agency B".to_string(),
                original_account_number: "3333".to_string(),
                collection_account_number: "4444".to_string(),
                original_balance: 3500.0,
                disputed_balance: 3500.0,
                status: CaseStatus::InitialNotice,
                jurisdiction_state: "CA".to_string(),
                date_of_service: None,
                initial_notice_date: "2026-09-02".to_string(),
                certified_mail_tracking: None,
                created_at: Utc::now(),
                closed_at: None,
            };
            db.create_case(&c2).expect("Create case 2");

            // Advance status of case 1 without manual checkpoint
            db.update_case_status(&case1_id.to_string(), &CaseStatus::ValidationPending)
                .expect("Update status case 1");

            // Simulate abrupt termination: instance drops immediately with transactions committed in WAL log
        }

        // Step 4: Re-open database; verify SQLite automatic WAL log replay and recovery
        {
            let db = DatabaseManager::init(&db_path).expect("Reopen and recover disk DB");

            // Verify integrity check passes after WAL replay
            let conn = db.conn.lock().expect("Lock connection");
            let integrity: String = conn
                .query_row("PRAGMA integrity_check;", [], |row| row.get(0))
                .expect("Integrity check");
            assert_eq!(
                integrity, "ok",
                "Database integrity check must be ok after crash recovery"
            );
            drop(conn);

            // Both cases must be intact
            let recovered_cases = db.get_cases().expect("Get recovered cases");
            assert_eq!(
                recovered_cases.len(),
                2,
                "Both committed cases must survive recovery"
            );

            let recovered_c1 = db.get_case_by_id(&case1_id.to_string()).unwrap().unwrap();
            assert_eq!(
                recovered_c1.status,
                CaseStatus::ValidationPending,
                "State transition in WAL log must be replayed"
            );

            let recovered_c2 = db.get_case_by_id(&case2_id.to_string()).unwrap().unwrap();
            assert_eq!(recovered_c2.debtor_name, "Wal Customer 2");
        }

        // Cleanup temp test directory
        std::fs::remove_dir_all(&test_dir).ok();
    }
}
