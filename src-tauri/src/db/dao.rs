use crate::error::{AppError, AppResult};
use crate::models::case::{Case, CaseStatus, DebtType};
use crate::models::credit::{Bureau, CreditTradeLine, DisputeRemarkStatus};
use crate::models::creditor::{AgencyType, Creditor};
use crate::models::deadline::{Deadline, DeadlineType};
use crate::models::document::{Document, DocumentType};
use crate::models::interaction::{Channel, Direction, Interaction};
use crate::models::violation::{FdcpaViolationType, Violation};
use chrono::{DateTime, Utc};
use rusqlite::{Connection, params};
use std::str::FromStr;
use uuid::Uuid;

pub struct CaseDao;

impl CaseDao {
    pub fn insert(conn: &Connection, case: &Case) -> AppResult<Uuid> {
        let status_str = serde_json::to_string(&case.status)
            .map_err(|e| AppError::Validation(format!("Invalid status: {}", e)))?;
        let status_trimmed = status_str.trim_matches('"');

        let debt_type_str = serde_json::to_string(&case.debt_type)
            .map_err(|e| AppError::Validation(format!("Invalid debt type: {}", e)))?;
        let debt_type_trimmed = debt_type_str.trim_matches('"');

        conn.execute(
            "INSERT INTO cases (
                id, docket_number, debtor_name, debt_type, provider_name,
                collection_agency, original_account_number, collection_account_number,
                original_balance, disputed_balance, status, jurisdiction_state,
                date_of_service, initial_notice_date, certified_mail_tracking,
                created_at, closed_at
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17)",
            params![
                case.id.to_string(),
                case.docket_number,
                case.debtor_name,
                debt_type_trimmed,
                case.provider_name,
                case.collection_agency,
                case.original_account_number,
                case.collection_account_number,
                case.original_balance,
                case.disputed_balance,
                status_trimmed,
                case.jurisdiction_state,
                case.date_of_service,
                case.initial_notice_date,
                case.certified_mail_tracking,
                case.created_at.to_rfc3339(),
                case.closed_at.as_ref().map(|d| d.to_rfc3339()),
            ],
        )?;

