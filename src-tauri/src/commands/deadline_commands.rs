use crate::db::DatabaseManager;
use crate::engine::{
    BackgroundMonitor, DeadlineAlert, DeliveryAdvanceResult, DynamicLicensingRule, DynamicSolRule,
    FdcpaEngine, PatchEngine, PatchSummary, SignedStatutoryPatch, SolEngine, UspsTrackingResult,
};
use crate::error::{AppError, AppResult};
use crate::models::case::DebtType;
use crate::models::deadline::Deadline;
use chrono::NaiveDate;
use serde::{Deserialize, Serialize};
use tauri::{State, command};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimeBarredCheckResult {
    pub is_time_barred: bool,
    pub expiration_date: String,
    pub sol_years: u32,
    pub time_elapsed_days: i64,
    pub days_remaining: i64,
    pub is_approaching_time_barred: bool,
    pub statutory_code: String,
    pub partial_payment_resets_clock: bool,
    pub approach_warning: Option<String>,
    pub revival_warning: Option<String>,
    pub notes: String,
}

#[command]
pub async fn calculate_fdcpa_deadline(notice_date_str: String) -> AppResult<String> {
    let date = NaiveDate::parse_from_str(&notice_date_str, "%Y-%m-%d")
        .map_err(|e| AppError::Validation(format!("Invalid notice date format: {}", e)))?;
    let deadline = FdcpaEngine::calculate_validation_deadline(date);
    Ok(deadline.format("%Y-%m-%d").to_string())
}

#[command]
pub async fn calculate_fdcpa_validation_window(
    notice_date_str: String,
    reference_date_str: Option<String>,
) -> AppResult<crate::engine::fdcpa::ValidationWindow> {
    let date = NaiveDate::parse_from_str(&notice_date_str, "%Y-%m-%d")
        .map_err(|e| AppError::Validation(format!("Invalid notice date format: {}", e)))?;
    let ref_date =
        if let Some(ref d) = reference_date_str {
            Some(NaiveDate::parse_from_str(d, "%Y-%m-%d").map_err(|e| {
                AppError::Validation(format!("Invalid reference date format: {}", e))
            })?)
        } else {
            None
        };
    Ok(FdcpaEngine::calculate_validation_window(date, ref_date))
}

#[command]
pub async fn get_state_sol_rule(
    state_code: String,
    db: State<'_, DatabaseManager>,
) -> AppResult<DynamicSolRule> {
    db.get_active_sol_rule(&state_code)
}

#[command]
pub async fn get_all_state_sol_rules(
    db: State<'_, DatabaseManager>,
) -> AppResult<Vec<DynamicSolRule>> {
    db.get_all_active_sol_rules()
}

#[command]
pub async fn check_debt_time_barred(
    state_code: String,
    debt_type: DebtType,
    default_date_str: String,
    db: State<'_, DatabaseManager>,
) -> AppResult<TimeBarredCheckResult> {
    let default_date = NaiveDate::parse_from_str(&default_date_str, "%Y-%m-%d")
        .map_err(|e| AppError::Validation(format!("Invalid default date format: {}", e)))?;
    let rule = db.get_active_sol_rule(&state_code)?;
    let clock = SolEngine::calculate_sol_clock_with_rule(&rule, &debt_type, default_date, None)
        .ok_or_else(|| AppError::Calculation("Failed to calculate expiration date".to_string()))?;

    Ok(TimeBarredCheckResult {
        is_time_barred: clock.is_time_barred,
        expiration_date: clock.expiration_date,
        sol_years: clock.sol_years,
        time_elapsed_days: clock.time_elapsed_days,
        days_remaining: clock.days_remaining,
        is_approaching_time_barred: clock.is_approaching_time_barred,
        statutory_code: clock.statutory_code,
        partial_payment_resets_clock: clock.partial_payment_resets_clock,
        approach_warning: clock.approach_warning,
        revival_warning: clock.revival_warning,
        notes: clock.notes,
    })
}

