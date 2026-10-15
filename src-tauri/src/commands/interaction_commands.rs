use crate::db::DatabaseManager;
use crate::engine::fdcpa::{FdcpaEngine, StatutoryDamagesSummary};
use crate::error::AppResult;
use crate::models::{Interaction, Violation};
use tauri::{command, State};
use uuid::Uuid;

#[command]
pub async fn get_interactions(
    case_id: String,
    db: State<'_, DatabaseManager>,
) -> AppResult<Vec<Interaction>> {
    db.get_interactions(&case_id)
}

#[command]
pub async fn get_violations(
    case_id: String,
    db: State<'_, DatabaseManager>,
) -> AppResult<Vec<Violation>> {
    db.get_violations(&case_id)
}

#[command]
pub async fn detect_interaction_violations(
    case_id: String,
    interaction: Interaction,
    debtor_tz_offset_hours: Option<i32>,
    db: State<'_, DatabaseManager>,
) -> AppResult<Vec<Violation>> {
    let history = db.get_interactions(&case_id)?;
    let offset = debtor_tz_offset_hours.unwrap_or(-5); // Default to Eastern Time (-5) if unspecified

    let deadlines = db.get_deadlines(&case_id)?;
    let dvl_delivered = deadlines
        .iter()
        .find(|d| d.deadline_type == crate::models::deadline::DeadlineType::Fdcpa30DayValidation)
        .map(|d| d.target_date - chrono::Duration::days(30));

    let detected = FdcpaEngine::evaluate_all_violations(
        &interaction,
        &history,
        dvl_delivered,
        None,
        None,
        offset,
    );

    Ok(detected)
}

#[command]
pub async fn get_case_statutory_damages(
    case_id: String,
    db: State<'_, DatabaseManager>,
) -> AppResult<StatutoryDamagesSummary> {
    let violations = db.get_violations(&case_id)?;
    Ok(FdcpaEngine::summarize_damages(&case_id, &violations))
}

#[command]
pub async fn log_interaction(
    interaction: Interaction,
    mut violations: Vec<Violation>,
    db: State<'_, DatabaseManager>,
) -> AppResult<Uuid> {
    // If no manual violations were passed, auto-evaluate backend statutory rules
    if violations.is_empty() {
        let history = db.get_interactions(&interaction.case_id.to_string())?;
        let deadlines = db.get_deadlines(&interaction.case_id.to_string())?;
        let dvl_delivered = deadlines
            .iter()
            .find(|d| d.deadline_type == crate::models::deadline::DeadlineType::Fdcpa30DayValidation)
            .map(|d| d.target_date - chrono::Duration::days(30));

        let auto_detected = FdcpaEngine::evaluate_all_violations(
            &interaction,
            &history,
            dvl_delivered,
            None,
            None,
            -5,
        );
        violations = auto_detected;
    }

    db.log_interaction(&interaction, &violations)
}

