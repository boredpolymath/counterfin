use crate::models::case::DebtType;
use chrono::{Datelike, NaiveDate, Utc};
use serde::{Deserialize, Serialize};

/// Statute of Limitations Engine by US State Jurisdiction for Consumer & Medical Debts covered by FDCPA
pub struct SolEngine;

/// Complete temporal calculation result for a consumer debt's statute of limitations
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct SolClockResult {
    pub state_code: String,
    pub state_name: String,
    pub debt_type: DebtType,
    pub sol_years: u32,
    pub default_date: String,
    pub expiration_date: String,
    pub time_elapsed_days: i64,
    pub days_remaining: i64,
    pub is_time_barred: bool,
    pub is_approaching_time_barred: bool,
    pub statutory_code: String,
    pub partial_payment_resets_clock: bool,
    pub approach_warning: Option<String>,
    pub revival_warning: Option<String>,
    pub notes: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct StateSolRule {
    pub state_code: &'static str,
    pub state_name: &'static str,
    pub medical_sol_years: u32,
    pub credit_card_sol_years: u32,
    pub written_contract_sol_years: u32,
    pub open_account_sol_years: u32,
    pub statutory_code: &'static str,
    pub partial_payment_resets_clock: bool,
    pub notes: &'static str,
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

/// Dynamic, owned SOL Rule capable of supporting live air-gapped statutory table overrides
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct DynamicSolRule {
    pub state_code: String,
    pub state_name: String,
    pub medical_sol_years: u32,
    pub credit_card_sol_years: u32,
    pub written_contract_sol_years: u32,
    pub open_account_sol_years: u32,
    pub statutory_code: String,
    pub partial_payment_resets_clock: bool,
    pub notes: String,
    pub is_overridden: bool,
}

impl From<StateSolRule> for DynamicSolRule {
    fn from(r: StateSolRule) -> Self {
        Self {
            state_code: r.state_code.to_string(),
            state_name: r.state_name.to_string(),
            medical_sol_years: r.medical_sol_years,
            credit_card_sol_years: r.credit_card_sol_years,
            written_contract_sol_years: r.written_contract_sol_years,
            open_account_sol_years: r.open_account_sol_years,
            statutory_code: r.statutory_code.to_string(),
            partial_payment_resets_clock: r.partial_payment_resets_clock,
            notes: r.notes.to_string(),
            is_overridden: false,
        }
    }
}

impl DynamicSolRule {
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
    /// Retrieve statutory limitation parameters for consumer debts in a given state or territory
    pub fn get_rule(state_code: &str) -> StateSolRule {
        match state_code.trim().to_uppercase().as_str() {
            "AL" => StateSolRule {
                state_code: "AL",
                state_name: "Alabama",
                medical_sol_years: 3,
                credit_card_sol_years: 3,
                written_contract_sol_years: 6,
                open_account_sol_years: 3,
                statutory_code: "Ala. Code §§ 6-2-34(9), 6-2-37(1)",
                partial_payment_resets_clock: true,
                notes: "Open accounts/revolving debts are subject to a 3-year limitation (Ala. Code § 6-2-37(1)). Partial payment resets clock under § 6-2-16.",
            },
            "AK" => StateSolRule {
                state_code: "AK",
                state_name: "Alaska",
                medical_sol_years: 3,
                credit_card_sol_years: 3,
                written_contract_sol_years: 3,
                open_account_sol_years: 3,
                statutory_code: "Alaska Stat. § 09.10.053",
                partial_payment_resets_clock: true,
                notes: "Reformed contract actions in 1997 to 3 years across written and open account claims under AS 09.10.053. Partial payment resets limitation under AS 09.10.210.",
            },
            "AZ" => StateSolRule {
                state_code: "AZ",
                state_name: "Arizona",
                medical_sol_years: 3,
                credit_card_sol_years: 6,
                written_contract_sol_years: 6,
                open_account_sol_years: 3,
                statutory_code: "A.R.S. §§ 12-543, 12-548",
                partial_payment_resets_clock: true,
                notes: "A.R.S. § 12-548(A)(2) explicitly sets credit cards at 6 years. Medical and oral accounts are 3 years under § 12-543. Partial payment resets clock under § 12-508.",
            },
            "AR" => StateSolRule {
                state_code: "AR",
                state_name: "Arkansas",
                medical_sol_years: 2,
                credit_card_sol_years: 5,
                written_contract_sol_years: 5,
                open_account_sol_years: 3,
                statutory_code: "Ark. Code Ann. §§ 16-56-105, 16-56-106, 16-56-111",
                partial_payment_resets_clock: true,
                notes: "Medical accounts with physicians/hospitals have a strict 2-year limitation under Ark. Code Ann. § 16-56-106. Written contracts 5 years (§ 16-56-111).",
            },
            "CA" => StateSolRule {
                state_code: "CA",
                state_name: "California",
                medical_sol_years: 4,
                credit_card_sol_years: 4,
                written_contract_sol_years: 4,
                open_account_sol_years: 4,
                statutory_code: "Cal. Civ. Proc. Code §§ 337, 337a",
                partial_payment_resets_clock: true,
                notes: "4-year limitation for written contracts and book accounts under CCP §§ 337, 337a. Note: Cal. Civ. Code § 1788.14 prohibits collectors from suing on time-barred debt.",
            },
            "CO" => StateSolRule {
                state_code: "CO",
                state_name: "Colorado",
                medical_sol_years: 3,
                credit_card_sol_years: 6,
                written_contract_sol_years: 6,
                open_account_sol_years: 3,
                statutory_code: "Colo. Rev. Stat. §§ 13-80-101, 13-80-103.5; HB 23-1126",
                partial_payment_resets_clock: true,
                notes: "Liquidated debts and written contracts 6 years (C.R.S. § 13-80-103.5); open accounts and medical debts 3 years (§ 13-80-101). HB 23-1126 bars medical debt reporting.",
            },
            "CT" => StateSolRule {
                state_code: "CT",
                state_name: "Connecticut",
                medical_sol_years: 6,
                credit_card_sol_years: 6,
                written_contract_sol_years: 6,
                open_account_sol_years: 6,
                statutory_code: "Conn. Gen. Stat. §§ 52-576, 52-581",
                partial_payment_resets_clock: true,
                notes: "Simple or implied contracts 6 years under § 52-576. Oral executory contracts 3 years under § 52-581, but credit card and written agreements fall under § 52-576.",
            },
            "DE" => StateSolRule {
                state_code: "DE",
                state_name: "Delaware",
                medical_sol_years: 3,
                credit_card_sol_years: 3,
                written_contract_sol_years: 3,
                open_account_sol_years: 3,
                statutory_code: "10 Del. C. § 8106",
                partial_payment_resets_clock: true,
                notes: "General 3-year statutory limitation for mutual accounts and debt promises under 10 Del. C. § 8106.",
            },
            "DC" => StateSolRule {
                state_code: "DC",
                state_name: "District of Columbia",
                medical_sol_years: 3,
                credit_card_sol_years: 3,
                written_contract_sol_years: 3,
                open_account_sol_years: 3,
                statutory_code: "D.C. Code §§ 12-301, 28-3814(m)(1)",
                partial_payment_resets_clock: false,
                notes: "3-year limitation under D.C. Code § 12-301. Under DC Debt Collection Law (§ 28-3814(m)(1)), payment on a time-barred debt does not revive or extend the limitation period.",
            },
            "FL" => StateSolRule {
                state_code: "FL",
                state_name: "Florida",
                medical_sol_years: 5,
                credit_card_sol_years: 4,
                written_contract_sol_years: 5,
                open_account_sol_years: 4,
                statutory_code: "Fla. Stat. § 95.11",
                partial_payment_resets_clock: true,
                notes: "Store accounts and credit card unwritten obligations 4 years (§ 95.11(3)(k)); written contracts 5 years (§ 95.11(2)(b)). Partial payment resets clock under § 95.051(1)(f).",
            },
            "GA" => StateSolRule {
                state_code: "GA",
                state_name: "Georgia",
                medical_sol_years: 4,
                credit_card_sol_years: 6,
                written_contract_sol_years: 6,
                open_account_sol_years: 4,
                statutory_code: "O.C.G.A. §§ 9-3-24, 9-3-25",
                partial_payment_resets_clock: true,
                notes: "Written contracts and revolving card accounts 6 years under O.C.G.A. § 9-3-24; open accounts 4 years under § 9-3-25. Written acknowledgment/payment revives under § 9-3-112.",
            },
            "HI" => StateSolRule {
                state_code: "HI",
                state_name: "Hawaii",
                medical_sol_years: 6,
                credit_card_sol_years: 6,
                written_contract_sol_years: 6,
                open_account_sol_years: 6,
                statutory_code: "Haw. Rev. Stat. § 657-1",
                partial_payment_resets_clock: true,
                notes: "6-year limitation for all actions on debt or contract under Haw. Rev. Stat. § 657-1.",
            },
            "ID" => StateSolRule {
                state_code: "ID",
                state_name: "Idaho",
                medical_sol_years: 4,
                credit_card_sol_years: 5,
                written_contract_sol_years: 5,
                open_account_sol_years: 4,
                statutory_code: "Idaho Code §§ 5-216, 5-217",
                partial_payment_resets_clock: true,
                notes: "Written contracts and credit card agreements 5 years (Idaho Code § 5-216); oral/open accounts 4 years (§ 5-217). Partial payment resets clock under § 5-238.",
            },
            "IL" => StateSolRule {
                state_code: "IL",
                state_name: "Illinois",
                medical_sol_years: 5,
                credit_card_sol_years: 5,
                written_contract_sol_years: 10,
                open_account_sol_years: 5,
                statutory_code: "735 ILCS 5/13-205, 5/13-206",
                partial_payment_resets_clock: true,
                notes: "Unwritten contracts and open accounts 5 years (735 ILCS 5/13-205); written contracts and notes 10 years (735 ILCS 5/13-206). Partial payment resets clock.",
            },
            "IN" => StateSolRule {
                state_code: "IN",
                state_name: "Indiana",
                medical_sol_years: 6,
                credit_card_sol_years: 6,
                written_contract_sol_years: 6,
                open_account_sol_years: 6,
                statutory_code: "Ind. Code §§ 34-11-2-7, 34-11-2-9",
                partial_payment_resets_clock: true,
                notes: "6-year limitation applies to accounts and unwritten contracts (§ 34-11-2-7) as well as promissory notes and written debt instruments (§ 34-11-2-9).",
            },
            "IA" => StateSolRule {
                state_code: "IA",
                state_name: "Iowa",
                medical_sol_years: 5,
                credit_card_sol_years: 5,
                written_contract_sol_years: 10,
                open_account_sol_years: 5,
                statutory_code: "Iowa Code § 614.1(4), (5)",
                partial_payment_resets_clock: true,
                notes: "Unwritten contracts and open accounts 5 years (§ 614.1(4)); written contracts 10 years (§ 614.1(5)). Partial payment resets clock under § 614.11.",
            },
            "KS" => StateSolRule {
                state_code: "KS",
                state_name: "Kansas",
                medical_sol_years: 3,
                credit_card_sol_years: 3,
                written_contract_sol_years: 5,
                open_account_sol_years: 3,
                statutory_code: "Kan. Stat. Ann. §§ 60-511, 60-512",
                partial_payment_resets_clock: true,
                notes: "Open accounts and oral contracts 3 years (K.S.A. § 60-512); written contracts 5 years (K.S.A. § 60-511). Partial payment revives under § 60-520.",
            },
            "KY" => StateSolRule {
                state_code: "KY",
                state_name: "Kentucky",
                medical_sol_years: 5,
                credit_card_sol_years: 5,
                written_contract_sol_years: 10,
                open_account_sol_years: 5,
                statutory_code: "Ky. Rev. Stat. §§ 413.120, 413.160",
                partial_payment_resets_clock: true,
                notes: "Open accounts and contracts not in writing 5 years under KRS § 413.120. Written contracts after July 2014 are 10 years (KRS § 413.160).",
            },
            "LA" => StateSolRule {
                state_code: "LA",
                state_name: "Louisiana",
                medical_sol_years: 3,
                credit_card_sol_years: 3,
                written_contract_sol_years: 10,
                open_account_sol_years: 3,
                statutory_code: "La. Civ. Code arts. 3494, 3499",
                partial_payment_resets_clock: true,
                notes: "Prescription of 3 years on open accounts and professional services (La. Civ. Code art. 3494); personal actions 10 years (art. 3499). Payment interrupts prescription under art. 3464.",
            },
            "ME" => StateSolRule {
                state_code: "ME",
                state_name: "Maine",
                medical_sol_years: 6,
                credit_card_sol_years: 6,
                written_contract_sol_years: 6,
                open_account_sol_years: 6,
                statutory_code: "14 M.R.S. § 752; 32 M.R.S. § 11013(8)",
                partial_payment_resets_clock: false,
                notes: "6-year limitation under 14 M.R.S. § 752. Under Maine Fair Debt Collection Practices Act 32 M.R.S. § 11013(8), payment on an expired debt does NOT revive the statute of limitations.",
            },
            "MD" => StateSolRule {
                state_code: "MD",
                state_name: "Maryland",
                medical_sol_years: 3,
                credit_card_sol_years: 3,
                written_contract_sol_years: 3,
                open_account_sol_years: 3,
                statutory_code: "Md. Code, Cts. & Jud. Proc. §§ 5-101, 5-1202",
                partial_payment_resets_clock: false,
                notes: "3-year limitation under CJ § 5-101. Under Md. Code, Com. Law § 14-202(11) and CJ § 5-1202, suing or attempting to revive time-barred consumer debt is strictly prohibited.",
            },
            "MA" => StateSolRule {
                state_code: "MA",
                state_name: "Massachusetts",
                medical_sol_years: 6,
                credit_card_sol_years: 6,
                written_contract_sol_years: 6,
                open_account_sol_years: 6,
                statutory_code: "Mass. Gen. Laws ch. 260, § 2",
                partial_payment_resets_clock: true,
                notes: "6-year limitation for contract actions under M.G.L. c. 260 § 2. Partial payment resets clock under § 14.",
            },
            "MI" => StateSolRule {
                state_code: "MI",
                state_name: "Michigan",
                medical_sol_years: 6,
                credit_card_sol_years: 6,
                written_contract_sol_years: 6,
                open_account_sol_years: 6,
                statutory_code: "Mich. Comp. Laws § 600.5807(8)",
                partial_payment_resets_clock: true,
                notes: "6-year limitation for breach of contract or open account under MCL § 600.5807(8). Partial payment resets clock under § 600.5865.",
            },
            "MN" => StateSolRule {
                state_code: "MN",
                state_name: "Minnesota",
                medical_sol_years: 6,
                credit_card_sol_years: 6,
                written_contract_sol_years: 6,
                open_account_sol_years: 6,
                statutory_code: "Minn. Stat. §§ 541.05, 541.17; Debt Fairness Act",
                partial_payment_resets_clock: true,
                notes: "6-year limitation for express or implied contract under Minn. Stat. § 541.05. Minnesota Debt Fairness Act protects against medical wage garnishment.",
            },
            "MS" => StateSolRule {
                state_code: "MS",
                state_name: "Mississippi",
                medical_sol_years: 3,
                credit_card_sol_years: 3,
                written_contract_sol_years: 3,
                open_account_sol_years: 3,
                statutory_code: "Miss. Code Ann. §§ 15-1-3, 15-1-29, 15-1-49",
                partial_payment_resets_clock: false,
                notes: "3 years under Miss. Code Ann. § 15-1-29. Crucially, under § 15-1-3, expiration extinguishes both the remedy AND the right; partial payment cannot revive.",
            },
            "MO" => StateSolRule {
                state_code: "MO",
                state_name: "Missouri",
                medical_sol_years: 5,
                credit_card_sol_years: 5,
                written_contract_sol_years: 10,
                open_account_sol_years: 5,
                statutory_code: "Mo. Rev. Stat. §§ 516.110, 516.120",
                partial_payment_resets_clock: true,
                notes: "Open accounts and oral contracts 5 years (Mo. Rev. Stat. § 516.120); written instruments for payment of money 10 years (§ 516.110). Partial payment resets under § 516.320.",
            },
            "MT" => StateSolRule {
                state_code: "MT",
                state_name: "Montana",
                medical_sol_years: 5,
                credit_card_sol_years: 5,
                written_contract_sol_years: 8,
                open_account_sol_years: 5,
                statutory_code: "Mont. Code Ann. §§ 27-2-202, 27-2-409",
                partial_payment_resets_clock: true,
                notes: "Contracts not in writing 5 years; written contracts 8 years under MCA § 27-2-202. Partial payment resets clock under § 27-2-409.",
            },
            "NE" => StateSolRule {
                state_code: "NE",
                state_name: "Nebraska",
                medical_sol_years: 4,
                credit_card_sol_years: 4,
                written_contract_sol_years: 5,
                open_account_sol_years: 4,
                statutory_code: "Neb. Rev. Stat. §§ 25-205, 25-206",
                partial_payment_resets_clock: true,
                notes: "Contracts not in writing 4 years (Neb. Rev. Stat. § 25-206); written contracts 5 years (§ 25-205). Partial payment resets clock under § 25-216.",
            },
            "NV" => StateSolRule {
                state_code: "NV",
                state_name: "Nevada",
                medical_sol_years: 4,
                credit_card_sol_years: 4,
                written_contract_sol_years: 6,
                open_account_sol_years: 4,
                statutory_code: "Nev. Rev. Stat. § 11.190; SB 248",
                partial_payment_resets_clock: false,
                notes: "Open accounts 4 years (NRS § 11.190(2)(c)); written contracts 6 years (§ 11.190(1)(b)). Under Nevada debt collection law (SB 248), collectors cannot revive time-barred debt.",
            },
            "NH" => StateSolRule {
                state_code: "NH",
                state_name: "New Hampshire",
                medical_sol_years: 3,
                credit_card_sol_years: 3,
                written_contract_sol_years: 3,
                open_account_sol_years: 3,
                statutory_code: "N.H. Rev. Stat. Ann. § 508:4",
                partial_payment_resets_clock: true,
                notes: "3-year limitation for all personal actions under RSA 508:4.",
            },
            "NJ" => StateSolRule {
                state_code: "NJ",
                state_name: "New Jersey",
                medical_sol_years: 6,
                credit_card_sol_years: 6,
                written_contract_sol_years: 6,
                open_account_sol_years: 6,
                statutory_code: "N.J. Stat. Ann. § 2A:14-1",
                partial_payment_resets_clock: true,
                notes: "6-year limitation for breach of contract or debt obligations under N.J.S.A. § 2A:14-1.",
            },
            "NM" => StateSolRule {
                state_code: "NM",
                state_name: "New Mexico",
                medical_sol_years: 4,
                credit_card_sol_years: 4,
                written_contract_sol_years: 6,
                open_account_sol_years: 4,
                statutory_code: "N.M. Stat. Ann. §§ 37-1-3, 37-1-4; § 58-15-21",
                partial_payment_resets_clock: false,
                notes: "Unwritten accounts 4 years (NMSA § 37-1-4); written contracts 6 years (§ 37-1-3). Consumer financial protection laws prohibit reviving expired debt through partial payment.",
            },
            "NY" => StateSolRule {
                state_code: "NY",
                state_name: "New York",
                medical_sol_years: 3,
                credit_card_sol_years: 3,
                written_contract_sol_years: 3,
                open_account_sol_years: 3,
                statutory_code: "N.Y. C.P.L.R. § 214-i (Consumer Credit Fairness Act)",
                partial_payment_resets_clock: false,
                notes: "3-year uniform limitation for consumer credit under CCFA CPLR § 214-i. Explicit statutory bar against reviving expired debt through payment or acknowledgement.",
            },
            "NC" => StateSolRule {
                state_code: "NC",
                state_name: "North Carolina",
                medical_sol_years: 3,
                credit_card_sol_years: 3,
                written_contract_sol_years: 3,
                open_account_sol_years: 3,
                statutory_code: "N.C. Gen. Stat. §§ 1-52, 58-70-115",
                partial_payment_resets_clock: false,
                notes: "3-year limitation under N.C.G.S. § 1-52(1). N.C.G.S. § 58-70-115(4) prohibits collection or revival of time-barred consumer debt.",
            },
            "ND" => StateSolRule {
                state_code: "ND",
                state_name: "North Dakota",
                medical_sol_years: 6,
                credit_card_sol_years: 6,
                written_contract_sol_years: 6,
                open_account_sol_years: 6,
                statutory_code: "N.D. Cent. Code §§ 28-01-16, 28-01-36",
                partial_payment_resets_clock: true,
                notes: "6-year limitation for contracts and obligations under NDCC § 28-01-16(1). Partial payment resets clock under § 28-01-36.",
            },
            "OH" => StateSolRule {
                state_code: "OH",
                state_name: "Ohio",
                medical_sol_years: 6,
                credit_card_sol_years: 6,
                written_contract_sol_years: 6,
                open_account_sol_years: 6,
                statutory_code: "Ohio Rev. Code §§ 2305.06, 2305.07",
                partial_payment_resets_clock: true,
                notes: "6-year limitation for unwritten contracts / open accounts (R.C. § 2305.07) and written contracts (R.C. § 2305.06, updated 2021). Partial payment resets under § 2305.08.",
            },
            "OK" => StateSolRule {
                state_code: "OK",
                state_name: "Oklahoma",
                medical_sol_years: 3,
                credit_card_sol_years: 3,
                written_contract_sol_years: 5,
                open_account_sol_years: 3,
                statutory_code: "12 O.S. §§ 95, 101",
                partial_payment_resets_clock: true,
                notes: "Contracts not in writing and open accounts 3 years (12 O.S. § 95(A)(2)); written contracts 5 years (12 O.S. § 95(A)(1)). Partial payment resets clock under § 101.",
            },
            "OR" => StateSolRule {
                state_code: "OR",
                state_name: "Oregon",
                medical_sol_years: 6,
                credit_card_sol_years: 6,
                written_contract_sol_years: 6,
                open_account_sol_years: 6,
                statutory_code: "Or. Rev. Stat. §§ 12.080, 646.639",
                partial_payment_resets_clock: false,
                notes: "6 years under ORS § 12.080. Oregon Unlawful Debt Collection Practices Act ORS § 646.639 bars threatening suit on time-barred debt or reviving expired debt.",
            },
            "PA" => StateSolRule {
                state_code: "PA",
                state_name: "Pennsylvania",
                medical_sol_years: 4,
                credit_card_sol_years: 4,
                written_contract_sol_years: 4,
                open_account_sol_years: 4,
                statutory_code: "42 Pa.C.S. § 5525",
                partial_payment_resets_clock: true,
                notes: "4-year limitation for contracts and open accounts under 42 Pa.C.S. § 5525. Partial payment before expiration resets clock; post-expiration revival is strictly scrutinized.",
            },
            "RI" => StateSolRule {
                state_code: "RI",
                state_name: "Rhode Island",
                medical_sol_years: 10,
                credit_card_sol_years: 10,
                written_contract_sol_years: 10,
                open_account_sol_years: 10,
                statutory_code: "R.I. Gen. Laws § 9-1-13",
                partial_payment_resets_clock: true,
                notes: "10-year general limitation for civil contract actions under R.I. Gen. Laws § 9-1-13(a).",
            },
            "SC" => StateSolRule {
                state_code: "SC",
                state_name: "South Carolina",
                medical_sol_years: 3,
                credit_card_sol_years: 3,
                written_contract_sol_years: 3,
                open_account_sol_years: 3,
                statutory_code: "S.C. Code Ann. §§ 15-3-530, 15-3-120",
                partial_payment_resets_clock: true,
                notes: "3-year limitation for contract and debt actions under S.C. Code Ann. § 15-3-530(1). Partial payment resets clock under § 15-3-120.",
            },
            "SD" => StateSolRule {
                state_code: "SD",
                state_name: "South Dakota",
                medical_sol_years: 6,
                credit_card_sol_years: 6,
                written_contract_sol_years: 6,
                open_account_sol_years: 6,
                statutory_code: "S.D. Codified Laws §§ 15-2-13, 15-2-29",
                partial_payment_resets_clock: true,
                notes: "6-year limitation for contracts and obligations under SDCL § 15-2-13(1). Partial payment resets clock under § 15-2-29.",
            },
            "TN" => StateSolRule {
                state_code: "TN",
                state_name: "Tennessee",
                medical_sol_years: 6,
                credit_card_sol_years: 6,
                written_contract_sol_years: 6,
                open_account_sol_years: 6,
                statutory_code: "Tenn. Code Ann. § 28-3-109",
                partial_payment_resets_clock: true,
                notes: "6-year limitation for contract and note actions under TCA § 28-3-109(a)(3).",
            },
            "TX" => StateSolRule {
                state_code: "TX",
                state_name: "Texas",
                medical_sol_years: 4,
                credit_card_sol_years: 4,
                written_contract_sol_years: 4,
                open_account_sol_years: 4,
                statutory_code: "Tex. Civ. Prac. & Rem. Code § 16.004; Tex. Fin. Code § 392.307",
                partial_payment_resets_clock: false,
                notes: "4-year limitation under Tex. CPRC § 16.004. Tex. Fin. Code § 392.307 strictly bars attempting to collect or revive time-barred debt.",
            },
            "UT" => StateSolRule {
                state_code: "UT",
                state_name: "Utah",
                medical_sol_years: 4,
                credit_card_sol_years: 6,
                written_contract_sol_years: 6,
                open_account_sol_years: 4,
                statutory_code: "Utah Code §§ 78B-2-307, 78B-2-309",
                partial_payment_resets_clock: true,
                notes: "Open accounts and oral contracts 4 years (Utah Code § 78B-2-307); written contracts 6 years (§ 78B-2-309). Partial payment resets clock under § 78B-2-113.",
            },
            "VT" => StateSolRule {
                state_code: "VT",
                state_name: "Vermont",
                medical_sol_years: 6,
                credit_card_sol_years: 6,
                written_contract_sol_years: 6,
                open_account_sol_years: 6,
                statutory_code: "12 V.S.A. §§ 511, 592",
                partial_payment_resets_clock: true,
                notes: "6-year limitation for civil actions on contracts and debts under 12 V.S.A. § 511. Partial payment resets clock under § 592.",
            },
            "VA" => StateSolRule {
                state_code: "VA",
                state_name: "Virginia",
                medical_sol_years: 3,
                credit_card_sol_years: 3,
                written_contract_sol_years: 5,
                open_account_sol_years: 3,
                statutory_code: "Va. Code Ann. §§ 8.01-246, 8.01-246.1",
                partial_payment_resets_clock: false,
                notes: "Credit cards and unwritten contracts 3 years (Va. Code § 8.01-246(4)); written contracts 5 years (§ 8.01-246(2)). Va. Code § 8.01-246.1 prohibits suing or reviving time-barred consumer debt.",
            },
            "WA" => StateSolRule {
                state_code: "WA",
                state_name: "Washington",
                medical_sol_years: 3,
                credit_card_sol_years: 6,
                written_contract_sol_years: 6,
                open_account_sol_years: 3,
                statutory_code: "Wash. Rev. Code §§ 4.16.040, 4.16.080, 19.16.250",
                partial_payment_resets_clock: false,
                notes: "Written contracts and revolving card agreements 6 years (RCW 4.16.040); open accounts 3 years (RCW 4.16.080). RCW 19.16.250 & 4.16.270 prohibit reviving time-barred consumer debt.",
            },
            "WV" => StateSolRule {
                state_code: "WV",
                state_name: "West Virginia",
                medical_sol_years: 5,
                credit_card_sol_years: 5,
                written_contract_sol_years: 10,
                open_account_sol_years: 5,
                statutory_code: "W. Va. Code §§ 55-2-6, 46A-2-128(f)",
                partial_payment_resets_clock: false,
                notes: "Contracts not in writing and open accounts 5 years (W. Va. Code § 55-2-6); written contracts 10 years. WV Consumer Credit Protection Act § 46A-2-128(f) bars reviving expired debt.",
            },
            "WI" => StateSolRule {
                state_code: "WI",
                state_name: "Wisconsin",
                medical_sol_years: 6,
                credit_card_sol_years: 6,
                written_contract_sol_years: 6,
                open_account_sol_years: 6,
                statutory_code: "Wis. Stat. §§ 893.05, 893.43",
                partial_payment_resets_clock: false,
                notes: "6-year contract limitation under Wis. Stat. § 893.43. Under § 893.05, expiration completely extinguishes the right as well as remedy; partial payment cannot revive.",
            },
            "WY" => StateSolRule {
                state_code: "WY",
                state_name: "Wyoming",
                medical_sol_years: 8,
                credit_card_sol_years: 8,
                written_contract_sol_years: 10,
                open_account_sol_years: 8,
                statutory_code: "Wyo. Stat. Ann. §§ 1-3-105, 1-3-119",
                partial_payment_resets_clock: true,
                notes: "Contracts not in writing and open accounts 8 years (Wyo. Stat. Ann. § 1-3-105(a)(ii)); written contracts 10 years (§ 1-3-105(a)(i)). Partial payment resets clock under § 1-3-119.",
            },
            "PR" => StateSolRule {
                state_code: "PR",
                state_name: "Puerto Rico",
                medical_sol_years: 3,
                credit_card_sol_years: 3,
                written_contract_sol_years: 5,
                open_account_sol_years: 3,
                statutory_code: "31 L.P.R.A. § 5298; 2020 P.R. Civil Code Art. 1205",
                partial_payment_resets_clock: true,
                notes: "3-year limitation on commerce open accounts (31 L.P.R.A. § 5298); personal actions and written contracts 5 years under 2020 Civil Code Art. 1205.",
            },
            "GU" => StateSolRule {
                state_code: "GU",
                state_name: "Guam",
                medical_sol_years: 4,
                credit_card_sol_years: 4,
                written_contract_sol_years: 4,
                open_account_sol_years: 4,
                statutory_code: "7 GCA § 11304",
                partial_payment_resets_clock: true,
                notes: "4-year limitation for contracts and accounts in Guam under 7 GCA § 11304.",
            },
            "VI" => StateSolRule {
                state_code: "VI",
                state_name: "US Virgin Islands",
                medical_sol_years: 6,
                credit_card_sol_years: 6,
                written_contract_sol_years: 6,
                open_account_sol_years: 6,
                statutory_code: "5 V.I.C. § 31(3)(A)",
                partial_payment_resets_clock: true,
                notes: "6-year limitation for contract and liability actions under 5 V.I.C. § 31(3)(A).",
            },
            _ => StateSolRule {
                state_code: "DEFAULT",
                state_name: "Default Consumer Jurisdiction",
                medical_sol_years: 3,
                credit_card_sol_years: 3,
                written_contract_sol_years: 4,
                open_account_sol_years: 3,
                statutory_code: "General Consumer Debt Statute Baseline",
                partial_payment_resets_clock: true,
                notes: "Fallback baseline for unspecified or non-codified jurisdictions.",
            },
        }
    }

    /// List of all 50 US States, DC, and territories codified in SettleMint
    pub const ALL_STATE_CODES: [&'static str; 54] = [
        "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI", "ID", "IL", "IN",
        "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH",
        "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT",
        "VT", "VA", "WA", "WV", "WI", "WY", "PR", "GU", "VI",
    ];

    /// Retrieve all codified state and territory rules
    pub fn get_all_rules() -> Vec<StateSolRule> {
        Self::ALL_STATE_CODES
            .iter()
            .map(|&code| Self::get_rule(code))
            .collect()
    }

    /// Calculate the statutory expiration date for a debt using a dynamic rule (built-in or overridden)
    pub fn calculate_expiration_date_with_rule(
        rule: &DynamicSolRule,
        debt_type: &DebtType,
        default_or_activity_date: NaiveDate,
    ) -> Option<NaiveDate> {
        let sol_years = rule.get_sol_years(debt_type);

        let new_year = default_or_activity_date.year() + sol_years as i32;
        let month = default_or_activity_date.month();
        let day = default_or_activity_date.day();

        // Handle leap day boundary safely
        if month == 2 && day == 29 {
            NaiveDate::from_ymd_opt(new_year, 2, 28)
        } else {
            NaiveDate::from_ymd_opt(new_year, month, day)
        }
    }

    /// Calculate the statutory expiration date for a debt given its default or last activity date
    pub fn calculate_expiration_date(
        state_code: &str,
        debt_type: &DebtType,
        default_or_activity_date: NaiveDate,
    ) -> Option<NaiveDate> {
        let rule = DynamicSolRule::from(Self::get_rule(state_code));
        Self::calculate_expiration_date_with_rule(&rule, debt_type, default_or_activity_date)
    }

    /// Check if a debt is time-barred under the applicable state SOL
    pub fn is_debt_time_barred(
        state_code: &str,
        debt_type: &DebtType,
        default_or_activity_date: NaiveDate,
        current_date: NaiveDate,
    ) -> bool {
        if let Some(expiration_date) =
            Self::calculate_expiration_date(state_code, debt_type, default_or_activity_date)
        {
            current_date >= expiration_date
        } else {
            false
        }
    }

    /// Full temporal date delta and warning calculation using a dynamic rule
    pub fn calculate_sol_clock_with_rule(
        rule: &DynamicSolRule,
        debt_type: &DebtType,
        default_date: NaiveDate,
        reference_today: Option<NaiveDate>,
    ) -> Option<SolClockResult> {
        let sol_years = rule.get_sol_years(debt_type);
        let expiration_date =
            Self::calculate_expiration_date_with_rule(rule, debt_type, default_date)?;
        let today = reference_today.unwrap_or_else(|| Utc::now().date_naive());

        let time_elapsed_days = (today - default_date).num_days();
        let days_remaining = (expiration_date - today).num_days();
        let is_time_barred = today >= expiration_date;
        let is_approaching_time_barred = !is_time_barred && (0..=30).contains(&days_remaining);

        let approach_warning = if is_approaching_time_barred {
            Some(format!(
                "HIGH SEVERITY: This debt is {} days away from becoming time-barred under {}. Exercise extreme caution: do not acknowledge the balance or submit any payment.",
                days_remaining, rule.statutory_code
            ))
        } else if is_time_barred {
            Some(format!(
                "STATUTE EXPIRED: This debt became legally time-barred on {}. Under 15 U.S.C. § 1692e and 12 C.F.R. § 1006.26, suing or threatening to sue on this debt is an actionable federal violation.",
                expiration_date.format("%Y-%m-%d")
            ))
        } else {
            None
        };

        let revival_warning = if rule.partial_payment_resets_clock {
            Some(format!(
                "EXPLICIT WARNING: Under {} law ({}), making a partial payment or signing an acknowledgment resets the entire {}-year statutory limitation clock.",
                rule.state_name, rule.statutory_code, sol_years
            ))
        } else {
            Some(format!(
                "ANTI-REVIVAL STATE: Under {} law ({}), making a partial payment does NOT revive an expired or running statute of limitations.",
                rule.state_name, rule.statutory_code
            ))
        };

        Some(SolClockResult {
            state_code: rule.state_code.clone(),
            state_name: rule.state_name.clone(),
            debt_type: debt_type.clone(),
            sol_years,
            default_date: default_date.format("%Y-%m-%d").to_string(),
            expiration_date: expiration_date.format("%Y-%m-%d").to_string(),
            time_elapsed_days,
            days_remaining,
            is_time_barred,
            is_approaching_time_barred,
            statutory_code: rule.statutory_code.clone(),
            partial_payment_resets_clock: rule.partial_payment_resets_clock,
            approach_warning,
            revival_warning,
            notes: rule.notes.clone(),
        })
    }

    /// Full temporal date delta and warning calculation for Statute of Limitations clock
    pub fn calculate_sol_clock(
        state_code: &str,
        debt_type: &DebtType,
        default_date: NaiveDate,
        reference_today: Option<NaiveDate>,
    ) -> Option<SolClockResult> {
        let rule = DynamicSolRule::from(Self::get_rule(state_code));
        Self::calculate_sol_clock_with_rule(&rule, debt_type, default_date, reference_today)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_all_50_states_plus_dc_and_territories_are_codified() {
        assert_eq!(SolEngine::ALL_STATE_CODES.len(), 54);
        for code in SolEngine::ALL_STATE_CODES.iter() {
            let rule = SolEngine::get_rule(code);
            assert_eq!(rule.state_code, *code);
            assert!(!rule.state_name.is_empty());
            assert!(rule.medical_sol_years > 0 && rule.medical_sol_years <= 15);
            assert!(rule.credit_card_sol_years > 0 && rule.credit_card_sol_years <= 15);
            assert!(rule.written_contract_sol_years > 0 && rule.written_contract_sol_years <= 15);
            assert!(rule.open_account_sol_years > 0 && rule.open_account_sol_years <= 15);
            assert!(!rule.statutory_code.is_empty());
            assert!(!rule.notes.is_empty());
        }
    }

    #[test]
    fn test_anti_revival_states() {
        // NY, TX, MS, WI, NC, VA, WA, WV, MD, ME, NV, NM, DC bar reviving expired consumer debt
        let ny = SolEngine::get_rule("NY");
        assert_eq!(ny.credit_card_sol_years, 3);
        assert!(!ny.partial_payment_resets_clock);

        let tx = SolEngine::get_rule("TX");
        assert_eq!(tx.credit_card_sol_years, 4);
        assert!(!tx.partial_payment_resets_clock);

        let ms = SolEngine::get_rule("MS");
        assert_eq!(ms.credit_card_sol_years, 3);
        assert!(!ms.partial_payment_resets_clock);

        let wi = SolEngine::get_rule("WI");
        assert_eq!(wi.credit_card_sol_years, 6);
        assert!(!wi.partial_payment_resets_clock);

        let dc = SolEngine::get_rule("DC");
        assert_eq!(dc.credit_card_sol_years, 3);
        assert!(!dc.partial_payment_resets_clock);
    }

    #[test]
    fn test_debt_type_sol_lookups() {
        let fl = SolEngine::get_rule("FL");
        assert_eq!(fl.get_sol_years(&DebtType::CreditCard), 4);
        assert_eq!(fl.get_sol_years(&DebtType::Medical), 5);
        assert_eq!(fl.get_sol_years(&DebtType::AutoDeficiency), 5);
        assert_eq!(fl.get_sol_years(&DebtType::UtilityTelecom), 4);

        let il = SolEngine::get_rule("IL");
        assert_eq!(il.get_sol_years(&DebtType::CreditCard), 5);
        assert_eq!(il.get_sol_years(&DebtType::PersonalLoan), 10);
    }

    #[test]
    fn test_time_barred_calculation() {
        let default_date = NaiveDate::from_ymd_opt(2020, 1, 15).unwrap();
        let expired_check_date = NaiveDate::from_ymd_opt(2023, 1, 16).unwrap();
        let not_expired_check_date = NaiveDate::from_ymd_opt(2022, 1, 15).unwrap();

        // NY Credit Card SOL is 3 years
        assert!(SolEngine::is_debt_time_barred(
            "NY",
            &DebtType::CreditCard,
            default_date,
            expired_check_date
        ));
        assert!(!SolEngine::is_debt_time_barred(
            "NY",
            &DebtType::CreditCard,
            default_date,
            not_expired_check_date
        ));
    }

    #[test]
    fn test_leap_year_handling() {
        let leap_date = NaiveDate::from_ymd_opt(2020, 2, 29).unwrap();
        let exp_date = SolEngine::calculate_expiration_date("NY", &DebtType::CreditCard, leap_date);
        assert_eq!(
            exp_date,
            Some(NaiveDate::from_ymd_opt(2023, 2, 28).unwrap())
        );
    }

    #[test]
    fn test_sol_clock_temporal_calculations_and_warnings() {
        // NY Credit card: 3 years
        let default_date = NaiveDate::from_ymd_opt(2023, 6, 1).unwrap();

        // 1. Approaching expiration: 10 days before June 1, 2026
        let today_approaching = NaiveDate::from_ymd_opt(2026, 5, 22).unwrap();
        let clock_approaching = SolEngine::calculate_sol_clock(
            "NY",
            &DebtType::CreditCard,
            default_date,
            Some(today_approaching),
        )
        .unwrap();

        assert_eq!(clock_approaching.days_remaining, 10);
        assert!(!clock_approaching.is_time_barred);
        assert!(clock_approaching.is_approaching_time_barred);
        assert!(
            clock_approaching
                .approach_warning
                .unwrap()
                .contains("HIGH SEVERITY")
        );
        assert!(
            clock_approaching
                .revival_warning
                .unwrap()
                .contains("ANTI-REVIVAL")
        );

        // 2. Fully Expired: July 1, 2026
        let today_expired = NaiveDate::from_ymd_opt(2026, 7, 1).unwrap();
        let clock_expired = SolEngine::calculate_sol_clock(
            "NY",
            &DebtType::CreditCard,
            default_date,
            Some(today_expired),
        )
        .unwrap();

        assert!(clock_expired.is_time_barred);
        assert!(!clock_expired.is_approaching_time_barred);
        assert!(clock_expired.days_remaining < 0);
        assert!(
            clock_expired
                .approach_warning
                .unwrap()
                .contains("STATUTE EXPIRED")
        );

        // 3. Revival Warning in partial payment reset state (Alabama)
        let clock_al = SolEngine::calculate_sol_clock(
            "AL",
            &DebtType::CreditCard,
            default_date,
            Some(today_approaching),
        )
        .unwrap();
        assert!(clock_al.partial_payment_resets_clock);
        assert!(
            clock_al
                .revival_warning
                .unwrap()
                .contains("EXPLICIT WARNING")
        );
    }
}
