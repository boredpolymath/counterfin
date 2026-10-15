use crate::crypto::{CryptoEngine, SensitiveString, VaultAuthRecord};
use crate::engine::EvidenceVault;
use crate::error::{AppError, AppResult};
use std::path::PathBuf;
use tauri::{AppHandle, Manager, command};

fn get_sandbox_paths(app: &AppHandle) -> crate::engine::vault::SandboxPaths {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .unwrap_or_else(|_| EvidenceVault::resolve_os_sandbox_dir());
    let sandbox = EvidenceVault::build_sandbox_paths(&app_data_dir);
    let _ = sandbox.create_all();
    sandbox
}

fn get_auth_file_path(app: &AppHandle) -> PathBuf {
    let sandbox = get_sandbox_paths(app);
    sandbox.base_dir.join("vault_auth.json")
}

#[command]
pub async fn is_master_passphrase_enrolled(app: AppHandle) -> AppResult<bool> {
    let auth_path = get_auth_file_path(&app);
    Ok(auth_path.exists())
}

#[command]
pub async fn enroll_master_passphrase(
    passphrase: String,
    app: AppHandle,
) -> AppResult<VaultAuthRecord> {
    if passphrase.trim().len() < 8 {
        return Err(AppError::Validation(
            "Master passphrase must be at least 8 characters long".to_string(),
        ));
    }

    let sensitive = SensitiveString::new(passphrase);
    let (record, _key) = CryptoEngine::enroll_passphrase(&sensitive)?;

    let auth_path = get_auth_file_path(&app);
    CryptoEngine::save_auth_record(&auth_path, &record)?;

    Ok(record)
}

#[command]
pub async fn verify_master_passphrase(passphrase: String, app: AppHandle) -> AppResult<bool> {
    let auth_path = get_auth_file_path(&app);
    if !auth_path.exists() {
        return Err(AppError::NotFound(
            "No master passphrase has been enrolled yet".to_string(),
        ));
    }

    let record = CryptoEngine::load_auth_record(&auth_path)?;
    let sensitive = SensitiveString::new(passphrase);
    match CryptoEngine::authenticate_passphrase(&sensitive, &record) {
        Ok(_) => Ok(true),
        Err(AppError::Validation(_)) => Ok(false),
        Err(e) => Err(e),
    }
}

#[command]
pub async fn export_encrypted_backup(
    passphrase: String,
    destination_path: String,
    app: AppHandle,
) -> AppResult<String> {
    let sensitive = SensitiveString::new(passphrase);
    let auth_path = get_auth_file_path(&app);

    // Verify passphrase if enrolled
    if auth_path.exists() {
        let record = CryptoEngine::load_auth_record(&auth_path)?;
        CryptoEngine::authenticate_passphrase(&sensitive, &record)?;
    }

    let sandbox = get_sandbox_paths(&app);
    let db_path = sandbox.database_dir.join("settlemint.db");
    let evidence_dir = sandbox.evidence_dir;
    let dest_archive = PathBuf::from(destination_path);

    CryptoEngine::create_backup_archive(&db_path, &evidence_dir, &dest_archive, &sensitive)?;

    Ok(dest_archive.to_string_lossy().to_string())
}

#[command]
pub async fn restore_encrypted_backup(
    passphrase: String,
    source_archive_path: String,
    app: AppHandle,
) -> AppResult<usize> {
    let sensitive = SensitiveString::new(passphrase);
    let sandbox = get_sandbox_paths(&app);
    let target_db_path = sandbox.database_dir.join("settlemint.db");
    let target_evidence_dir = sandbox.evidence_dir;
    let src_archive = PathBuf::from(source_archive_path);

    let restored_count = CryptoEngine::restore_backup_archive(
        &src_archive,
        &target_db_path,
        &target_evidence_dir,
        &sensitive,
    )?;

    Ok(restored_count)
}
