//! No Surprises Act & Medical Debt Statutory Protection Engine
//!
//! Codifies protections under:
//! - Public Law 116-260 (No Surprises Act / Consolidated Appropriations Act, 2021)
//! - 42 U.S.C. § 300gg-111 (Preventing surprise medical bills for emergency and non-emergency services)
//! - 42 U.S.C. § 300gg-136 (Good Faith Estimates for uninsured/self-pay individuals)
//! - 45 C.F.R. § 149.410 - 149.440 (Balance billing prohibitions and consent exceptions)
//! - Fair Debt Collection Practices Act (15 U.S.C. § 1692g & § 1692e) regarding misrepresentation of medical debt

use chrono::NaiveDate;
use serde::{Deserialize, Serialize};

/// Type of medical service performed
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum MedicalServiceType {
    /// Emergency room examination, treatment, and stabilization (42 U.S.C. § 300gg-111(a))
    EmergencyService,
    /// Post-stabilization emergency care prior to safe transport
    PostStabilizationCare,
    /// Non-emergency ancillary service at in-network facility (anesthesiology, pathology, radiology, neonatology, assistant surgeon)
    NonEmergencyAncillaryInNetworkFacility,
    /// Non-emergency elective service with valid advance notice and consent waiver
    ElectiveWithNoticeAndConsent,
    /// Uninsured or self-pay service covered under Good Faith Estimate (GFE)
    UninsuredSelfPay,
    /// Standard in-network scheduled outpatient/inpatient visit
    StandardInNetwork,
}

/// Type of facility where service was rendered
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum MedicalFacilityType {
    HospitalEmergencyDepartment,
    IndependentFreestandingEmergencyDept,
    InNetworkHospitalOrAmbulatoryCenter,
    OutOfNetworkHospitalOrFacility,
    AirAmbulance,
}

/// Evaluation input for a disputed medical debt collection claim
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DisputedMedicalClaim {
    pub provider_name: String,
    pub facility_type: MedicalFacilityType,
    pub service_type: MedicalServiceType,
    pub date_of_service: NaiveDate,
    pub in_network_cost_sharing_copay_coinsurance: f64,
    pub total_billed_amount: f64,
    pub insurance_payment_amount: f64,
    pub claimed_balance_due: f64,
    pub is_emergency_service: bool,
    pub has_itemized_cpt_icd_codes: bool,
    pub has_written_consent_waiver: bool,
    pub good_faith_estimate_amount: Option<f64>,
}

/// Result of No Surprises Act and medical debt statutory audit
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct MedicalStatutoryAuditResult {
    /// True if an unlawful balance bill or statutory billing violation is detected
    pub is_unlawful_balance_bill: bool,
    /// True if Good Faith Estimate variance exceeds statutory limit ($400 under 42 U.S.C. § 300gg-136)
    pub is_gfe_violation: bool,
    /// True if collection agency failed to provide required itemized CPT/ICD coding and chain of assignment
    pub is_missing_statutory_validation_data: bool,
    /// Specific statutory citation violated
    pub statutory_citation: Option<String>,
    /// Legal explanation of the violation
    pub violation_summary: Option<String>,
    /// Permitted legal consumer liability amount (usually in-network cost-sharing)
    pub lawful_consumer_liability: f64,
    /// Excessive / unlawful balance billed amount
    pub unlawful_balance_billed_amount: f64,
    /// Mandatory validation demands to be included in dispute letter
    pub required_validation_demands: Vec<String>,
}

pub struct MedicalDebtEngine;

