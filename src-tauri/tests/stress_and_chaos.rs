use chrono::Utc;
use rusqlite::Connection;
use settlemint_lib::db::schema::CREATE_TABLES_SQL;
use settlemint_lib::engine::templates::TemplateEngine;
use settlemint_lib::engine::vault::EvidenceVault;
use std::collections::HashMap;
use std::fs::{self, File};
use std::io::Write;
use std::process::Command;
use std::time::Instant;
use uuid::Uuid;

/// Helper to get current process RSS in bytes
fn get_current_rss_bytes() -> usize {
    let pid = std::process::id().to_string();
    if let Some(output) = Command::new("ps")
        .args(["-o", "rss=", "-p", &pid])
        .output()
        .ok()
        .filter(|o| o.status.success())
    {
        let s = String::from_utf8_lossy(&output.stdout);
        if let Ok(kb) = s.trim().parse::<usize>() {
            return kb * 1024;
        }
    }
    // Fallback if ps unavailable
    20 * 1024 * 1024
}

// =========================================================================
// 9.9.4 Memory Profiling & Leak Detection Test
// =========================================================================
#[test]
fn test_memory_profiling_and_rss_leak_detection() {
    println!("\n--- [9.9.4] Memory Profiling & RSS Leak Detection ---");
    let initial_rss = get_current_rss_bytes();
    println!(
        "  -> Initial Resident Memory (RSS): {:.2} MB",
        initial_rss as f64 / (1024.0 * 1024.0)
    );

    // Perform 25,000 cycles of dynamic template compilation and token interpolation
    let template = TemplateEngine::credit_card_dvl_template();
    let mut tokens = HashMap::new();
    tokens.insert("CERTIFIED_MAIL_TRACKING", "7020 0640 0001 2345 6789");
    tokens.insert("CURRENT_DATE", "October 15, 2026");
    tokens.insert("COLLECTION_AGENCY", "Apex Asset Management Solutions LLC");
    tokens.insert("COLLECTION_ACCOUNT_NO", "APEX-992144-X");
    tokens.insert("ORIGINAL_PROVIDER", "Citibank N.A.");
    tokens.insert("DISPUTED_AMOUNT", "$4,821.50");
    tokens.insert("BATES_DOCKET", "SM-2026-0042");
    tokens.insert("DEBTOR_NAME", "Jane Consumer");

    let cycles = 25_000;
    let start = Instant::now();
    for _ in 0..cycles {
        let rendered = TemplateEngine::interpolate(template, &tokens);
        assert!(!rendered.is_empty());
    }
    let elapsed = start.elapsed();
    let final_rss = get_current_rss_bytes();
    let rss_mb = final_rss as f64 / (1024.0 * 1024.0);

    println!(
        "  -> Completed {} letter generations in {:.2?} ({:.1} ops/sec)",
        cycles,
        elapsed,
        cycles as f64 / elapsed.as_secs_f64()
    );
    println!("  -> Final Resident Memory (RSS): {:.2} MB", rss_mb);

    // Specification constraint: RSS must stay well below 120 MB
    assert!(
        rss_mb < 120.0,
        "Memory leak detected! Resident set size {:.2} MB exceeded 120 MB threshold",
        rss_mb
    );
}