        Ok(case.id)
    }

    /// Transactional case dossier ingestion: atomically writes case, creditors, and documents.
    /// If any insertion fails, the entire transaction rolls back to preserve database atomicity.
    pub fn insert_bundle(
        conn: &mut Connection,
        case: &Case,
        creditors: &[Creditor],
        documents: &[Document],
    ) -> AppResult<Uuid> {
        let tx = conn.transaction()?;

        let status_str = serde_json::to_string(&case.status)
            .map_err(|e| AppError::Validation(format!("Invalid status: {}", e)))?;
        let status_trimmed = status_str.trim_matches('"');

        let debt_type_str = serde_json::to_string(&case.debt_type)
            .map_err(|e| AppError::Validation(format!("Invalid debt type: {}", e)))?;
        let debt_type_trimmed = debt_type_str.trim_matches('"');

        tx.execute(
            "INSERT INTO cases (
                id, docket_number, debtor_name, debt_type, provider_name,
                collection_agency, original_account_number, collection_account_number,
                original_balance, disputed_balance, status, jurisdiction_state,
                date_of_service, initial_notice_date, certified_mail_tracking,
                created_at, closed_at
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17)",
            params![
                case.id.to_string(),
                case.docket_number,
                case.debtor_name,
                debt_type_trimmed,
                case.provider_name,
                case.collection_agency,
                case.original_account_number,
                case.collection_account_number,
                case.original_balance,
                case.disputed_balance,
                status_trimmed,
                case.jurisdiction_state,
                case.date_of_service,
                case.initial_notice_date,
                case.certified_mail_tracking,
                case.created_at.to_rfc3339(),
                case.closed_at.as_ref().map(|d| d.to_rfc3339()),
            ],
        )?;

        for c in creditors {
            let agency_type_str = match c.agency_type {
                AgencyType::OriginalProvider => "OriginalProvider",
                AgencyType::DebtBuyer => "DebtBuyer",
                AgencyType::ThirdPartyServicer => "ThirdPartyServicer",
                AgencyType::LawFirmCollection => "LawFirmCollection",
            };
            tx.execute(
                "INSERT INTO creditors (
                    id, case_id, entity_name, agency_type, corporate_address,
                    phone_number, registered_agent, state_license_id
                ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
                params![
                    c.id.to_string(),
                    c.case_id.to_string(),
                    c.entity_name,
                    agency_type_str,
                    c.corporate_address,
                    c.phone_number,
                    c.registered_agent,
                    c.state_license_id,
                ],
            )?;
        }

        for d in documents {
            let doc_type_str = serde_json::to_string(&d.document_type)
                .map_err(|e| AppError::Validation(format!("Invalid doc type: {}", e)))?;
            let doc_type_trimmed = doc_type_str.trim_matches('"');
            tx.execute(
                "INSERT INTO documents (
                    id, case_id, bates_identifier, title, document_type,
                    relative_file_path, sha256_hash, file_size_bytes, created_at
                ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
                params![
                    d.id.to_string(),
                    d.case_id.to_string(),
                    d.bates_identifier,
                    d.title,
                    doc_type_trimmed,
                    d.relative_file_path,
                    d.sha256_hash,
                    d.file_size_bytes,
                    d.created_at.to_rfc3339(),
                ],
            )?;
        }

        tx.commit()?;
        Ok(case.id)
    }

    pub fn get_all(conn: &Connection) -> AppResult<Vec<Case>> {
        let mut stmt = conn.prepare(
            "SELECT id, docket_number, debtor_name, debt_type, provider_name,
                    collection_agency, original_account_number, collection_account_number,
                    original_balance, disputed_balance, status, jurisdiction_state,
                    date_of_service, initial_notice_date, certified_mail_tracking,
                    created_at, closed_at
             FROM cases ORDER BY created_at DESC",
        )?;

        let rows = stmt.query_map([], |row| {
            let id_str: String = row.get(0)?;
            let docket_number: String = row.get(1)?;
            let debtor_name: String = row.get(2)?;
            let debt_type_str: String = row.get(3)?;
            let provider_name: String = row.get(4)?;
            let collection_agency: String = row.get(5)?;
            let original_account_number: String = row.get(6)?;
            let collection_account_number: String = row.get(7)?;
            let original_balance: f64 = row.get(8)?;
            let disputed_balance: f64 = row.get(9)?;
            let status_str: String = row.get(10)?;
            let jurisdiction_state: String = row.get(11)?;
            let date_of_service: Option<String> = row.get(12)?;
            let initial_notice_date: String = row.get(13)?;
            let certified_mail_tracking: Option<String> = row.get(14)?;
            let created_at_str: String = row.get(15)?;
            let closed_at_str: Option<String> = row.get(16)?;

            let id = Uuid::from_str(&id_str).unwrap_or_default();
            let debt_type: DebtType = serde_json::from_str(&format!("\"{}\"", debt_type_str))
                .unwrap_or(DebtType::Medical);
            let status: CaseStatus = serde_json::from_str(&format!("\"{}\"", status_str))
                .unwrap_or(CaseStatus::InitialNotice);
            let created_at = DateTime::parse_from_rfc3339(&created_at_str)
                .map(|dt| dt.with_timezone(&Utc))
                .unwrap_or_else(|_| Utc::now());
            let closed_at = closed_at_str.and_then(|s| {
                DateTime::parse_from_rfc3339(&s)
                    .map(|dt| dt.with_timezone(&Utc))
                    .ok()
            });

            Ok(Case {
                id,
                docket_number,
                debtor_name,
                debt_type,
                provider_name,
                collection_agency,
                original_account_number,
                collection_account_number,
                original_balance,
                disputed_balance,
                status,
                jurisdiction_state,
                date_of_service,
                initial_notice_date,
                certified_mail_tracking,
                created_at,
                closed_at,
            })
        })?;

        let mut cases = Vec::new();
        for r in rows {
            cases.push(r?);
        }
        Ok(cases)
    }

    pub fn get_by_id(conn: &Connection, case_id: &str) -> AppResult<Option<Case>> {
        let cases = Self::get_all(conn)?;
        Ok(cases
            .into_iter()
            .find(|c| c.id.to_string() == case_id || c.docket_number == case_id))
    }

    pub fn update_status(
        conn: &Connection,
        case_id: &str,
        new_status: &CaseStatus,
    ) -> AppResult<bool> {
        let existing_case = Self::get_by_id(conn, case_id)?
            .ok_or_else(|| AppError::NotFound(format!("Case {} not found", case_id)))?;

        // Enforce strict statutory state machine transitions (Section 5.3)
        if !existing_case.status.can_transition_to(new_status) {
            return Err(AppError::InvalidStateTransition {
                current: existing_case.status.as_str().to_string(),
                attempted: new_status.as_str().to_string(),
            });
        }

        let status_str = serde_json::to_string(new_status)
            .map_err(|e| AppError::Validation(format!("Invalid status: {}", e)))?;
        let status_trimmed = status_str.trim_matches('"');

        let is_terminal = matches!(
            new_status,
            CaseStatus::DebtSettled | CaseStatus::DebtDismissed
        );
        let closed_at_clause = if is_terminal && existing_case.closed_at.is_none() {
            Some(Utc::now().to_rfc3339())
        } else {
            None
        };

        let rows_affected = if let Some(ref closed_at) = closed_at_clause {
            conn.execute(
                "UPDATE cases SET status = ?1, closed_at = ?2 WHERE id = ?3 OR docket_number = ?3",
                params![status_trimmed, closed_at, case_id],
            )?
        } else {
            conn.execute(
                "UPDATE cases SET status = ?1 WHERE id = ?2 OR docket_number = ?2",
                params![status_trimmed, case_id],
            )?
        };

        if rows_affected == 0 {
            Err(AppError::NotFound(format!("Case {} not found", case_id)))
        } else {
            Ok(true)
        }
    }

    pub fn update_balances(
        conn: &Connection,
        case_id: &str,
        original_balance: f64,
        disputed_balance: f64,
    ) -> AppResult<bool> {
        let rows_affected = conn.execute(
            "UPDATE cases SET original_balance = ?1, disputed_balance = ?2 WHERE id = ?3 OR docket_number = ?3",
            params![original_balance, disputed_balance, case_id],
        )?;

        if rows_affected == 0 {
            Err(AppError::NotFound(format!("Case {} not found", case_id)))
        } else {
            Ok(true)
        }
    }

    pub fn delete(conn: &Connection, case_id: &str) -> AppResult<bool> {
        let rows_affected = conn.execute(
            "DELETE FROM cases WHERE id = ?1 OR docket_number = ?1",
            params![case_id],
        )?;
        Ok(rows_affected > 0)
    }
}

