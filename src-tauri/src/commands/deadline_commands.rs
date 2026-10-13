use crate::engine::FdcpaEngine;
use chrono::NaiveDate;
use tauri::command;

#[command]
pub async fn calculate_fdcpa_deadline(notice_date_str: String) -> Result<String, String> {
    let date = NaiveDate::parse_from_str(&notice_date_str, "%Y-%m-%d")
        .map_err(|e| format!("Invalid date format: {}", e))?;
    let deadline = FdcpaEngine::calculate_validation_deadline(date);
    Ok(deadline.format("%Y-%m-%d").to_string())
}