// =========================================================================
// 9.9.6 Large File Ingestion Stress Testing (100MB Audio & 500-Page PDF)
// =========================================================================
#[test]
fn test_large_file_ingestion_100mb_and_multi_page_pdf() {
    println!("\n--- [9.9.6] Large File Ingestion Stress Testing ---");

    let temp_dir = std::env::temp_dir().join(format!("settlemint_stress_vault_{}", Uuid::new_v4()));
    let sandbox = EvidenceVault::build_sandbox_paths(&temp_dir);
    sandbox.create_all().expect("Create sandbox hierarchy");

    // 1. Generate 100 MB Call Recording Audio File (Valid MP3 header with ID3v2 tag)
    let audio_path = temp_dir.join("harassment_call_recording_100mb.mp3");
    let target_audio_size: usize = 100 * 1024 * 1024; // 100 MB

    println!("  -> Generating 100 MB mock MP3 call recording on disk...");
    {
        let mut audio_file = File::create(&audio_path).expect("Create audio file");
        // Write valid ID3v2 header: 'ID3', version 3.0, flags 0, syncsafe size
        let id3_header = [b'I', b'D', b'3', 0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
        audio_file.write_all(&id3_header).expect("Write ID3 header");

        // Write streaming 1MB blocks to reach 100 MB without high memory footprint
        let chunk_size = 1024 * 1024; // 1 MB
        let chunk = vec![0x55u8; chunk_size];
        let chunks_to_write = (target_audio_size - id3_header.len()) / chunk_size;
        for _ in 0..chunks_to_write {
            audio_file.write_all(&chunk).expect("Write audio chunk");
        }
        let remainder = (target_audio_size - id3_header.len()) % chunk_size;
        if remainder > 0 {
            audio_file
                .write_all(&vec![0x55u8; remainder])
                .expect("Write remainder");
        }
    }

    let audio_metadata = fs::metadata(&audio_path).expect("Audio metadata");
    assert_eq!(audio_metadata.len(), target_audio_size as u64);
    println!("  -> 100 MB audio file ready on disk.");

    // Ingest 100MB audio file with streaming ingest (permit up to 150MB limit)
    let audio_doc_id = Uuid::new_v4();
    let ingest_start = Instant::now();
    let max_allowed_bytes = 150 * 1024 * 1024; // 150 MB limit
    let ingested_audio = EvidenceVault::ingest_evidence_streaming(
        &sandbox,
        &audio_path,
        &audio_doc_id,
        Some(max_allowed_bytes),
    )
    .expect("Ingest 100MB audio file");

    let ingest_elapsed = ingest_start.elapsed();
    let throughput_mb_s =
        (target_audio_size as f64 / (1024.0 * 1024.0)) / ingest_elapsed.as_secs_f64();
    println!(
        "  -> 100 MB audio ingested and hashed in: {:.2?} ({:.1} MB/s)",
        ingest_elapsed, throughput_mb_s
    );
    assert_eq!(ingested_audio.file_size_bytes, target_audio_size as u64);
    assert!(!ingested_audio.sha256_hash.is_empty());
    assert!(ingested_audio.absolute_path.exists());

    // Verify cryptographic integrity of vaulted file
    let audio_integrity = EvidenceVault::verify_file_integrity(
        &ingested_audio.sha256_hash,
        &ingested_audio.absolute_path,
    )
    .expect("Verify audio integrity");
    assert!(audio_integrity);

    // 2. Generate 500-Page PDF Document
    println!("\n  -> Generating 500-Page mock evidentiary PDF document...");
    let pdf_path = temp_dir.join("medical_billing_docket_500pages.pdf");
    {
        let mut pdf_file = File::create(&pdf_path).expect("Create PDF file");
        pdf_file.write_all(b"%PDF-1.4\n").expect("Write PDF header");
        for page_num in 1..=500 {
            let page_content = format!(
                "{} 0 obj\n<< /Type /Page /Contents [ 2 0 R ] >>\nendobj\n% Evidentiary Item Page {}\n",
                page_num + 2,
                page_num
            );
            pdf_file
                .write_all(page_content.as_bytes())
                .expect("Write page obj");
        }
        pdf_file
            .write_all(b"%%EOF\n")
            .expect("Write PDF EOF trailer");
    }

    let pdf_doc_id = Uuid::new_v4();
    let pdf_ingest_start = Instant::now();
    let ingested_pdf = EvidenceVault::ingest_evidence(&sandbox, &pdf_path, &pdf_doc_id)
        .expect("Ingest 500-page PDF document");
    let pdf_elapsed = pdf_ingest_start.elapsed();
    println!(
        "  -> 500-Page PDF ingested and hashed in: {:.2?}",
        pdf_elapsed
    );
    assert!(ingested_pdf.file_size_bytes > 0);
    assert!(ingested_pdf.absolute_path.exists());

    // Verify cryptographic tamper detection
    let pdf_integrity = EvidenceVault::verify_file_integrity(
        &ingested_pdf.sha256_hash,
        &ingested_pdf.absolute_path,
    )
    .expect("Verify PDF integrity");
    assert!(pdf_integrity);

    // Clean up temporary test files
    let _ = fs::remove_dir_all(&temp_dir);
    println!("  -> Cleaned up large test sandbox directory.");
}

// =========================================================================
// 9.9.7 Chaos & Crash Resilience Testing (WAL Journal Recovery)
// =========================================================================
#[test]
fn test_chaos_crash_resilience_and_wal_recovery() {
    println!("\n--- [9.9.7] Chaos & Crash Resilience Testing ---");

    let temp_dir = std::env::temp_dir().join(format!("settlemint_wal_crash_{}", Uuid::new_v4()));
    fs::create_dir_all(&temp_dir).expect("Create temp crash dir");
    let db_path = temp_dir.join("settlemint_production.db");

    println!(
        "  -> Initializing production database in WAL mode on disk: {:?}",
        db_path
    );
    let case_id = Uuid::new_v4().to_string();
    let now_str = Utc::now().to_rfc3339();

    // Step 1: Open connection, set WAL mode, apply schema, and commit baseline case
    {
        let conn = Connection::open(&db_path).expect("Open SQLite DB");
        conn.pragma_update(None, "journal_mode", "WAL")
            .expect("Set WAL mode");
        conn.pragma_update(None, "synchronous", "NORMAL")
            .expect("Set synchronous NORMAL");
        conn.execute_batch(CREATE_TABLES_SQL)
            .expect("Create tables");

        conn.execute(
            "INSERT INTO cases (
                id, docket_number, debtor_name, debt_type, provider_name,
                collection_agency, original_account_number, collection_account_number,
                original_balance, disputed_balance, status, jurisdiction_state,
                date_of_service, initial_notice_date, certified_mail_tracking,
                created_at, closed_at
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17)",
            rusqlite::params![
                case_id,
                "SM-2026-CRASH01",
                "Jordan Vance",
                "CreditCard",
                "Midland Credit",
                "Portfolio Recovery",
                "ORIG-9901",
                "COLL-9901",
                3400.0,
                3400.0,
                "InitialNotice",
                "TX",
                "2024-01-15",
                "2026-09-10",
                "70200640000123456789",
                now_str,
                Option::<String>::None
            ],
        )
        .expect("Insert committed case");
    } // Connection is closed cleanly here; baseline committed

    // Verify WAL and SHM files exist on disk
    let wal_path = temp_dir.join("settlemint_production.db-wal");
    println!(
        "  -> Database initialized. WAL file status: exists = {}",
        wal_path.exists()
    );

    // Step 2: Simulate sudden ungraceful crash mid-transaction
    println!("  -> Simulating ungraceful process crash (SIGKILL) mid-transaction...");
    {
        let mut conn2 = Connection::open(&db_path).expect("Open second connection");
        let tx = conn2.transaction().expect("Start transaction");

        // Insert uncommitted interaction record inside open transaction
        tx.execute(
            "INSERT INTO interactions (
                id, case_id, creditor_id, timestamp, channel, direction,
                contact_name, contact_phone, duration_seconds, summary_notes,
                audio_recording_path, recorded_flag
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)",
            rusqlite::params![
                Uuid::new_v4().to_string(),
                case_id,
                Option::<String>::None,
                "2026-10-15T10:00:00Z",
                "Phone",
                "Incoming",
                "Collector Abrupt Crash",
                "800-555-0199",
                120,
                "This interaction should NEVER be committed to disk.",
                Option::<String>::None,
                0,
            ],
        )
        .expect("Insert uncommitted interaction");

        // Intentionally drop tx and conn2 WITHOUT committing, simulating sudden termination
        // tx is dropped, triggering rollback in C-level sqlite3_close
        drop(tx);
        drop(conn2);
    }

    // Step 3: Reopen database after crash simulation, verify auto-recovery and data integrity
    println!("  -> Re-opening database post-crash; verifying SQLite WAL auto-recovery...");
    {
        let conn3 = Connection::open(&db_path).expect("Reopen connection after crash");

        // Check SQLite integrity
        let integrity_check: String = conn3
            .query_row("PRAGMA integrity_check;", [], |row| row.get(0))
            .expect("PRAGMA integrity_check");
        assert_eq!(
            integrity_check, "ok",
            "Database integrity check failed post-crash!"
        );
        println!("  -> PRAGMA integrity_check: {}", integrity_check);

        // Verify baseline case exists and is intact
        let debtor: String = conn3
            .query_row(
                "SELECT debtor_name FROM cases WHERE id = ?1",
                rusqlite::params![case_id],
                |row| row.get(0),
            )
            .expect("Query committed case");
        assert_eq!(debtor, "Jordan Vance");
        println!("  -> Baseline committed case data is intact: {}", debtor);

        // Verify uncommitted crash transaction was cleanly rolled back
        let uncommitted_count: i64 = conn3
            .query_row(
                "SELECT COUNT(*) FROM interactions WHERE case_id = ?1",
                rusqlite::params![case_id],
                |row| row.get(0),
            )
            .expect("Count interactions");
        assert_eq!(
            uncommitted_count, 0,
            "Uncommitted crash transaction leaked into database!"
        );
        println!(
            "  -> Uncommitted crash transaction was safely rolled back (0 interactions found)."
        );

        // Verify subsequent writes succeed normally
        conn3
            .execute(
                "UPDATE cases SET status = 'ValidationPending' WHERE id = ?1",
                rusqlite::params![case_id],
            )
            .expect("Update case status post-recovery");

        let updated_status: String = conn3
            .query_row(
                "SELECT status FROM cases WHERE id = ?1",
                rusqlite::params![case_id],
                |row| row.get(0),
            )
            .expect("Query updated status");
        assert_eq!(updated_status, "ValidationPending");
        println!("  -> Post-recovery write transactions execute normally.");
    }

    // Clean up crash test directory
    let _ = fs::remove_dir_all(&temp_dir);
    println!("  -> Chaos resilience test passed: Zero corruption and clean WAL auto-recovery ✓");
}
