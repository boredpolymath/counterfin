use crate::error::{AppError, AppResult};
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter, Runtime};

/// Strongly typed event schemas for CounterFin Event Emission Bus (Section 2.1.2)
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "event_type", content = "data")]
pub enum SystemEvent {
    #[serde(rename = "deadline_approaching")]
    DeadlineApproaching {
        case_id: String,
        docket_number: String,
        target_date: String,
        days_remaining: i64,
        title: String,
    },

    #[serde(rename = "violation_detected")]
    ViolationDetected {
        case_id: String,
        violation_type: String,
        statutory_citation: String,
        penalty_cap: f64,
        summary: String,
    },

    #[serde(rename = "case_status_changed")]
    CaseStatusChanged {
        case_id: String,
        old_status: String,
        new_status: String,
    },

    #[serde(rename = "tray_quick_log_triggered")]
    TrayQuickLogTriggered,

    #[serde(rename = "document_generated")]
    DocumentGenerated {
        case_id: String,
        bates_identifier: String,
        document_type: String,
    },
}

/// Central Event Emission Bus dispatcher
pub struct EventBus;

impl EventBus {
    pub const CHANNEL: &'static str = "counterfin://event";

    /// Emit typed system event across the Tauri v2 Emitter bus
    pub fn emit<R: Runtime>(app: &AppHandle<R>, event: SystemEvent) -> AppResult<()> {
        app.emit(Self::CHANNEL, event)
            .map_err(|e| AppError::Internal(format!("Failed to emit event on bus: {}", e)))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_system_event_serialization() {
        let event = SystemEvent::DeadlineApproaching {
            case_id: "test-uuid".to_string(),
            docket_number: "SM-2026-0001".to_string(),
            target_date: "2026-10-30".to_string(),
            days_remaining: 3,
            title: "FDCPA 30-Day Validation Notice Window".to_string(),
        };

        let json = serde_json::to_string(&event).expect("Failed to serialize SystemEvent");
        assert!(json.contains("deadline_approaching"));
        assert!(json.contains("SM-2026-0001"));
        assert!(json.contains("FDCPA 30-Day Validation Notice Window"));
    }
}
