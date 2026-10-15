/// Database schema definition matching Section 6.1 Relational Schema Entities
/// Configured for Write-Ahead Logging (WAL) and foreign key integrity.
pub const CREATE_TABLES_SQL: &str = r#"
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
PRAGMA busy_timeout = 5000;

-- 1. Cases Table
CREATE TABLE IF NOT EXISTS cases (
    id TEXT PRIMARY KEY,
    docket_number TEXT NOT NULL UNIQUE,
    debtor_name TEXT NOT NULL,
    debt_type TEXT NOT NULL DEFAULT 'Medical',
    provider_name TEXT NOT NULL,
    collection_agency TEXT NOT NULL,
    original_account_number TEXT NOT NULL,
    collection_account_number TEXT NOT NULL,
    original_balance REAL NOT NULL,
    disputed_balance REAL NOT NULL,
    status TEXT NOT NULL,
    jurisdiction_state TEXT NOT NULL,
    date_of_service TEXT,
    initial_notice_date TEXT NOT NULL,
    certified_mail_tracking TEXT,
    created_at TEXT NOT NULL,
    closed_at TEXT
);

-- 2. Creditors Table
CREATE TABLE IF NOT EXISTS creditors (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL,
    entity_name TEXT NOT NULL,
    agency_type TEXT NOT NULL,
    corporate_address TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    registered_agent TEXT,
    state_license_id TEXT,
    FOREIGN KEY(case_id) REFERENCES cases(id) ON DELETE CASCADE
);

-- 3. Interactions Table
CREATE TABLE IF NOT EXISTS interactions (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL,
    creditor_id TEXT,
    timestamp TEXT NOT NULL,
    channel TEXT NOT NULL,
    direction TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    contact_phone TEXT,
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    summary_notes TEXT NOT NULL,
    audio_recording_path TEXT,
    recorded_flag INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY(case_id) REFERENCES cases(id) ON DELETE CASCADE,
    FOREIGN KEY(creditor_id) REFERENCES creditors(id) ON DELETE SET NULL
);

-- 4. Violations Table
CREATE TABLE IF NOT EXISTS violations (
    id TEXT PRIMARY KEY,
    interaction_id TEXT NOT NULL,
    case_id TEXT NOT NULL,
    violation_type TEXT NOT NULL,
    statutory_citation TEXT NOT NULL,
    statutory_penalty_cap REAL NOT NULL DEFAULT 1000.0,
    actual_damages REAL NOT NULL DEFAULT 0.0,
    factual_summary TEXT NOT NULL,
    evidence_references TEXT,
    FOREIGN KEY(interaction_id) REFERENCES interactions(id) ON DELETE CASCADE,
    FOREIGN KEY(case_id) REFERENCES cases(id) ON DELETE CASCADE
);

-- 5. Documents Table
CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL,
    bates_identifier TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    document_type TEXT NOT NULL,
    relative_file_path TEXT NOT NULL,
    sha256_hash TEXT NOT NULL,
    file_size_bytes INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(case_id) REFERENCES cases(id) ON DELETE CASCADE
);

-- 6. Deadlines Table
CREATE TABLE IF NOT EXISTS deadlines (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL,
    deadline_type TEXT NOT NULL,
    title TEXT NOT NULL,
    target_date TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0,
    reminder_days_prior TEXT NOT NULL DEFAULT '[7,3,1]',
    notes TEXT,
    FOREIGN KEY(case_id) REFERENCES cases(id) ON DELETE CASCADE
);

-- 7. Credit Trade Lines Table
CREATE TABLE IF NOT EXISTS credit_tradelines (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL,
    bureau TEXT NOT NULL,
    reporting_agency_name TEXT NOT NULL,
    account_number_masked TEXT NOT NULL,
    balance_reported REAL NOT NULL,
    remark_status TEXT NOT NULL,
    is_marked_disputed INTEGER NOT NULL DEFAULT 0,
    fcra_violation_flag INTEGER NOT NULL DEFAULT 0,
    last_reported_date TEXT NOT NULL,
    FOREIGN KEY(case_id) REFERENCES cases(id) ON DELETE CASCADE
);

-- Indices for rapid query performance (< 50ms)
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_debt_type ON cases(debt_type);
CREATE INDEX IF NOT EXISTS idx_interactions_case ON interactions(case_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_violations_case ON violations(case_id);
CREATE INDEX IF NOT EXISTS idx_deadlines_target ON deadlines(target_date, completed);
"#;
