//! Uniform Commercial Code (UCC) Article 9 Auto Loan Deficiency Statutory Validation Engine
//!
//! Codifies protections under:
//! - UCC § 9-610: Commercial reasonableness of collateral disposition
//! - UCC § 9-611: Notification before disposition of collateral
//! - UCC § 9-612: Timeliness of notification (10-day rule in consumer-goods transactions)
//! - UCC § 9-614: Contents and form of notification before disposition (consumer goods)
//! - UCC § 9-616: Explanation of calculation of surplus or deficiency (post-sale accounting)
//! - UCC § 9-625: Remedies for secured party's failure to comply (minimum statutory damages)

use chrono::NaiveDate;
use serde::{Deserialize, Serialize};

/// Type of intended disposition for repossessed vehicle
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum DispositionType {
    /// Public auction with open bidding
    PublicAuction,
    /// Private wholesale or direct negotiated sale
    PrivateSale,
}

/// Notice of Intent to Dispose of Collateral (UCC § 9-611 & § 9-614)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PreSaleNotice {
    pub date_notice_sent: NaiveDate,
    pub scheduled_disposition_date: NaiveDate,
    pub disposition_type: DispositionType,
    pub describes_debtor_and_secured_party: bool,
    pub describes_collateral_vin: bool,
    pub states_method_of_disposition: bool,
    pub states_time_and_place_of_sale: bool,
    pub states_debtor_entitled_to_accounting: bool,
    pub states_liability_for_deficiency: bool,
}

/// Post-sale deficiency accounting components (UCC § 9-616)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PostSaleAccounting {
    pub date_accounting_requested: Option<NaiveDate>,
    pub date_accounting_provided: Option<NaiveDate>,
    /// Total balance owed prior to repossession/sale
    pub original_obligation_amount: f64,
    /// Gross proceeds from auction/sale of vehicle
    pub gross_sale_proceeds: f64,
    /// Permissible repossession, storage, towing, and reconditioning expenses
    pub allowable_repossession_expenses: f64,
    /// Unearned finance charges, extended warranty refunds, GAP insurance rebates
    pub unearned_interest_and_rebates: f64,
    /// Amount claimed as deficiency balance by creditor or junk debt collector
    pub claimed_deficiency_amount: f64,
}

/// Comprehensive audit result for UCC Article 9 compliance
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct UccDeficiencyAuditResult {
    /// True if creditor failed to provide minimum 10-day advance notice under UCC § 9-612
    pub is_untimely_notice: bool,
    /// Days of advance notice provided prior to vehicle disposition
    pub notice_days_provided: i64,
    /// True if pre-sale notice omits mandatory disclosures under UCC § 9-614
    pub is_defective_notice_content: bool,
    /// Missing mandatory notice elements
    pub missing_notice_elements: Vec<String>,
    /// True if post-sale accounting fails 14-day statutory response deadline under UCC § 9-616(b)(1)
    pub is_untimely_post_sale_accounting: bool,
    /// True if post-sale accounting contains mathematical errors or fails to credit unearned interest/rebates
    pub has_accounting_discrepancy: bool,
    /// Correct mathematically audited statutory deficiency balance (or surplus)
    pub audited_statutory_deficiency: f64,
    /// Discrepancy between claimed balance and audited balance
    pub accounting_discrepancy_amount: f64,
    /// Consumer minimum statutory penalty under UCC § 9-625(c)(2) (service charge + 10% of principal)
    pub potential_ucc_statutory_penalty: f64,
    /// Specific statutory violations identified
    pub statutory_violations: Vec<String>,
    /// Mandatory demand items to incorporate into validation letter
    pub required_validation_demands: Vec<String>,
}

pub struct UccArticle9Engine;