#[command]
pub async fn calculate_sol_clock(
    state_code: String,
    debt_type: DebtType,
    default_date_str: String,
    reference_date_str: Option<String>,
    db: State<'_, DatabaseManager>,
) -> AppResult<crate::engine::sol::SolClockResult> {
    let default_date = NaiveDate::parse_from_str(&default_date_str, "%Y-%m-%d")
        .map_err(|e| AppError::Validation(format!("Invalid default date format: {}", e)))?;
    let ref_date =
        if let Some(ref d) = reference_date_str {
            Some(NaiveDate::parse_from_str(d, "%Y-%m-%d").map_err(|e| {
                AppError::Validation(format!("Invalid reference date format: {}", e))
            })?)
        } else {
            None
        };

    let rule = db.get_active_sol_rule(&state_code)?;
    SolEngine::calculate_sol_clock_with_rule(&rule, &debt_type, default_date, ref_date)
        .ok_or_else(|| AppError::Calculation("Failed to calculate SOL clock".to_string()))
}

#[command]
pub async fn get_state_licensing_rule(
    state_code: String,
    db: State<'_, DatabaseManager>,
) -> AppResult<DynamicLicensingRule> {
    db.get_active_licensing_rule(&state_code)
}

#[command]
pub async fn get_all_state_licensing_rules(
    db: State<'_, DatabaseManager>,
) -> AppResult<Vec<DynamicLicensingRule>> {
    db.get_all_active_licensing_rules()
}

#[command]
pub async fn import_statutory_patch(
    signed_patch_json: String,
    db: State<'_, DatabaseManager>,
) -> AppResult<PatchSummary> {
    let patch: SignedStatutoryPatch = serde_json::from_str(&signed_patch_json)
        .map_err(|e| AppError::Validation(format!("Invalid signed statutory patch JSON: {}", e)))?;
    db.apply_statutory_patch(&patch)
}

#[command]
pub async fn get_active_statutory_patches(
    db: State<'_, DatabaseManager>,
) -> AppResult<Vec<PatchSummary>> {
    db.get_active_statutory_patches()
}

#[command]
pub async fn rollback_statutory_patch(
    patch_id: String,
    db: State<'_, DatabaseManager>,
) -> AppResult<()> {
    db.rollback_statutory_patch(&patch_id)
}

#[command]
pub async fn rollback_all_statutory_patches(
    db: State<'_, DatabaseManager>,
) -> AppResult<()> {
    db.rollback_all_statutory_patches()
}

#[command]
pub async fn get_official_statutory_authority_key() -> AppResult<String> {
    Ok(PatchEngine::get_official_public_key_hex())
}

#[command]
pub async fn get_deadlines(
    case_id: String,
    db: State<'_, DatabaseManager>,
) -> AppResult<Vec<Deadline>> {
    db.get_deadlines(&case_id)
}

#[command]
pub async fn create_deadline(
    deadline: Deadline,
    db: State<'_, DatabaseManager>,
) -> AppResult<Uuid> {
    db.create_deadline(&deadline)
}

#[command]
pub async fn check_deadlines_now(
    db: State<'_, DatabaseManager>,
    reference_date_str: Option<String>,
) -> AppResult<Vec<DeadlineAlert>> {
    let ref_date =
        if let Some(ref d) = reference_date_str {
            Some(NaiveDate::parse_from_str(d, "%Y-%m-%d").map_err(|e| {
                AppError::Validation(format!("Invalid reference date format: {}", e))
            })?)
        } else {
            None
        };
    BackgroundMonitor::check_database_deadlines(&db, ref_date)
}

#[command]
pub async fn query_certified_mail_status(tracking_number: String) -> AppResult<UspsTrackingResult> {
    Ok(BackgroundMonitor::query_certified_mail_status(
        &tracking_number,
    ))
}

#[command]
pub async fn poll_certified_mail_cases(
    db: State<'_, DatabaseManager>,
) -> AppResult<Vec<DeliveryAdvanceResult>> {
    BackgroundMonitor::poll_and_advance_certified_mail_cases(&db)
}
