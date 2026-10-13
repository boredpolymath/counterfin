use crate::models::CreditTradeLine;
use tauri::command;

#[command]
pub async fn get_credit_tradelines(_case_id: String) -> Result<Vec<CreditTradeLine>, String> {
    Ok(vec![])
}