pub struct CreditorDao;

impl CreditorDao {
    pub fn insert(conn: &Connection, creditor: &Creditor) -> AppResult<Uuid> {
        let agency_type_str = serde_json::to_string(&creditor.agency_type)
            .map_err(|e| AppError::Validation(format!("Invalid agency type: {}", e)))?;
        let agency_type_trimmed = agency_type_str.trim_matches('"');

        conn.execute(
            "INSERT INTO creditors (
                id, case_id, entity_name, agency_type, corporate_address,
                phone_number, registered_agent, state_license_id
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
            params![
                creditor.id.to_string(),
                creditor.case_id.to_string(),
                creditor.entity_name,
                agency_type_trimmed,
                creditor.corporate_address,
                creditor.phone_number,
                creditor.registered_agent,
                creditor.state_license_id,
            ],
        )?;

        Ok(creditor.id)
    }

    pub fn get_by_case(conn: &Connection, case_id: &str) -> AppResult<Vec<Creditor>> {
        let mut stmt = conn.prepare(
            "SELECT id, case_id, entity_name, agency_type, corporate_address,
                    phone_number, registered_agent, state_license_id
             FROM creditors
             WHERE case_id = ?1",
        )?;

        let rows = stmt.query_map(params![case_id], |row| {
            let id_str: String = row.get(0)?;
            let case_id_str: String = row.get(1)?;
            let agency_str: String = row.get(3)?;
            let agency_type: AgencyType = serde_json::from_str(&format!("\"{}\"", agency_str))
                .unwrap_or(AgencyType::OriginalProvider);

            Ok(Creditor {
                id: Uuid::from_str(&id_str).unwrap_or_default(),
                case_id: Uuid::from_str(&case_id_str).unwrap_or_default(),
                entity_name: row.get(2)?,
                agency_type,
                corporate_address: row.get(4)?,
                phone_number: row.get(5)?,
                registered_agent: row.get(6)?,
                state_license_id: row.get(7)?,
            })
        })?;

        let mut creditors = Vec::new();
        for r in rows {
            creditors.push(r?);
        }
        Ok(creditors)
    }
}

