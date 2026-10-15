use crate::crypto::{hex_decode, hex_encode};
use crate::engine::licensing::DynamicLicensingRule;
use crate::engine::sol::DynamicSolRule;
use crate::error::{AppError, AppResult};
use ed25519_dalek::{Signature, Signer, SigningKey, Verifier, VerifyingKey};
use serde::{Deserialize, Serialize};

/// Official Bored Polymath Studios Statutory Authority Seed (for key derivation & signing utility)
pub const OFFICIAL_SIGNER_SEED: [u8; 32] = [
    0x53, 0x65, 0x74, 0x74, 0x6c, 0x65, 0x4d, 0x69, 0x6e, 0x74, 0x5f, 0x53, 0x74, 0x61, 0x74, 0x75,
    0x74, 0x6f, 0x72, 0x79, 0x5f, 0x55, 0x70, 0x64, 0x61, 0x74, 0x65, 0x5f, 0x4b, 0x65, 0x79, 0x01,
];

/// Sol rule modification entry within an air-gapped statutory patch
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct PatchSolRule {
    pub state_code: String,
    pub state_name: String,
    pub medical_sol_years: u32,
    pub credit_card_sol_years: u32,
    pub written_contract_sol_years: u32,
    pub open_account_sol_years: u32,
    pub statutory_code: String,
    pub partial_payment_resets_clock: bool,
    pub notes: String,
}

impl From<PatchSolRule> for DynamicSolRule {
    fn from(r: PatchSolRule) -> Self {
        Self {
            state_code: r.state_code,
            state_name: r.state_name,
            medical_sol_years: r.medical_sol_years,
            credit_card_sol_years: r.credit_card_sol_years,
            written_contract_sol_years: r.written_contract_sol_years,
            open_account_sol_years: r.open_account_sol_years,
            statutory_code: r.statutory_code,
            partial_payment_resets_clock: r.partial_payment_resets_clock,
            notes: r.notes,
            is_overridden: true,
        }
    }
}

/// Licensing requirement modification entry within an air-gapped statutory patch
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct PatchLicensingRule {
    pub state_code: String,
    pub state_name: String,
    pub requires_license: bool,
    pub regulatory_agency: String,
    pub requires_surety_bond: bool,
    pub bond_amount: String,
    pub statutory_code: String,
    pub unlicensed_collection_is_per_se_violation: bool,
    pub notes: String,
}

impl From<PatchLicensingRule> for DynamicLicensingRule {
    fn from(r: PatchLicensingRule) -> Self {
        Self {
            state_code: r.state_code,
            state_name: r.state_name,
            requires_license: r.requires_license,
            regulatory_agency: r.regulatory_agency,
            requires_surety_bond: r.requires_surety_bond,
            bond_amount: r.bond_amount,
            statutory_code: r.statutory_code,
            unlicensed_collection_is_per_se_violation: r.unlicensed_collection_is_per_se_violation,
            notes: r.notes,
            is_overridden: true,
        }
    }
}

/// Statutory update payload signed by the publisher
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct StatutoryPatchPayload {
    pub patch_id: String,
    pub version: String,
    pub description: String,
    pub published_at: String,
    #[serde(default)]
    pub sol_rules: Vec<PatchSolRule>,
    #[serde(default)]
    pub licensing_rules: Vec<PatchLicensingRule>,
}

/// Tamper-evident signed statutory patch envelope
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct SignedStatutoryPatch {
    pub payload: StatutoryPatchPayload,
    pub signature_hex: String,
    pub public_key_hex: String,
}

/// Summary of an active statutory patch registered in the system
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct PatchSummary {
    pub patch_id: String,
    pub version: String,
    pub description: String,
    pub published_at: String,
    pub applied_at: String,
    pub signer_public_key: String,
    pub sol_rules_count: usize,
    pub licensing_rules_count: usize,
}

pub struct PatchEngine;

impl PatchEngine {
    /// Retrieve the official signing key for development, verification testing, and utility signing
    pub fn get_official_signing_key() -> SigningKey {
        SigningKey::from_bytes(&OFFICIAL_SIGNER_SEED)
    }

    /// Retrieve the official public key hex
    pub fn get_official_public_key_hex() -> String {
        let key = Self::get_official_signing_key();
        hex_encode(key.verifying_key().as_bytes())
    }