impl UccArticle9Engine {
    /// Audits a vehicle repossession pre-sale notice and post-sale deficiency calculation
    pub fn audit_deficiency(
        pre_sale_notice: Option<&PreSaleNotice>,
        post_sale_accounting: &PostSaleAccounting,
        original_principal_for_penalty: Option<f64>,
        finance_charge_for_penalty: Option<f64>,
    ) -> UccDeficiencyAuditResult {
        let mut is_untimely_notice = false;
        let mut notice_days_provided = 0;
        let mut is_defective_notice_content = false;
        let mut missing_notice_elements = Vec::new();
        let mut is_untimely_post_sale_accounting = false;
        let mut statutory_violations = Vec::new();
        let mut required_demands = Vec::new();

        // 1. Audit Pre-Sale Notice Timing & Content (UCC § 9-611, § 9-612, § 9-614)
        if let Some(notice) = pre_sale_notice {
            notice_days_provided = (notice.scheduled_disposition_date - notice.date_notice_sent).num_days();

            // In consumer goods transactions, 10 days before disposition is standard reasonableness (UCC § 9-612(b))
            if notice_days_provided < 10 {
                is_untimely_notice = true;
                statutory_violations.push(format!(
                    "UCC § 9-611 & § 9-612 violation: Notice of disposition provided only {} days prior to sale (statutory threshold is at least 10 days in consumer goods transactions).",
                    notice_days_provided
                ));
                required_demands.push(
                    "Proof of timely authenticated notification of disposition sent at least 10 days prior to sale pursuant to UCC § 9-611 and § 9-612."
                        .to_string(),
                );
            }

            // Audit mandatory disclosure content under UCC § 9-614
            if !notice.describes_debtor_and_secured_party {
                missing_notice_elements.push("Description of debtor and secured party (UCC § 9-614(1)(A))".to_string());
            }
            if !notice.describes_collateral_vin {
                missing_notice_elements.push("Description of collateral and VIN (UCC § 9-614(1)(B))".to_string());
            }
            if !notice.states_method_of_disposition {
                missing_notice_elements.push("Method of intended disposition (UCC § 9-614(1)(C))".to_string());
            }
            if !notice.states_time_and_place_of_sale {
                missing_notice_elements.push("Time and place of public auction or date after which private sale will occur (UCC § 9-614(1)(E))".to_string());
            }
            if !notice.states_debtor_entitled_to_accounting {
                missing_notice_elements.push("Statement that debtor is entitled to an accounting of unpaid indebtedness (UCC § 9-614(1)(D))".to_string());
            }
            if !notice.states_liability_for_deficiency {
                missing_notice_elements.push("Statement that debtor may be liable for a deficiency balance (UCC § 9-614(1)(F))".to_string());
            }

            if !missing_notice_elements.is_empty() {
                is_defective_notice_content = true;
                statutory_violations.push(format!(
                    "UCC § 9-614 violation: Notice of disposition is legally defective due to missing mandatory statutory disclosures: {}",
                    missing_notice_elements.join("; ")
                ));
            }
        } else {
            // Notice was completely omitted
            is_untimely_notice = true;
            is_defective_notice_content = true;
            statutory_violations.push(
                "UCC § 9-611 violation: Complete failure to provide authenticated pre-sale notice of collateral disposition."
                    .to_string(),
            );
            required_demands.push(
                "Verified copy of UCC § 9-611 Notice of Intent to Dispose of Repossessed Vehicle and postal certificate of mailing."
                    .to_string(),
            );
        }

        // 2. Audit Post-Sale Accounting Response Timing (UCC § 9-616(b)(1))
        // Must provide written accounting within 14 days after receipt of request
        if let (Some(req_date), Some(prov_date)) = (
            post_sale_accounting.date_accounting_requested,
            post_sale_accounting.date_accounting_provided,
        ) {
            let response_days = (prov_date - req_date).num_days();
            if response_days > 14 {
                is_untimely_post_sale_accounting = true;
                statutory_violations.push(format!(
                    "UCC § 9-616(b)(1) violation: Post-sale deficiency explanation provided after {} days (exceeds 14-day statutory mandate).",
                    response_days
                ));
            }
        }

        // 3. Mathematical Audit of Surplus or Deficiency Calculation (UCC § 9-616)
        // Deficiency = (Original Obligation + Allowable Repossession Expenses) - (Gross Proceeds + Unearned Interest/Rebates)
        let total_charges = post_sale_accounting.original_obligation_amount
            + post_sale_accounting.allowable_repossession_expenses;
        let total_credits = post_sale_accounting.gross_sale_proceeds
            + post_sale_accounting.unearned_interest_and_rebates;
        let audited_statutory_deficiency = total_charges - total_credits;

        let discrepancy = (post_sale_accounting.claimed_deficiency_amount - audited_statutory_deficiency).abs();
        let has_accounting_discrepancy = discrepancy > 0.01;

        if has_accounting_discrepancy {
            statutory_violations.push(format!(
                "UCC § 9-616 accounting discrepancy: Claimed deficiency balance (${:.2}) does not reconcile with audited balance (${:.2}). Uncredited rebate or improper expense of ${:.2}.",
                post_sale_accounting.claimed_deficiency_amount, audited_statutory_deficiency, discrepancy
            ));
            required_demands.push(
                "Full itemized accounting of gross sale proceeds, auction house receipt, detailed itemization of repossession and storage expenses, and accounting of unearned finance charges and GAP insurance refunds."
                    .to_string(),
            );
        }

        // Demand proof of commercial reasonableness under UCC § 9-610
        required_demands.push(
            "Proof of commercially reasonable disposition of collateral pursuant to UCC § 9-610, including auction condition report and MMR/Kelley Blue Book wholesale valuation at time of sale."
                .to_string(),
        );

        // 4. Calculate Consumer Minimum Statutory Damages Penalty (UCC § 9-625(c)(2))
        // Penalty = Credit Service Charge (finance charges) + 10% of Principal Amount
        let principal = original_principal_for_penalty.unwrap_or(0.0);
        let finance_charge = finance_charge_for_penalty.unwrap_or(0.0);
        let potential_ucc_statutory_penalty = if is_untimely_notice || is_defective_notice_content {
            finance_charge + (0.10 * principal)
        } else {
            0.0
        };

        UccDeficiencyAuditResult {
            is_untimely_notice,
            notice_days_provided,
            is_defective_notice_content,
            missing_notice_elements,
            is_untimely_post_sale_accounting,
            has_accounting_discrepancy,
            audited_statutory_deficiency,
            accounting_discrepancy_amount: discrepancy,
            potential_ucc_statutory_penalty,
            statutory_violations,
            required_validation_demands: required_demands,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_ucc_notice_timing_under_10_days_violates_statute() {
        // Notice sent on Oct 1; sale held on Oct 7 (6 days notice -> violates 10-day rule)
        let notice = PreSaleNotice {
            date_notice_sent: NaiveDate::from_ymd_opt(2025, 10, 1).unwrap(),
            scheduled_disposition_date: NaiveDate::from_ymd_opt(2025, 10, 7).unwrap(),
            disposition_type: DispositionType::PublicAuction,
            describes_debtor_and_secured_party: true,
            describes_collateral_vin: true,
            states_method_of_disposition: true,
            states_time_and_place_of_sale: true,
            states_debtor_entitled_to_accounting: true,
            states_liability_for_deficiency: true,
        };

        let accounting = PostSaleAccounting {
            date_accounting_requested: None,
            date_accounting_provided: None,
            original_obligation_amount: 15000.0,
            gross_sale_proceeds: 8000.0,
            allowable_repossession_expenses: 500.0,
            unearned_interest_and_rebates: 0.0,
            claimed_deficiency_amount: 7500.0,
        };

        let result = UccArticle9Engine::audit_deficiency(
            Some(&notice),
            &accounting,
            Some(12000.0), // $12,000 principal
            Some(3000.0),  // $3,000 finance charge
        );

        assert!(result.is_untimely_notice);
        assert_eq!(result.notice_days_provided, 6);
        assert!(!result.is_defective_notice_content);
        // UCC § 9-625(c)(2) penalty = 3000 + 0.10 * 12000 = $4,200
        assert_eq!(result.potential_ucc_statutory_penalty, 4200.0);
        assert!(result
            .statutory_violations
            .iter()
            .any(|v| v.contains("UCC § 9-611 & § 9-612 violation")));
    }

    #[test]
    fn test_ucc_defective_notice_missing_mandatory_elements() {
        // Notice sent 15 days ahead, but omits time/place and entitlement to accounting
        let notice = PreSaleNotice {
            date_notice_sent: NaiveDate::from_ymd_opt(2025, 9, 1).unwrap(),
            scheduled_disposition_date: NaiveDate::from_ymd_opt(2025, 9, 16).unwrap(),
            disposition_type: DispositionType::PublicAuction,
            describes_debtor_and_secured_party: true,
            describes_collateral_vin: true,
            states_method_of_disposition: true,
            states_time_and_place_of_sale: false,         // MISSING
            states_debtor_entitled_to_accounting: false,  // MISSING
            states_liability_for_deficiency: true,
        };

        let accounting = PostSaleAccounting {
            date_accounting_requested: None,
            date_accounting_provided: None,
            original_obligation_amount: 10000.0,
            gross_sale_proceeds: 6000.0,
            allowable_repossession_expenses: 400.0,
            unearned_interest_and_rebates: 0.0,
            claimed_deficiency_amount: 4400.0,
        };

        let result = UccArticle9Engine::audit_deficiency(Some(&notice), &accounting, None, None);
        assert!(!result.is_untimely_notice);
        assert!(result.is_defective_notice_content);
        assert_eq!(result.missing_notice_elements.len(), 2);
        assert!(result
            .missing_notice_elements
            .iter()
            .any(|m| m.contains("Time and place")));
        assert!(result
            .missing_notice_elements
            .iter()
            .any(|m| m.contains("entitled to an accounting")));
    }

    #[test]
    fn test_ucc_post_sale_deficiency_accounting_calculation_and_uncredited_rebates() {
        // Original: $18,000; Sale proceeds: $10,000; Expenses: $600; GAP rebate: $1,200
        // Correct audited deficiency = (18,000 + 600) - (10,000 + 1,200) = $7,400
        // Collector claims $8,600 (failed to credit $1,200 GAP rebate)
        let accounting = PostSaleAccounting {
            date_accounting_requested: Some(NaiveDate::from_ymd_opt(2025, 5, 1).unwrap()),
            date_accounting_provided: Some(NaiveDate::from_ymd_opt(2025, 5, 10).unwrap()), // 9 days (within 14)
            original_obligation_amount: 18000.0,
            gross_sale_proceeds: 10000.0,
            allowable_repossession_expenses: 600.0,
            unearned_interest_and_rebates: 1200.0,
            claimed_deficiency_amount: 8600.0,
        };

        let result = UccArticle9Engine::audit_deficiency(None, &accounting, None, None);
        assert_eq!(result.audited_statutory_deficiency, 7400.0);
        assert!(result.has_accounting_discrepancy);
        assert_eq!(result.accounting_discrepancy_amount, 1200.0);
        assert!(!result.is_untimely_post_sale_accounting);
        assert!(result
            .statutory_violations
            .iter()
            .any(|v| v.contains("UCC § 9-616 accounting discrepancy")));
    }

    #[test]
    fn test_ucc_untimely_post_sale_accounting_beyond_14_days() {
        // Debtor requested on June 1; accounting provided on June 20 (19 days > 14 days)
        let accounting = PostSaleAccounting {
            date_accounting_requested: Some(NaiveDate::from_ymd_opt(2025, 6, 1).unwrap()),
            date_accounting_provided: Some(NaiveDate::from_ymd_opt(2025, 6, 20).unwrap()),
            original_obligation_amount: 12000.0,
            gross_sale_proceeds: 7000.0,
            allowable_repossession_expenses: 300.0,
            unearned_interest_and_rebates: 500.0,
            claimed_deficiency_amount: 4800.0,
        };

        let result = UccArticle9Engine::audit_deficiency(None, &accounting, None, None);
        assert!(result.is_untimely_post_sale_accounting);
        assert!(result
            .statutory_violations
            .iter()
            .any(|v| v.contains("UCC § 9-616(b)(1) violation")));
    }
}
