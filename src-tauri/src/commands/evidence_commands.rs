use crate::engine::EvidenceVault;
use crate::engine::vault::EvidenceIntegrityReport;
use crate::error::AppResult;
use tauri::command;

#[command]
pub async fn hash_evidence_payload(payload_bytes: Vec<u8>) -> AppResult<String> {
    Ok(EvidenceVault::compute_sha256(&payload_bytes))
}

#[command]
pub async fn verify_evidence_integrity(
    expected_hash: String,
    file_path: String,
) -> AppResult<EvidenceIntegrityReport> {
    EvidenceVault::audit_file_integrity(&expected_hash, file_path)
}

#[command]
pub async fn validate_sandbox_path(subpath: String) -> AppResult<String> {
    let base_dir = EvidenceVault::resolve_os_sandbox_dir();
    let sandbox = EvidenceVault::build_sandbox_paths(&base_dir);
    let safe_path = sandbox.resolve_safe_subpath(&subpath)?;
    Ok(safe_path.to_string_lossy().to_string())
}

#[command]
pub async fn validate_evidence_upload(
    filename: String,
    payload_bytes: Vec<u8>,
) -> AppResult<crate::engine::vault::EvidenceValidationInfo> {
    let ext = std::path::Path::new(&filename)
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("");
    EvidenceVault::validate_evidence_payload(&payload_bytes, ext, None)
}