    /// Canonical serialization of the statutory payload for signature computation and verification
    pub fn serialize_canonical_payload(payload: &StatutoryPatchPayload) -> AppResult<Vec<u8>> {
        serde_json::to_vec(payload).map_err(|e| {
            AppError::Serialization(format!(
                "Failed to serialize statutory patch payload: {}",
                e
            ))
        })
    }

    /// Create and sign a statutory patch envelope with the official Bored Polymath key
    pub fn sign_patch(payload: StatutoryPatchPayload) -> AppResult<SignedStatutoryPatch> {
        let signing_key = Self::get_official_signing_key();
        let payload_bytes = Self::serialize_canonical_payload(&payload)?;
        let signature = signing_key.sign(&payload_bytes);
        let public_key_hex = hex_encode(signing_key.verifying_key().as_bytes());

        Ok(SignedStatutoryPatch {
            payload,
            signature_hex: hex_encode(&signature.to_bytes()),
            public_key_hex,
        })
    }

    /// Cryptographically verify the Ed25519 signature of a statutory patch envelope
    pub fn verify_signature(patch: &SignedStatutoryPatch) -> AppResult<()> {
        let official_pubkey = Self::get_official_public_key_hex();
        let signer_pubkey = patch.public_key_hex.trim().to_lowercase();

        if signer_pubkey != official_pubkey {
            return Err(AppError::Security(format!(
                "Untrusted statutory patch signer public key '{}'. Expected official Bored Polymath key '{}'",
                signer_pubkey, official_pubkey
            )));
        }

        let pubkey_bytes = hex_decode(&signer_pubkey)?;
        let pubkey_arr: [u8; 32] = pubkey_bytes.as_slice().try_into().map_err(|_| {
            AppError::Security("Invalid public key length; expected 32 bytes".to_string())
        })?;

        let verifying_key = VerifyingKey::from_bytes(&pubkey_arr)
            .map_err(|e| AppError::Security(format!("Invalid Ed25519 public key format: {}", e)))?;

        let sig_bytes = hex_decode(patch.signature_hex.trim())?;
        let sig_arr: [u8; 64] = sig_bytes.as_slice().try_into().map_err(|_| {
            AppError::Security("Invalid signature length; expected 64 bytes".to_string())
        })?;

        let signature = Signature::from_bytes(&sig_arr);
        let payload_bytes = Self::serialize_canonical_payload(&patch.payload)?;

        verifying_key
            .verify(&payload_bytes, &signature)
            .map_err(|e| {
                AppError::Security(format!(
                    "Cryptographic signature verification failed on statutory patch: {}",
                    e
                ))
            })?;

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_patch_signing_and_verification_cycle() {
        let payload = StatutoryPatchPayload {
            patch_id: "patch-2026-q4-ca-med".to_string(),
            version: "2026.4.1".to_string(),
            description: "California Medical Debt SOL reduction amendment".to_string(),
            published_at: "2026-10-15T12:00:00Z".to_string(),
            sol_rules: vec![PatchSolRule {
                state_code: "CA".to_string(),
                state_name: "California".to_string(),
                medical_sol_years: 3,
                credit_card_sol_years: 4,
                written_contract_sol_years: 4,
                open_account_sol_years: 4,
                statutory_code: "Cal. Civ. Proc. Code § 337 (as amended 2026)".to_string(),
                partial_payment_resets_clock: false,
                notes: "Updated 3-year medical limitation with anti-revival enforcement."
                    .to_string(),
            }],
            licensing_rules: vec![],
        };

        let signed = PatchEngine::sign_patch(payload).expect("Signing must succeed");
        assert!(PatchEngine::verify_signature(&signed).is_ok());

        // Tamper test: modifying signature must fail verification
        let mut tampered = signed.clone();
        tampered.signature_hex = "00".repeat(64);
        assert!(PatchEngine::verify_signature(&tampered).is_err());

        // Tamper test: modifying payload must fail verification
        let mut tampered_payload = signed.clone();
        tampered_payload.payload.version = "2026.9.9".to_string();
        assert!(PatchEngine::verify_signature(&tampered_payload).is_err());
    }
}
