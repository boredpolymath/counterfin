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

    /// Pre-built template for Formal Debt Validation Demand (15 U.S.C. 1692g)
    pub fn dvl_template() -> &'static str {
        r#"SENT VIA USPS CERTIFIED MAIL (TRACKING NO: {{CERTIFIED_MAIL_TRACKING}})
DATE: {{CURRENT_DATE}}

TO: {{COLLECTION_AGENCY}}
RE: FORMAL DEMAND FOR DEBT VALIDATION (15 U.S.C. § 1692g)
ALLEGED ACCOUNT NO: {{COLLECTION_ACCOUNT_NO}}
ALLEGED ORIGINAL CREDITOR: {{ORIGINAL_PROVIDER}}
ALLEGED DISPUTED AMOUNT: {{DISPUTED_AMOUNT}}
DOCKET REFERENCE: {{BATES_DOCKET}}

To Whom It May Concern:

I am writing to formally dispute the validity of the alleged debt referenced above pursuant to the Fair Debt Collection Practices Act (FDCPA), 15 U.S.C. § 1692g.

Pursuant to federal law, you are required to immediately cease all collection activities—including telephone communications, correspondence, and credit bureau reporting—until your agency obtains and mails formal verification of this debt to me.

Demand is hereby made for:
1. Complete itemized clinical accounting breakdown.
2. Verified chain of title establishing legal assignment.
3. Original executed agreement bearing consumer signature.
4. Proof of active debt collection license within this jurisdiction.

Sincerely,
{{DEBTOR_NAME}}"#
    }
}
