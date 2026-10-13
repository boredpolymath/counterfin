use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum Bureau {
    Equifax,
    Experian,
    TransUnion,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum DisputeRemarkStatus {
    DisputedByConsumer,
    AccountInDispute,
    CollectionAccount,
    NotReported,
    Deleted,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreditTradeLine {
    pub id: Uuid,
    pub case_id: Uuid,
    pub bureau: Bureau,
    pub reporting_agency_name: String,
    pub account_number_masked: String,
    pub balance_reported: f64,
    pub remark_status: DisputeRemarkStatus,
    pub is_marked_disputed: bool,
    pub fcra_violation_flag: bool,
    pub last_reported_date: String,
}
