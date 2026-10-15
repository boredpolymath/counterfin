use tauri::{
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
    AppHandle, Emitter, Manager,
};

/// Initialize System Tray background daemon (Section 4.6)
pub fn setup_system_tray(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let show_i = MenuItem::with_id(app, "show", "Open Dispute Console", true, None::<&str>)?;
    let quick_log_i = MenuItem::with_id(app, "quick_log", "Quick-Log Collector Call", true, None::<&str>)?;
    let silence_i = MenuItem::with_id(app, "silence_24h", "Silence Reminders (24h)", true, None::<&str>)?;
    let quit_i = MenuItem::with_id(app, "quit", "Exit SettleMint", true, None::<&str>)?;

    let menu = Menu::with_items(app, &[&show_i, &quick_log_i, &silence_i, &quit_i])?;

    let _tray = TrayIconBuilder::new()
        .menu(&menu)
        .show_menu_on_left_click(true)
        .on_menu_event(|app, event| match event.id.as_ref() {
            "show" => {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
            "quick_log" => {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                    let _ = window.emit("open-quick-log", ());
                }
            }
            "silence_24h" => {
                let _ = app.emit("toggle-silence-24h", ());
            }
            "quit" => {
                app.exit(0);
            }
            _ => {}
        })
        .build(app)?;

    Ok(())
}
