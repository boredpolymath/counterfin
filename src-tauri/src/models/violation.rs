use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum FdcpaViolationType {
    /// 15 U.S.C. 1692c(a)(1) - Communication before 8am or after 9pm local time
    InconvenientTime,
    /// 15 U.S.C. 1692c(a)(3) - Contact at workplace after knowing employer prohibits it
    WorkplaceContact,
    /// 15 U.S.C. 1692d(5) - Repeated calls with intent to annoy, abuse, or harass
    ContinuousHarassment,
    /// 15 U.S.C. 1692e(4) - Unlawful threats of arrest, garnishment, or asset seizure
    UnlawfulThreat,
    /// 15 U.S.C. 1692e(2) - False representation of character, amount, or legal status of debt
    MisrepresentationOfDebt,
    /// 15 U.S.C. 1692g(b) - Continued collection activities prior to verification after timely DVL
    CollectionDuringValidation,
    /// 15 U.S.C. 1692c(c) - Contact after receipt of formal Cease and Desist
    PostCeaseContact,
    /// 15 U.S.C. 1692e & 12 C.F.R. § 1006.26 - Suing or threatening to sue on time-barred debt
    TimeBarredSuitThreat,
    /// 12 C.F.R. § 1006.34 - Failure to provide required CFPB Regulation F validation notice itemization & chain of custody
    MissingRegFValidationItemization,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Violation {
    pub id: Uuid,
    pub interaction_id: Uuid,
    pub case_id: Uuid,
    pub violation_type: FdcpaViolationType,
    pub statutory_citation: String,
    pub statutory_penalty_cap: f64,
    pub actual_damages: f64,
    pub factual_summary: String,
    pub evidence_references: Vec<String>,
}
