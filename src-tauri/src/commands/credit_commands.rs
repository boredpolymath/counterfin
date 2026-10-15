use crate::db::DatabaseManager;
use crate::error::AppResult;
use crate::models::CreditTradeLine;
use tauri::{State, command};
use uuid::Uuid;

#[command]
pub async fn get_credit_tradelines(
    case_id: String,
    db: State<'_, DatabaseManager>,
) -> AppResult<Vec<CreditTradeLine>> {
    db.get_credit_tradelines(&case_id)
}

#[command]
pub async fn create_credit_tradeline(
    tradeline: CreditTradeLine,
    db: State<'_, DatabaseManager>,
) -> AppResult<Uuid> {
    db.create_credit_tradeline(&tradeline)
}