impl MedicalDebtEngine {
    /// Audits a disputed medical debt claim for No Surprises Act (P.L. 116-260) violations
    pub fn audit_claim(claim: &DisputedMedicalClaim) -> MedicalStatutoryAuditResult {
        let mut is_unlawful_balance_bill = false;
        let mut is_gfe_violation = false;
        let mut statutory_citation = None;
        let mut violation_summary = None;
        let mut required_demands = Vec::new();

        // 1. Mandatory Itemized Billing & Chain of Custody Demands
        if !claim.has_itemized_cpt_icd_codes {
            required_demands.push(
                "Complete itemized billing ledger containing standard CMS-1500 or UB-04 claim forms with CPT and ICD-10 diagnostic codes."
                    .to_string(),
            );
            required_demands.push(
                "Unbroken chain of assignment from the original healthcare provider to the debt collector."
                    .to_string(),
            );
            required_demands.push(
                "Proof of timely insurance submission prior to placement into third-party debt collection."
                    .to_string(),
            );
        }

        // 2. Audit Emergency Services: Absolute prohibition on balance billing
        // 42 U.S.C. § 300gg-111(a) & 45 C.F.R. § 149.410
        if claim.is_emergency_service
            || matches!(
                claim.service_type,
                MedicalServiceType::EmergencyService | MedicalServiceType::PostStabilizationCare
            )
            || matches!(
                claim.facility_type,
                MedicalFacilityType::HospitalEmergencyDepartment
                    | MedicalFacilityType::IndependentFreestandingEmergencyDept
            )
        {
            // Consumer cost-sharing cannot exceed the in-network cost-sharing requirement
            let maximum_lawful_liability = claim.in_network_cost_sharing_copay_coinsurance;
            let excess = (claim.claimed_balance_due - maximum_lawful_liability).max(0.0);

            if excess > 0.01 {
                is_unlawful_balance_bill = true;
                statutory_citation = Some(
                    "Public Law 116-260, Division BB, Title I (No Surprises Act); 42 U.S.C. § 300gg-111(a); 45 C.F.R. § 149.410"
                        .to_string(),
                );
                violation_summary = Some(format!(
                    "Unlawful emergency balance billing. Under the federal No Surprises Act, out-of-network emergency facility and professional charges may not exceed the patient's in-network cost-sharing amount (${:.2}). Billed balance of ${:.2} constitutes an unlawful balance bill of ${:.2}.",
                    maximum_lawful_liability, claim.claimed_balance_due, excess
                ));
                required_demands.push(
                    "Verification of compliance with federal No Surprises Act balance billing prohibitions for emergency medical services."
                        .to_string(),
                );
            }

            return MedicalStatutoryAuditResult {
                is_unlawful_balance_bill,
                is_gfe_violation: false,
                is_missing_statutory_validation_data: !claim.has_itemized_cpt_icd_codes,
                statutory_citation,
                violation_summary,
                lawful_consumer_liability: maximum_lawful_liability,
                unlawful_balance_billed_amount: excess,
                required_validation_demands: required_demands,
            };
        }

        // 3. Audit Uninsured / Self-Pay Good Faith Estimate (GFE) Threshold
        // 42 U.S.C. § 300gg-136 & 45 C.F.R. § 149.610
        if let (MedicalServiceType::UninsuredSelfPay, Some(gfe_amount)) =
            (claim.service_type, claim.good_faith_estimate_amount)
        {
            let variance = claim.total_billed_amount - gfe_amount;
                // Statutory threshold: $400 or more above the Good Faith Estimate
                if variance >= 400.0 {
                    is_gfe_violation = true;
                    is_unlawful_balance_bill = true;
                    statutory_citation = Some(
                        "Public Law 116-260; 42 U.S.C. § 300gg-136; 45 C.F.R. § 149.610".to_string(),
                    );
                    violation_summary = Some(format!(
                        "Good Faith Estimate (GFE) violation. Billed amount (${:.2}) exceeds the written Good Faith Estimate (${:.2}) by ${:.2}, exceeding the $400 statutory threshold and triggering Patient-Provider Dispute Resolution eligibility.",
                        claim.total_billed_amount, gfe_amount, variance
                    ));
                    required_demands.push(
                        "Detailed itemized reconciliation between billed medical charges and the pre-service written Good Faith Estimate."
                            .to_string(),
                    );
                }

            return MedicalStatutoryAuditResult {
                is_unlawful_balance_bill,
                is_gfe_violation,
                is_missing_statutory_validation_data: !claim.has_itemized_cpt_icd_codes,
                statutory_citation,
                violation_summary,
                lawful_consumer_liability: gfe_amount,
                unlawful_balance_billed_amount: variance.max(0.0),
                required_validation_demands: required_demands,
            };
        }

        // 4. Audit Non-Emergency Ancillary Services at In-Network Facilities
        // Anesthesiology, pathology, radiology, neonatology, assistant surgeons CANNOT balance bill
        // Notice and consent exception does NOT apply to ancillary services under 45 C.F.R. § 149.420(b)
        if claim.service_type == MedicalServiceType::NonEmergencyAncillaryInNetworkFacility
            || (claim.facility_type == MedicalFacilityType::InNetworkHospitalOrAmbulatoryCenter
                && !claim.has_written_consent_waiver)
        {
            let maximum_lawful_liability = claim.in_network_cost_sharing_copay_coinsurance;
            let excess = (claim.claimed_balance_due - maximum_lawful_liability).max(0.0);

            if excess > 0.01 {
                is_unlawful_balance_bill = true;
                statutory_citation = Some(
                    "Public Law 116-260, 42 U.S.C. § 300gg-111(b); 45 C.F.R. § 149.420".to_string(),
                );
                violation_summary = Some(format!(
                    "Unlawful surprise balance billing for ancillary or out-of-network services at an in-network facility. Notice and consent waivers are legally invalid for ancillary services (anesthesia, radiology, pathology, neonatology). Maximum allowable liability is in-network cost sharing (${:.2}); excess billed is ${:.2}.",
                    maximum_lawful_liability, excess
                ));
                required_demands.push(
                    "Proof of valid in-network facility assignment and exclusion of prohibited ancillary balance billing."
                        .to_string(),
                );
            }

            return MedicalStatutoryAuditResult {
                is_unlawful_balance_bill,
                is_gfe_violation: false,
                is_missing_statutory_validation_data: !claim.has_itemized_cpt_icd_codes,
                statutory_citation,
                violation_summary,
                lawful_consumer_liability: maximum_lawful_liability,
                unlawful_balance_billed_amount: excess,
                required_validation_demands: required_demands,
            };
        }

        // Standard medical debt validation requirements
        MedicalStatutoryAuditResult {
            is_unlawful_balance_bill: false,
            is_gfe_violation: false,
            is_missing_statutory_validation_data: !claim.has_itemized_cpt_icd_codes,
            statutory_citation: None,
            violation_summary: None,
            lawful_consumer_liability: claim.claimed_balance_due,
            unlawful_balance_billed_amount: 0.0,
            required_validation_demands: required_demands,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_emergency_services_balance_billing_prohibition() {
        // Patient has $250 in-network ER copay; OON hospital bills $3,500
        let claim = DisputedMedicalClaim {
            provider_name: "Apex Emergency Physicians LLC".to_string(),
            facility_type: MedicalFacilityType::HospitalEmergencyDepartment,
            service_type: MedicalServiceType::EmergencyService,
            date_of_service: NaiveDate::from_ymd_opt(2025, 4, 12).unwrap(),
            in_network_cost_sharing_copay_coinsurance: 250.0,
            total_billed_amount: 3500.0,
            insurance_payment_amount: 1000.0,
            claimed_balance_due: 2500.0,
            is_emergency_service: true,
            has_itemized_cpt_icd_codes: true,
            has_written_consent_waiver: false,
            good_faith_estimate_amount: None,
        };

        let result = MedicalDebtEngine::audit_claim(&claim);
        assert!(result.is_unlawful_balance_bill);
        assert_eq!(result.lawful_consumer_liability, 250.0);
        assert_eq!(result.unlawful_balance_billed_amount, 2250.0);
        assert!(result
            .statutory_citation
            .as_ref()
            .unwrap()
            .contains("No Surprises Act"));
        assert!(result
            .violation_summary
            .as_ref()
            .unwrap()
            .contains("Unlawful emergency balance billing"));
    }

    #[test]
    fn test_ancillary_in_network_facility_balance_billing() {
        // Patient goes to in-network hospital; OON anesthesiologist balance bills $1,800
        let claim = DisputedMedicalClaim {
            provider_name: "Suburban Anesthesia Associates".to_string(),
            facility_type: MedicalFacilityType::InNetworkHospitalOrAmbulatoryCenter,
            service_type: MedicalServiceType::NonEmergencyAncillaryInNetworkFacility,
            date_of_service: NaiveDate::from_ymd_opt(2025, 6, 18).unwrap(),
            in_network_cost_sharing_copay_coinsurance: 50.0,
            total_billed_amount: 1800.0,
            insurance_payment_amount: 600.0,
            claimed_balance_due: 1200.0,
            is_emergency_service: false,
            has_itemized_cpt_icd_codes: true,
            has_written_consent_waiver: false,
            good_faith_estimate_amount: None,
        };

        let result = MedicalDebtEngine::audit_claim(&claim);
        assert!(result.is_unlawful_balance_bill);
        assert_eq!(result.lawful_consumer_liability, 50.0);
        assert_eq!(result.unlawful_balance_billed_amount, 1150.0);
        assert!(result
            .statutory_citation
            .as_ref()
            .unwrap()
            .contains("45 C.F.R. § 149.420"));
    }

    #[test]
    fn test_good_faith_estimate_exceeds_400_dollar_threshold() {
        // Self-pay patient given $800 GFE; billed $1,350 (variance $550 >= $400 threshold)
        let claim = DisputedMedicalClaim {
            provider_name: "Valley Surgical Group".to_string(),
            facility_type: MedicalFacilityType::InNetworkHospitalOrAmbulatoryCenter,
            service_type: MedicalServiceType::UninsuredSelfPay,
            date_of_service: NaiveDate::from_ymd_opt(2025, 8, 10).unwrap(),
            in_network_cost_sharing_copay_coinsurance: 0.0,
            total_billed_amount: 1350.0,
            insurance_payment_amount: 0.0,
            claimed_balance_due: 1350.0,
            is_emergency_service: false,
            has_itemized_cpt_icd_codes: true,
            has_written_consent_waiver: false,
            good_faith_estimate_amount: Some(800.0),
        };

        let result = MedicalDebtEngine::audit_claim(&claim);
        assert!(result.is_gfe_violation);
        assert!(result.is_unlawful_balance_bill);
        assert_eq!(result.lawful_consumer_liability, 800.0);
        assert_eq!(result.unlawful_balance_billed_amount, 550.0);
        assert!(result
            .statutory_citation
            .as_ref()
            .unwrap()
            .contains("42 U.S.C. § 300gg-136"));
    }

    #[test]
    fn test_missing_itemized_cpt_icd_codes_triggers_demands() {
        let claim = DisputedMedicalClaim {
            provider_name: "Midwest Collections Inc / Memorial Hospital".to_string(),
            facility_type: MedicalFacilityType::InNetworkHospitalOrAmbulatoryCenter,
            service_type: MedicalServiceType::StandardInNetwork,
            date_of_service: NaiveDate::from_ymd_opt(2025, 2, 5).unwrap(),
            in_network_cost_sharing_copay_coinsurance: 150.0,
            total_billed_amount: 150.0,
            insurance_payment_amount: 0.0,
            claimed_balance_due: 150.0,
            is_emergency_service: false,
            has_itemized_cpt_icd_codes: false,
            has_written_consent_waiver: false,
            good_faith_estimate_amount: None,
        };

        let result = MedicalDebtEngine::audit_claim(&claim);
        assert!(result.is_missing_statutory_validation_data);
        assert!(result
            .required_validation_demands
            .iter()
            .any(|d| d.contains("CMS-1500 or UB-04")));
        assert!(result
            .required_validation_demands
            .iter()
            .any(|d| d.contains("Unbroken chain of assignment")));
    }
}
