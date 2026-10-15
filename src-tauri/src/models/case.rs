use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Rigid state machine representing the lifecycle of a debt dispute case
/// Section 4.1: Initial Notice -> Validation Pending -> Collector Responded -> Dispute Escalated -> Debt Settled -> Debt Dismissed -> In Litigation
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Default)]
pub enum CaseStatus {
    #[default]
    InitialNotice,
    ValidationPending,
    CollectorResponded,
    DisputeEscalated,
    DebtSettled,
    DebtDismissed,
    InLitigation,
}

impl CaseStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            CaseStatus::InitialNotice => "InitialNotice",
            CaseStatus::ValidationPending => "ValidationPending",
            CaseStatus::CollectorResponded => "CollectorResponded",
            CaseStatus::DisputeEscalated => "DisputeEscalated",
            CaseStatus::DebtSettled => "DebtSettled",
            CaseStatus::DebtDismissed => "DebtDismissed",
            CaseStatus::InLitigation => "InLitigation",
        }
    }

    /// Enforces strict, non-cyclical statutory state transitions (Section 5.3)
    pub fn can_transition_to(&self, next: &CaseStatus) -> bool {
        if self == next {
            return true;
        }

        match self {
            CaseStatus::InitialNotice => matches!(
                next,
                CaseStatus::ValidationPending
                    | CaseStatus::InLitigation
                    | CaseStatus::DebtSettled
                    | CaseStatus::DebtDismissed
            ),
            CaseStatus::ValidationPending => matches!(
                next,
                CaseStatus::CollectorResponded
                    | CaseStatus::DisputeEscalated
                    | CaseStatus::InLitigation
                    | CaseStatus::DebtSettled
                    | CaseStatus::DebtDismissed
            ),
            CaseStatus::CollectorResponded => matches!(
                next,
                CaseStatus::DisputeEscalated
                    | CaseStatus::InLitigation
                    | CaseStatus::DebtSettled
                    | CaseStatus::DebtDismissed
            ),
            CaseStatus::DisputeEscalated => matches!(
                next,
                CaseStatus::CollectorResponded
                    | CaseStatus::InLitigation
                    | CaseStatus::DebtSettled
                    | CaseStatus::DebtDismissed
            ),
            CaseStatus::InLitigation => {
                matches!(next, CaseStatus::DebtSettled | CaseStatus::DebtDismissed)
            }
            CaseStatus::DebtSettled => matches!(next, CaseStatus::DebtDismissed),
            CaseStatus::DebtDismissed => false, // Terminal closed state; cannot reopen
        }
    }
}

/// Debt classification under the Fair Debt Collection Practices Act (15 U.S.C. § 1692a(5))
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Default)]
pub enum DebtType {
    CreditCard,
    #[default]
    Medical,
    PersonalLoan,
    AutoDeficiency,
    StudentLoan,
    UtilityTelecom,
    ResidentialRent,
    OtherConsumerDebt,
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
