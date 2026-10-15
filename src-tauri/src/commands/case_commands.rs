use crate::db::DatabaseManager;
use crate::error::AppResult;
use crate::models::{Case, CaseStatus};
use tauri::{State, command};
use uuid::Uuid;

#[command]
pub async fn get_cases(db: State<'_, DatabaseManager>) -> AppResult<Vec<Case>> {
    db.get_cases()
}

#[command]
pub async fn get_case_by_id(
    case_id: String,
    db: State<'_, DatabaseManager>,
) -> AppResult<Option<Case>> {
    db.get_case_by_id(&case_id)
}

#[command]
pub async fn create_case(case_data: Case, db: State<'_, DatabaseManager>) -> AppResult<Uuid> {
    db.create_case(&case_data)
}

#[command]
pub async fn update_case_status(
    case_id: String,
    new_status: CaseStatus,
    db: State<'_, DatabaseManager>,
) -> AppResult<bool> {
    db.update_case_status(&case_id, &new_status)
}
