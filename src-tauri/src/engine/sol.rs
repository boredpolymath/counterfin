/// Statute of Limitations Engine by US State Jurisdiction for Medical Debts
pub struct SolEngine;

#[derive(Debug, Clone)]
pub struct StateSolRule {
    pub state_code: &'static str,
    pub medical_sol_years: u32,
    pub statutory_code: &'static str,
    pub partial_payment_resets_clock: bool,
}

impl SolEngine {
    /// Retrieve statutory limitation parameters for medical debts in a given state
    pub fn get_rule(state_code: &str) -> StateSolRule {
        match state_code.to_uppercase().as_str() {
            "NY" => StateSolRule {
                state_code: "NY",
                medical_sol_years: 3, // NY Fair Medical Debt Reporting Act & CPLR 214-i
                statutory_code: "N.Y. C.P.L.R. § 214-i",
                partial_payment_resets_clock: true,
            },
            "CA" => StateSolRule {
                state_code: "CA",
                medical_sol_years: 4,
                statutory_code: "Cal. Civ. Proc. Code § 337",
                partial_payment_resets_clock: true,
            },
            "TX" => StateSolRule {
                state_code: "TX",
                medical_sol_years: 4,
                statutory_code: "Tex. Civ. Prac. & Rem. Code § 16.004",
                partial_payment_resets_clock: true,
            },
            "FL" => StateSolRule {
                state_code: "FL",
                medical_sol_years: 5,
                statutory_code: "Fla. Stat. § 95.11",
                partial_payment_resets_clock: true,
            },
            _ => StateSolRule {
                state_code: "DEFAULT",
                medical_sol_years: 3,
                statutory_code: "General Consumer Debt Statute",
                partial_payment_resets_clock: true,
            },
        }
    }
}
