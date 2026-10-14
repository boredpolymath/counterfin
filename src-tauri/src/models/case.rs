use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use uuid::Uuid;

/// Rigid state machine representing the lifecycle of a debt dispute case
/// Section 4.1: Initial Notice -> Validation Pending -> Collector Responded -> Dispute Escalated -> Debt Settled -> Debt Dismissed -> In Litigation
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum CaseStatus {
    InitialNotice,
    ValidationPending,
    CollectorResponded,
    DisputeEscalated,
    DebtSettled,
    DebtDismissed,
    InLitigation,
}

impl Default for CaseStatus {
    fn default() -> Self {
        CaseStatus::InitialNotice
    }
}

/// Debt classification under the Fair Debt Collection Practices Act (15 U.S.C. § 1692a(5))
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum DebtType {
    CreditCard,
    Medical,
    PersonalLoan,
    AutoDeficiency,
    StudentLoan,
    UtilityTelecom,
    ResidentialRent,
    OtherConsumerDebt,
}

impl Default for DebtType {
    fn default() -> Self {
        DebtType::Medical
    }
}

/// Root case entity binding debtor, provider, agency, balances, and timeline state
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Case {
    pub id: Uuid,
    pub docket_number: String,
    pub debtor_name: String,
    #[serde(default)]
    pub debt_type: DebtType,
    pub provider_name: String,
    pub collection_agency: String,
    pub original_account_number: String,
    pub collection_account_number: String,
    pub original_balance: f64,
    pub disputed_balance: f64,
    pub status: CaseStatus,
    pub jurisdiction_state: String,
    pub date_of_service: Option<String>,
    pub initial_notice_date: String,
    pub certified_mail_tracking: Option<String>,
    pub created_at: DateTime<Utc>,
    pub closed_at: Option<DateTime<Utc>>,
}