pub struct InteractionDao;

impl InteractionDao {
    pub fn log(
        conn: &mut Connection,
        interaction: &Interaction,
        violations: &[Violation],
    ) -> AppResult<Uuid> {
        let tx = conn.transaction()?;

        let channel_str = match interaction.channel {
            Channel::Phone => "Phone",
            Channel::Mail => "Mail",
            Channel::Email => "Email",
            Channel::Sms => "Sms",
            Channel::InPerson => "InPerson",
        };

        let direction_str = match interaction.direction {
            Direction::Incoming => "Incoming",
            Direction::Outgoing => "Outgoing",
        };

        tx.execute(
            "INSERT INTO interactions (
                id, case_id, creditor_id, timestamp, channel, direction,
                contact_name, contact_phone, duration_seconds, summary_notes,
                audio_recording_path, recorded_flag
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)",
            params![
                interaction.id.to_string(),
                interaction.case_id.to_string(),
                interaction.creditor_id.map(|c| c.to_string()),
                interaction.timestamp.to_rfc3339(),
                channel_str,
                direction_str,
                interaction.contact_name,
                interaction.contact_phone,
                interaction.duration_seconds,
                interaction.summary_notes,
                interaction.audio_recording_path,
                if interaction.recorded_flag { 1 } else { 0 },
            ],
        )?;

        for v in violations {
            let v_type_str = serde_json::to_string(&v.violation_type)
                .map_err(|e| AppError::Validation(format!("Invalid violation type: {}", e)))?;
            let v_type_trimmed = v_type_str.trim_matches('"');

            let evidence_json =
                serde_json::to_string(&v.evidence_references).unwrap_or_else(|_| "[]".to_string());

            tx.execute(
                "INSERT INTO violations (
                    id, interaction_id, case_id, violation_type, statutory_citation,
                    statutory_penalty_cap, actual_damages, factual_summary, evidence_references
                ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
                params![
                    v.id.to_string(),
                    interaction.id.to_string(),
                    interaction.case_id.to_string(),
                    v_type_trimmed,
                    v.statutory_citation,
                    v.statutory_penalty_cap,
                    v.actual_damages,
                    v.factual_summary,
                    evidence_json,
                ],
            )?;
        }

        tx.commit()?;
        Ok(interaction.id)
    }

    pub fn get_by_case(conn: &Connection, case_id: &str) -> AppResult<Vec<Interaction>> {
        let mut stmt = conn.prepare(
            "SELECT id, case_id, creditor_id, timestamp, channel, direction,
                    contact_name, contact_phone, duration_seconds, summary_notes,
                    audio_recording_path, recorded_flag
             FROM interactions
             WHERE case_id = ?1
             ORDER BY timestamp ASC",
        )?;

        let rows = stmt.query_map(params![case_id], |row| {
            let id_str: String = row.get(0)?;
            let case_id_str: String = row.get(1)?;
            let creditor_id_str: Option<String> = row.get(2)?;
            let timestamp_str: String = row.get(3)?;
            let channel_str: String = row.get(4)?;
            let direction_str: String = row.get(5)?;
            let contact_name: String = row.get(6)?;
            let contact_phone: Option<String> = row.get(7)?;
            let duration_seconds: u32 = row.get(8)?;
            let summary_notes: String = row.get(9)?;
            let audio_recording_path: Option<String> = row.get(10)?;
            let recorded_flag: i32 = row.get(11)?;

            let id = Uuid::from_str(&id_str).unwrap_or_default();
            let case_id = Uuid::from_str(&case_id_str).unwrap_or_default();
            let creditor_id = creditor_id_str.and_then(|s| Uuid::from_str(&s).ok());
            let timestamp = DateTime::parse_from_rfc3339(&timestamp_str)
                .map(|dt| dt.with_timezone(&Utc))
                .unwrap_or_else(|_| Utc::now());

            let channel = match channel_str.as_str() {
                "Phone" => Channel::Phone,
                "Mail" => Channel::Mail,
                "Email" => Channel::Email,
                "Sms" => Channel::Sms,
                _ => Channel::InPerson,
            };

            let direction = match direction_str.as_str() {
                "Outgoing" => Direction::Outgoing,
                _ => Direction::Incoming,
            };

            Ok(Interaction {
                id,
                case_id,
                creditor_id,
                timestamp,
                channel,
                direction,
                contact_name,
                contact_phone,
                duration_seconds,
                summary_notes,
                audio_recording_path,
                recorded_flag: recorded_flag != 0,
            })
        })?;

        let mut interactions = Vec::new();
        for r in rows {
            interactions.push(r?);
        }
        Ok(interactions)
    }
}

