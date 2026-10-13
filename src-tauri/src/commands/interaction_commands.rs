use crate::models::{Interaction, Violation};
use tauri::command;
use uuid::Uuid;

#[command]
pub async fn get_interactions(_case_id: String) -> Result<Vec<Interaction>, String> {
    Ok(vec![])
}

#[command]
pub async fn log_interaction(
    interaction: Interaction,
    _violations: Vec<Violation>,
) -> Result<Uuid, String> {
    // Skeleton command logging incoming or outgoing communication & FDCPA violation flags
    Ok(interaction.id)
}
