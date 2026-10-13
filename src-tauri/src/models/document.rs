use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum DocumentType {
    DebtValidationLetter,
    LimitedCeaseAndDesist,
    CreditBureauDispute,
    CfpbComplaintPacket,
    StateAgComplaint,
    PayForDeleteOffer,
    CertifiedMailReceipt,
    AudioRecording,
    ProviderBillingRecord,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Document {
    pub id: Uuid,
    pub case_id: Uuid,
    pub bates_identifier: String,
    pub title: String,
    pub document_type: DocumentType,
    pub relative_file_path: String,
    pub sha256_hash: String,
    pub file_size_bytes: u64,
    pub created_at: DateTime<Utc>,
}
