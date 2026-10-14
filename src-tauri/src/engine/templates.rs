use std::collections::HashMap;

/// Dispute Document Template Engine with Variable Token Interpolation (Section 4.4)
pub struct TemplateEngine;

impl TemplateEngine {
    /// Interpolate template tokens in format `{{TOKEN_KEY}}`
    pub fn interpolate(template: &str, values: &HashMap<&str, &str>) -> String {
        let mut output = template.to_string();
        for (key, val) in values {
            let token = format!("{{{{{}}}}}", key);
            output = output.replace(&token, val);
        }
        output
    }

    /// Pre-built template for Formal Debt Validation Demand (15 U.S.C. 1692g) - General
    pub fn dvl_template() -> &'static str {
        Self::medical_dvl_template()
    }

    /// Formal Debt Validation Demand for Medical Debt (FDCPA & No Surprises Act)
    pub fn medical_dvl_template() -> &'static str {
        r#"SENT VIA USPS CERTIFIED MAIL (TRACKING NO: {{CERTIFIED_MAIL_TRACKING}})
DATE: {{CURRENT_DATE}}

TO: {{COLLECTION_AGENCY}}
RE: FORMAL DEMAND FOR DEBT VALIDATION (15 U.S.C. § 1692g) & NO SURPRISES ACT AUDIT
ALLEGED ACCOUNT NO: {{COLLECTION_ACCOUNT_NO}}
ALLEGED ORIGINAL CREDITOR: {{ORIGINAL_PROVIDER}}
ALLEGED DISPUTED AMOUNT: {{DISPUTED_AMOUNT}}
DOCKET REFERENCE: {{BATES_DOCKET}}

To Whom It May Concern:

I am writing to formally dispute the validity of the alleged debt referenced above pursuant to the Fair Debt Collection Practices Act (FDCPA), 15 U.S.C. § 1692g, and applicable provisions of the No Surprises Act (Public Law 116-260).

Pursuant to federal law, you are required to immediately cease all collection activities—including telephone communications, correspondence, and credit bureau reporting—until your agency obtains and mails formal verification of this debt to me.

Demand is hereby made for:
1. Complete itemized clinical accounting statement detailing all medical charges, contractual adjustments, and insurance payments (including CPT and ICD-10 diagnosis codes).
2. Proof of compliance with the federal No Surprises Act prohibiting surprise out-of-network balance billing.
3. Verified, unbroken chain of title and legal assignment establishing your standing to collect.
4. Copy of the original executed financial responsibility agreement bearing the consumer's signature.
5. Verification of your active debt collection license and surety bond in this jurisdiction.

Sincerely,
{{DEBTOR_NAME}}"#
    }

    /// Formal Debt Validation Demand for Credit Card Debt & Purchased Portfolios (15 U.S.C. § 1692g & CFPB Reg F)
    pub fn credit_card_dvl_template() -> &'static str {
        r#"SENT VIA USPS CERTIFIED MAIL (TRACKING NO: {{CERTIFIED_MAIL_TRACKING}})
DATE: {{CURRENT_DATE}}

TO: {{COLLECTION_AGENCY}}
RE: FORMAL DEMAND FOR DEBT VALIDATION (15 U.S.C. § 1692g & CFPB REGULATION F, 12 C.F.R. PART 1006)
ALLEGED ACCOUNT NO: {{COLLECTION_ACCOUNT_NO}}
ALLEGED ORIGINAL CARD ISSUER: {{ORIGINAL_PROVIDER}}
ALLEGED DISPUTED BALANCE: {{DISPUTED_AMOUNT}}
DOCKET REFERENCE: {{BATES_DOCKET}}

To Whom It May Concern:

I am writing to formally dispute the validity of the alleged credit card debt referenced above in its entirety pursuant to the Fair Debt Collection Practices Act (FDCPA), 15 U.S.C. § 1692g, and CFPB Regulation F, 12 C.F.R. § 1006.34.

Pursuant to federal law, you are required to immediately cease all collection communications, letters, phone calls, and adverse reporting to consumer reporting agencies until your agency obtains and mails comprehensive statutory verification of this debt to me.

Demand is hereby made for the following evidentiary records:
1. Complete, unbroken chain of assignment from the original card issuer (including all bills of sale, purchase agreements, and assignment schedules specifically identifying this account) demonstrating your standing.
2. Complete periodic billing statements from $0 balance or date of charge-off establishing the accurate calculation of principal, interest, and late charges.
3. Itemized calculation pursuant to 12 C.F.R. § 1006.34 of all interest, late fees, collection costs, and post-charge-off additions, alongside all payments and credits applied.
4. The complete original cardholder agreement governing this account, including applicable terms in effect when the account was opened and at charge-off, with proof of consumer consent.
5. Proof of active debt collection license and bond number within this state of jurisdiction.

Failure to provide statutory verification or continued collection efforts prior to furnishing verification will be treated as willful violations of 15 U.S.C. § 1692g and § 1692e.

Sincerely,
{{DEBTOR_NAME}}"#
    }

    /// Formal Validation Demand for Auto Loan Deficiency (FDCPA & UCC Article 9)
    pub fn auto_deficiency_dvl_template() -> &'static str {
        r#"SENT VIA USPS CERTIFIED MAIL (TRACKING NO: {{CERTIFIED_MAIL_TRACKING}})
DATE: {{CURRENT_DATE}}

TO: {{COLLECTION_AGENCY}}
RE: DEMAND FOR DEFICIENCY VALIDATION (15 U.S.C. § 1692g & UCC ARTICLE 9)
ALLEGED ACCOUNT NO: {{COLLECTION_ACCOUNT_NO}}
ORIGINAL VEHICLE FINANCIER: {{ORIGINAL_PROVIDER}}
ALLEGED DEFICIENCY BALANCE: {{DISPUTED_AMOUNT}}
DOCKET REFERENCE: {{BATES_DOCKET}}

To Whom It May Concern:

I am writing to formally dispute the alleged vehicle loan deficiency balance pursuant to 15 U.S.C. § 1692g and Uniform Commercial Code (UCC) Article 9.

Pursuant to federal and state commercial laws, you must cease all collection activities until full verification and commercial reasonableness documentation is furnished.

Demand is hereby made for:
1. Complete original retail installment contract and promissory note bearing consumer signature.
2. Verified Notice of Intent to Dispose of Repossessed Vehicle and proof of timely postal delivery conforming to UCC § 9-611.
3. Complete itemized explanation and accounting of the post-sale deficiency balance conforming to UCC § 9-616, including gross sale proceeds, auction fees, storage costs, and calculation of rebates/credits.
4. Proof of commercially reasonable disposition of collateral pursuant to UCC § 9-610.
5. Complete chain of title and legal assignment from the original auto financing institution.

Sincerely,
{{DEBTOR_NAME}}"#
    }
}
