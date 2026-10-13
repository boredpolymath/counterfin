use sha2::{Digest, Sha256};
use uuid::Uuid;

/// Evidence Vault Cryptographic Hashing and Sandboxing (Section 4.5)
pub struct EvidenceVault;

impl EvidenceVault {
    /// Calculate SHA-256 hash of a file's contents for cryptographic chain of custody
    pub fn compute_sha256(bytes: &[u8]) -> String {
        let mut hasher = Sha256::new();
        hasher.update(bytes);
        format!("{:x}", hasher.finalize())
    }

    /// Generate an anonymized sandboxed storage filename using internal UUID
    pub fn generate_vault_filename(doc_id: &Uuid, original_extension: &str) -> String {
        format!("{}.{}", doc_id, original_extension.trim_start_matches('.'))
    }
}
