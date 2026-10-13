use crate::engine::EvidenceVault;
use tauri::command;

#[command]
pub async fn hash_evidence_payload(payload_bytes: Vec<u8>) -> Result<String, String> {
    Ok(EvidenceVault::compute_sha256(&payload_bytes))
}