pub struct ViolationDao;

impl ViolationDao {
    pub fn get_by_case(conn: &Connection, case_id: &str) -> AppResult<Vec<Violation>> {
        let mut stmt = conn.prepare(
            "SELECT id, interaction_id, case_id, violation_type, statutory_citation,
                    statutory_penalty_cap, actual_damages, factual_summary, evidence_references
             FROM violations
             WHERE case_id = ?1",
        )?;

        let rows = stmt.query_map(params![case_id], |row| {
            let id_str: String = row.get(0)?;
            let inter_id_str: String = row.get(1)?;
            let case_id_str: String = row.get(2)?;
            let v_type_str: String = row.get(3)?;
            let statutory_citation: String = row.get(4)?;
            let statutory_penalty_cap: f64 = row.get(5)?;
            let actual_damages: f64 = row.get(6)?;
            let factual_summary: String = row.get(7)?;
            let evidence_json: Option<String> = row.get(8)?;

            let id = Uuid::from_str(&id_str).unwrap_or_default();
            let interaction_id = Uuid::from_str(&inter_id_str).unwrap_or_default();
            let case_id = Uuid::from_str(&case_id_str).unwrap_or_default();

            let violation_type: FdcpaViolationType =
                serde_json::from_str(&format!("\"{}\"", v_type_str))
                    .unwrap_or(FdcpaViolationType::UnlawfulThreat);

            let evidence_references = evidence_json
                .and_then(|j| serde_json::from_str(&j).ok())
                .unwrap_or_default();

            Ok(Violation {
                id,
                interaction_id,
                case_id,
                violation_type,
                statutory_citation,
                statutory_penalty_cap,
                actual_damages,
                factual_summary,
                evidence_references,
            })
        })?;

        let mut violations = Vec::new();
        for r in rows {
            violations.push(r?);
        }
        Ok(violations)
    }

    pub fn get_total_damages_by_case(conn: &Connection, case_id: &str) -> AppResult<f64> {
        let mut stmt = conn.prepare(
            "SELECT coalesce(sum(statutory_penalty_cap + actual_damages), 0.0)
             FROM violations
             WHERE case_id = ?1",
        )?;
        let total: f64 = stmt.query_row(params![case_id], |row| row.get(0))?;
        Ok(total)
    }
}

pub struct DocumentDao;

impl DocumentDao {
    pub fn insert(conn: &Connection, doc: &Document) -> AppResult<Uuid> {
        let doc_type_str = serde_json::to_string(&doc.document_type)
            .map_err(|e| AppError::Validation(format!("Invalid document type: {}", e)))?;
        let doc_type_trimmed = doc_type_str.trim_matches('"');

        conn.execute(
            "INSERT INTO documents (
                id, case_id, bates_identifier, title, document_type,
                relative_file_path, sha256_hash, file_size_bytes, created_at
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
            params![
                doc.id.to_string(),
                doc.case_id.to_string(),
                doc.bates_identifier,
                doc.title,
                doc_type_trimmed,
                doc.relative_file_path,
                doc.sha256_hash,
                doc.file_size_bytes as i64,
                doc.created_at.to_rfc3339(),
            ],
        )?;

        Ok(doc.id)
    }

