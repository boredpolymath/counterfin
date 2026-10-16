pub mod commands;
pub mod crypto;
pub mod db;
pub mod engine;
pub mod error;
pub mod events;
pub mod models;
pub mod tray;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            // Initialize SQLite Database Manager with WAL mode
            let app_data_dir = app
                .path()
                .app_data_dir()
                .unwrap_or_else(|_| std::path::PathBuf::from("."));
            let _ = std::fs::create_dir_all(&app_data_dir);
            let db_path = if app_data_dir.join("settlemint.db").exists()
                && !app_data_dir.join("counterfin.db").exists()
            {
                app_data_dir.join("settlemint.db")
            } else {
                app_data_dir.join("counterfin.db")
            };
            let db_manager = db::DatabaseManager::init(&db_path).unwrap_or_else(|_| {
                log::warn!("Falling back to in-memory SQLite database");
                db::DatabaseManager::init_in_memory()
                    .expect("Failed to initialize in-memory database")
            });
            app.manage(db_manager);

            // Initialize System Tray daemon
            if let Err(err) = tray::setup_system_tray(app.handle()) {
                log::warn!(
                    "System tray initialization deferred or unavailable: {}",
                    err
                );
            }

            // Initialize Background Monitor for statutory deadlines & USPS tracking (Section 6.3)
            let monitor = engine::BackgroundMonitor::new();
            monitor.start_scheduler(app.handle().clone());
            app.manage(monitor);

            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                // Intercept close event: hide window to system tray rather than terminate daemon
                let _ = window.hide();
                api.prevent_close();
            }
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_cases,
            commands::get_case_by_id,
            commands::create_case,
            commands::update_case_status,
            commands::delete_case,
            commands::clear_all_cases,
            commands::get_interactions,
            commands::get_violations,
            commands::detect_interaction_violations,
            commands::get_case_statutory_damages,
            commands::log_interaction,
            commands::generate_dispute_document,
            commands::validate_template_tokens,
            commands::export_document_file,
            commands::calculate_fdcpa_deadline,
            commands::calculate_fdcpa_validation_window,
            commands::get_deadlines,
            commands::create_deadline,
            commands::check_deadlines_now,
            commands::query_certified_mail_status,
            commands::poll_certified_mail_cases,
            commands::get_state_sol_rule,
            commands::get_all_state_sol_rules,
            commands::check_debt_time_barred,
            commands::calculate_sol_clock,
            commands::get_state_licensing_rule,
            commands::get_all_state_licensing_rules,
            commands::hash_evidence_payload,
            commands::verify_evidence_integrity,
            commands::validate_sandbox_path,
            commands::validate_evidence_upload,
            commands::get_credit_tradelines,
            commands::create_credit_tradeline,
            commands::emit_system_event,
            commands::is_master_passphrase_enrolled,
            commands::enroll_master_passphrase,
            commands::verify_master_passphrase,
            commands::export_encrypted_backup,
            commands::restore_encrypted_backup,
            commands::import_statutory_patch,
            commands::get_active_statutory_patches,
            commands::rollback_statutory_patch,
            commands::rollback_all_statutory_patches,
            commands::get_official_statutory_authority_key,
        ])
        .run(tauri::generate_context!())
        .expect("error while building CounterFin application");
}
