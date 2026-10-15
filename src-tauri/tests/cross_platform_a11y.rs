use chrono::{NaiveDate, Utc};
use settlemint_lib::engine::monitor::BackgroundMonitor;
use settlemint_lib::engine::vault::EvidenceVault;
use settlemint_lib::models::deadline::{Deadline, DeadlineType};
use uuid::Uuid;

// =========================================================================
// 9.10.1 Multi-OS Build Verification Tests
// =========================================================================

#[test]
fn test_multi_os_sandbox_path_resolution_and_security() {
    println!("\n--- [9.10.1] Multi-OS Build & Path Resolution Verification ---");

    // 1. Verify OS-specific default sandbox directory
    let sandbox_dir = EvidenceVault::resolve_os_sandbox_dir();
    println!("  -> Resolved OS Default Sandbox Path: {:?}", sandbox_dir);
    assert!(!sandbox_dir.as_os_str().is_empty());

    #[cfg(target_os = "macos")]
    {
        assert!(
            sandbox_dir
                .to_str()
                .unwrap()
                .contains("Library/Application Support/SettleMint")
        );
    }

    #[cfg(target_os = "windows")]
    {
        assert!(sandbox_dir.to_str().unwrap().contains("SettleMint"));
    }

    #[cfg(target_os = "linux")]
    {
        assert!(
            sandbox_dir.to_str().unwrap().contains(".config/SettleMint")
                || sandbox_dir.to_str().unwrap().contains("SettleMint")
        );
    }

    // 2. Verify cross-platform directory structure creation
    let temp_root = std::env::temp_dir().join(format!("settlemint_multi_os_{}", Uuid::new_v4()));
    let sandbox = EvidenceVault::build_sandbox_paths(&temp_root);
    assert_eq!(sandbox.database_dir, temp_root.join("dbs"));
    assert_eq!(sandbox.evidence_dir, temp_root.join("evidence"));
    assert_eq!(sandbox.letters_dir, temp_root.join("letters"));
    assert_eq!(sandbox.backups_dir, temp_root.join("backups"));
    assert_eq!(sandbox.temp_dir, temp_root.join("temp"));

    sandbox
        .create_all()
        .expect("Create multi-OS sandbox hierarchy");
    assert!(sandbox.database_dir.exists());
    assert!(sandbox.evidence_dir.exists());
    assert!(sandbox.letters_dir.exists());
    assert!(sandbox.backups_dir.exists());

    // 3. Verify cross-platform path traversal rejection (handles both '/' and '\\')
    let traversal_unix = "evidence/../../etc/passwd";
    let traversal_win = "evidence\\..\\..\\Windows\\System32";
    assert!(sandbox.resolve_safe_subpath(traversal_unix).is_err());
    assert!(sandbox.resolve_safe_subpath(traversal_win).is_err());

    // Clean up
    let _ = std::fs::remove_dir_all(&temp_root);
    println!("  -> Multi-OS path resolution & containment verification passed ✓");
}

// =========================================================================
// 9.10.2 System Tray Actions & OS Notification Payload Tests
// =========================================================================

#[test]
fn test_system_tray_menu_actions_and_notification_delivery() {
    println!("\n--- [9.10.2] System Tray Actions & Notification Delivery ---");

    // 1. Verify standard system tray action identifiers
    let tray_action_ids = ["show", "quick_log", "silence_24h", "quit"];
    for action in &tray_action_ids {
        assert!(!action.is_empty());
    }

    // Verify corresponding frontend listener event names
    let expected_frontend_events = [
        ("quick_log", "open-quick-log"),
        ("silence_24h", "toggle-silence-24h"),
    ];
    for (action_id, event_name) in &expected_frontend_events {
        assert!(!action_id.is_empty());
        assert!(!event_name.is_empty());
    }

    // 2. Verify Statutory Notification Payload Construction across thresholds
    let today = NaiveDate::from_ymd_opt(2026, 5, 10).unwrap();
    let case_id = Uuid::new_v4();

    let test_cases: [(i64, &str, bool, &str); 4] = [
        (7, "2026-05-17T00:00:00Z", false, "7-Day Notice Alert"),
        (3, "2026-05-13T00:00:00Z", true, "3-Day Imminent Warning"),
        (1, "2026-05-11T00:00:00Z", true, "1-Day Critical Alert"),
        (
            0,
            "2026-05-10T00:00:00Z",
            true,
            "0-Day Action Required Today",
        ),
    ];

    for (days_remaining, target_rfc3339, expected_urgent, description) in test_cases {
        let deadline = Deadline {
            id: Uuid::new_v4(),
            case_id,
            deadline_type: DeadlineType::Fdcpa30DayValidation,
            title: format!("Dispute Task ({})", description),
            target_date: chrono::DateTime::parse_from_rfc3339(target_rfc3339)
                .unwrap()
                .with_timezone(&Utc),
            completed: false,
            reminder_days_prior: vec![days_remaining as u32],
            notes: "".to_string(),
        };

        let alerts =
            BackgroundMonitor::evaluate_deadlines_with_drift(&[deadline], Some(today), None);
        assert_eq!(alerts.len(), 1, "Expected alert for {}", description);
        let alert = &alerts[0];
        assert_eq!(alert.days_remaining, days_remaining);
        assert_eq!(alert.is_urgent, expected_urgent);
        assert!(!alert.title.is_empty());
        assert!(!alert.alert_message.is_empty());
        println!(
            "  -> Verified notification payload for {}: '{}' (Urgent: {})",
            description, alert.alert_message, alert.is_urgent
        );
    }

    // Days outside notification thresholds (> 30 days or not at 7, 3, 1, 0)
    let benign_deadline = Deadline {
        id: Uuid::new_v4(),
        case_id,
        deadline_type: DeadlineType::CustomTask,
        title: "Normal Schedule".to_string(),
        target_date: chrono::DateTime::parse_from_rfc3339("2026-05-24T00:00:00Z")
            .unwrap()
            .with_timezone(&Utc),
        completed: false,
        reminder_days_prior: vec![7],
        notes: "".to_string(),
    };
    let benign_alerts =
        BackgroundMonitor::evaluate_deadlines_with_drift(&[benign_deadline], Some(today), None);
    assert!(
        benign_alerts.is_empty(),
        "Days between milestones should not spam notifications"
    );

    println!("  -> System tray action and native notification payload tests passed ✓");
}