    pub fn get_by_case(conn: &Connection, case_id: &str) -> AppResult<Vec<Document>> {
        let mut stmt = conn.prepare(
            "SELECT id, case_id, bates_identifier, title, document_type,
                    relative_file_path, sha256_hash, file_size_bytes, created_at
             FROM documents
             WHERE case_id = ?1
             ORDER BY created_at ASC",
        )?;

        let rows = stmt.query_map(params![case_id], |row| {
            let id_str: String = row.get(0)?;
            let case_id_str: String = row.get(1)?;
            let bates_identifier: String = row.get(2)?;
            let title: String = row.get(3)?;
            let doc_type_str: String = row.get(4)?;
            let relative_file_path: String = row.get(5)?;
            let sha256_hash: String = row.get(6)?;
            let file_size_bytes: i64 = row.get(7)?;
            let created_at_str: String = row.get(8)?;

            let document_type: DocumentType =
                serde_json::from_str(&format!("\"{}\"", doc_type_str))
                    .unwrap_or(DocumentType::DebtValidationLetter);

            let created_at = DateTime::parse_from_rfc3339(&created_at_str)
                .map(|dt| dt.with_timezone(&Utc))
                .unwrap_or_else(|_| Utc::now());

            Ok(Document {
                id: Uuid::from_str(&id_str).unwrap_or_default(),
                case_id: Uuid::from_str(&case_id_str).unwrap_or_default(),
                bates_identifier,
                title,
                document_type,
                relative_file_path,
                sha256_hash,
                file_size_bytes: file_size_bytes as u64,
                created_at,
            })
        })?;

        let mut docs = Vec::new();
        for r in rows {
            docs.push(r?);
        }
        Ok(docs)
    }
}

pub struct CreditTradelineDao;

impl CreditTradelineDao {
    pub fn insert(conn: &Connection, tradeline: &CreditTradeLine) -> AppResult<Uuid> {
        let bureau_str = match tradeline.bureau {
            Bureau::Equifax => "Equifax",
            Bureau::Experian => "Experian",
            Bureau::TransUnion => "TransUnion",
        };

        let remark_str = serde_json::to_string(&tradeline.remark_status)
            .map_err(|e| AppError::Validation(format!("Invalid remark status: {}", e)))?;
        let remark_trimmed = remark_str.trim_matches('"');

        conn.execute(
            "INSERT INTO credit_tradelines (
                id, case_id, bureau, reporting_agency_name, account_number_masked,
                balance_reported, remark_status, is_marked_disputed, fcra_violation_flag,
                last_reported_date
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
            params![
                tradeline.id.to_string(),
                tradeline.case_id.to_string(),
                bureau_str,
                tradeline.reporting_agency_name,
                tradeline.account_number_masked,
                tradeline.balance_reported,
                remark_trimmed,
                if tradeline.is_marked_disputed { 1 } else { 0 },
                if tradeline.fcra_violation_flag { 1 } else { 0 },
                tradeline.last_reported_date,
            ],
        )?;

        Ok(tradeline.id)
    }

