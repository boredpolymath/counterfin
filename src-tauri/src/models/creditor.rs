use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum AgencyType {
    OriginalProvider,
    DebtBuyer,
    ThirdPartyServicer,
    LawFirmCollection,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Creditor {
    pub id: Uuid,
    pub case_id: Uuid,
    pub entity_name: String,
    pub agency_type: AgencyType,
    pub corporate_address: String,
    pub phone_number: String,
    pub registered_agent: Option<String>,
    pub state_license_id: Option<String>,
}
