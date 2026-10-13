pub mod commands;
pub mod db;
pub mod engine;
pub mod models;
pub mod tray;

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

            // Initialize System Tray daemon
            if let Err(err) = tray::setup_system_tray(app.handle()) {
                log::warn!("System tray initialization deferred or unavailable: {}", err);
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_cases,
            commands::create_case,
            commands::update_case_status,
            commands::get_interactions,
            commands::log_interaction,
            commands::generate_dispute_document,
            commands::calculate_fdcpa_deadline,
            commands::hash_evidence_payload,
            commands::get_credit_tradelines,
        ])
        .run(tauri::generate_context!())
        .expect("error while building SettleMint application");
}
