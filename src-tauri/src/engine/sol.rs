use crate::models::case::DebtType;

/// Statute of Limitations Engine by US State Jurisdiction for Consumer & Medical Debts covered by FDCPA
pub struct SolEngine;

#[derive(Debug, Clone)]
pub struct StateSolRule {
    pub state_code: &'static str,
    pub medical_sol_years: u32,
    pub credit_card_sol_years: u32,
    pub written_contract_sol_years: u32,
    pub open_account_sol_years: u32,
    pub statutory_code: &'static str,
    pub partial_payment_resets_clock: bool,
}

impl StateSolRule {
    /// Compute applicable statutory limitation period based on specific debt classification
    pub fn get_sol_years(&self, debt_type: &DebtType) -> u32 {
        match debt_type {
            DebtType::CreditCard => self.credit_card_sol_years,
            DebtType::Medical => self.medical_sol_years,
            DebtType::PersonalLoan | DebtType::AutoDeficiency | DebtType::StudentLoan => {
                self.written_contract_sol_years
            }
            DebtType::UtilityTelecom | DebtType::ResidentialRent | DebtType::OtherConsumerDebt => {
                self.open_account_sol_years
            }
        }
    }
}

impl SolEngine {
    /// Retrieve statutory limitation parameters for consumer debts in a given state
    pub fn get_rule(state_code: &str) -> StateSolRule {
        match state_code.to_uppercase().as_str() {
            "NY" => StateSolRule {
                state_code: "NY",
                medical_sol_years: 3, // NY Fair Medical Debt Reporting Act & CPLR § 214-i
                credit_card_sol_years: 3, // NY Consumer Credit Fairness Act (CPLR § 214-i)
                written_contract_sol_years: 3, // Consumer credit transactions under CPLR 214-i
                open_account_sol_years: 3,
                statutory_code: "N.Y. C.P.L.R. § 214-i (Consumer Credit Fairness Act)",
                partial_payment_resets_clock: false, // In NY, expired consumer debt cannot be revived by payment
            },
            "CA" => StateSolRule {
                state_code: "CA",
                medical_sol_years: 4,
                credit_card_sol_years: 4, // Cal. Civ. Proc. Code § 337a (Open book account)
                written_contract_sol_years: 4, // Cal. Civ. Proc. Code § 337
                open_account_sol_years: 4,
                statutory_code: "Cal. Civ. Proc. Code §§ 337, 337a",
                partial_payment_resets_clock: true,
            },
            "TX" => StateSolRule {
                state_code: "TX",
                medical_sol_years: 4,
                credit_card_sol_years: 4, // Tex. Civ. Prac. & Rem. Code § 16.004
                written_contract_sol_years: 4,
                open_account_sol_years: 4,
                statutory_code: "Tex. Civ. Prac. & Rem. Code § 16.004 & Fin. Code § 392.307",
                partial_payment_resets_clock: false, // Texas law bars reviving time-barred debt
            },
            "FL" => StateSolRule {
                state_code: "FL",
                medical_sol_years: 5,
                credit_card_sol_years: 4, // Fla. Stat. § 95.11(3)(k) - Open store/card accounts
                written_contract_sol_years: 5, // Fla. Stat. § 95.11(2)(b) - Written instrument
                open_account_sol_years: 4,
                statutory_code: "Fla. Stat. § 95.11",
                partial_payment_resets_clock: true,
            },
            "IL" => StateSolRule {
                state_code: "IL",
                medical_sol_years: 5,
                credit_card_sol_years: 5, // 735 ILCS 5/13-205 - Unwritten/open credit
                written_contract_sol_years: 10, // 735 ILCS 5/13-206 - Written note/contract
                open_account_sol_years: 5,
                statutory_code: "735 ILCS 5/13-205 & 13-206",
                partial_payment_resets_clock: true,
            },
            "PA" => StateSolRule {
                state_code: "PA",
                medical_sol_years: 4,
                credit_card_sol_years: 4, // 42 Pa.C.S. § 5525
                written_contract_sol_years: 4,
                open_account_sol_years: 4,
                statutory_code: "42 Pa.C.S. § 5525",
                partial_payment_resets_clock: true,
            },
            _ => StateSolRule {
                state_code: "DEFAULT",
                medical_sol_years: 3,
                credit_card_sol_years: 3,
                written_contract_sol_years: 4,
                open_account_sol_years: 3,
                statutory_code: "General Consumer Debt Statute",
                partial_payment_resets_clock: true,
            },
        }
    }
}
