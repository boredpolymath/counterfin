use crate::models::{Case, CaseStatus};
use tauri::command;
use uuid::Uuid;

#[command]
pub async fn get_cases() -> Result<Vec<Case>, String> {
    // Skeleton command returning case records
    Ok(vec![])
}

#[command]
pub async fn create_case(case_data: Case) -> Result<Uuid, String> {
    // Skeleton command creating a new case dossier
    Ok(case_data.id)
}

#[command]
pub async fn update_case_status(_case_id: String, _new_status: CaseStatus) -> Result<bool, String> {
    // Skeleton command enforcing state machine transition
    Ok(true)
}