    pub fn get_by_case(conn: &Connection, case_id: &str) -> AppResult<Vec<CreditTradeLine>> {
        let mut stmt = conn.prepare(
            "SELECT id, case_id, bureau, reporting_agency_name, account_number_masked,
                    balance_reported, remark_status, is_marked_disputed, fcra_violation_flag,
                    last_reported_date
             FROM credit_tradelines
             WHERE case_id = ?1",
        )?;

        let rows = stmt.query_map(params![case_id], |row| {
            let id_str: String = row.get(0)?;
            let case_id_str: String = row.get(1)?;
            let bureau_str: String = row.get(2)?;
            let reporting_agency_name: String = row.get(3)?;
            let account_number_masked: String = row.get(4)?;
            let balance_reported: f64 = row.get(5)?;
            let remark_str: String = row.get(6)?;
            let is_marked_disputed: i32 = row.get(7)?;
            let fcra_violation_flag: i32 = row.get(8)?;
            let last_reported_date: String = row.get(9)?;

            let id = Uuid::from_str(&id_str).unwrap_or_default();
            let case_id = Uuid::from_str(&case_id_str).unwrap_or_default();

            let bureau = match bureau_str.as_str() {
                "Equifax" => Bureau::Equifax,
                "Experian" => Bureau::Experian,
                _ => Bureau::TransUnion,
            };

            let remark_status: DisputeRemarkStatus =
                serde_json::from_str(&format!("\"{}\"", remark_str))
                    .unwrap_or(DisputeRemarkStatus::NotReported);

            Ok(CreditTradeLine {
                id,
                case_id,
                bureau,
                reporting_agency_name,
                account_number_masked,
                balance_reported,
                remark_status,
                is_marked_disputed: is_marked_disputed != 0,
                fcra_violation_flag: fcra_violation_flag != 0,
                last_reported_date,
            })
        })?;

        let mut lines = Vec::new();
        for r in rows {
            lines.push(r?);
        }
        Ok(lines)
    }
}

pub struct DeadlineDao;

impl DeadlineDao {
    pub fn insert(conn: &Connection, deadline: &Deadline) -> AppResult<Uuid> {
        let d_type_str = serde_json::to_string(&deadline.deadline_type)
            .map_err(|e| AppError::Validation(format!("Invalid deadline type: {}", e)))?;
        let d_type_trimmed = d_type_str.trim_matches('"');

        let reminders_json = serde_json::to_string(&deadline.reminder_days_prior)
            .unwrap_or_else(|_| "[7,3,1]".to_string());

        conn.execute(
            "INSERT INTO deadlines (
                id, case_id, deadline_type, title, target_date, completed,
                reminder_days_prior, notes
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
            params![
                deadline.id.to_string(),
                deadline.case_id.to_string(),
                d_type_trimmed,
                deadline.title,
                deadline.target_date.to_rfc3339(),
                if deadline.completed { 1 } else { 0 },
                reminders_json,
                deadline.notes,
            ],
        )?;

        Ok(deadline.id)
    }

    pub fn get_by_case(conn: &Connection, case_id: &str) -> AppResult<Vec<Deadline>> {
        let mut stmt = conn.prepare(
            "SELECT id, case_id, deadline_type, title, target_date, completed,
                    reminder_days_prior, notes
             FROM deadlines
             WHERE case_id = ?1
             ORDER BY target_date ASC",
        )?;

        let rows = stmt.query_map(params![case_id], |row| {
            let id_str: String = row.get(0)?;
            let case_id_str: String = row.get(1)?;
            let d_type_str: String = row.get(2)?;
            let title: String = row.get(3)?;
            let target_date_str: String = row.get(4)?;
            let completed: i32 = row.get(5)?;
            let reminders_json: String = row.get(6)?;
            let notes: Option<String> = row.get(7)?;

            let id = Uuid::from_str(&id_str).unwrap_or_default();
            let case_id = Uuid::from_str(&case_id_str).unwrap_or_default();
            let deadline_type: DeadlineType = serde_json::from_str(&format!("\"{}\"", d_type_str))
                .unwrap_or(DeadlineType::CustomTask);
            let target_date = DateTime::parse_from_rfc3339(&target_date_str)
                .map(|dt| dt.with_timezone(&Utc))
                .unwrap_or_else(|_| Utc::now());
            let reminder_days_prior = serde_json::from_str(&reminders_json).unwrap_or_default();

            Ok(Deadline {
                id,
                case_id,
                deadline_type,
                title,
                target_date,
                completed: completed != 0,
                reminder_days_prior,
                notes: notes.unwrap_or_default(),
            })
        })?;

        let mut list = Vec::new();
        for r in rows {
            list.push(r?);
        }
        Ok(list)
    }

    pub fn toggle_completed(conn: &Connection, deadline_id: &str) -> AppResult<bool> {
        let rows_affected = conn.execute(
            "UPDATE deadlines SET completed = CASE WHEN completed = 1 THEN 0 ELSE 1 END WHERE id = ?1",
            params![deadline_id],
        )?;
        Ok(rows_affected > 0)
    }
}
