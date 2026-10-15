use crate::engine::vault::{EvidenceVault, SandboxPaths};
use crate::error::{AppError, AppResult};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;

/// Dispute Document Template Engine with Variable Token Interpolation (Section 4.4 & 8.1)
pub struct TemplateEngine;

impl TemplateEngine {
    /// Extracts all variable token names contained in `{{...}}` syntax
    pub fn extract_tokens(template: &str) -> Vec<String> {
        let mut tokens = Vec::new();
        let mut cursor = 0;
        while let Some(start) = template[cursor..].find("{{") {
            let actual_start = cursor + start + 2;
            if let Some(end) = template[actual_start..].find("}}") {
                let actual_end = actual_start + end;
                let token_name = template[actual_start..actual_end].trim();
                if !token_name.is_empty() && !tokens.contains(&token_name.to_string()) {
                    tokens.push(token_name.to_string());
                }
                cursor = actual_end + 2;
            } else {
                break;
            }
        }
        tokens
    }

    /// Checks template syntax for malformed tokens:
    /// - Unclosed token (e.g. `{{TOKEN` without `}}`)
    /// - Nested or empty tokens `{{}}`
    /// - Orphaned closing token `}}`
    pub fn check_syntax(template: &str) -> AppResult<()> {
        let mut cursor = 0;
        while let Some(start_idx) = template[cursor..].find("{{") {
            let actual_start = cursor + start_idx;
            let rest = &template[actual_start + 2..];
            if let Some(end_idx) = rest.find("}}") {
                let token_name = rest[..end_idx].trim();
                if token_name.is_empty() {
                    return Err(AppError::Validation(
                        "Malformed template token syntax: empty token '{{}}' detected".to_string(),
                    ));
                }
                if token_name.contains("{{") {
                    return Err(AppError::Validation(
                        "Malformed template token syntax: nested or unclosed '{{' detected"
                            .to_string(),
                    ));
                }
                cursor = actual_start + 2 + end_idx + 2;
            } else {
                return Err(AppError::Validation(
                    "Malformed template token syntax: unclosed token '{{' without matching '}}'"
                        .to_string(),
                ));
            }
        }

        // Check for dangling orphaned '}}'
        let mut cursor = 0;
        while let Some(idx) = template[cursor..].find("}}") {
            let actual_idx = cursor + idx;
            if !template[..actual_idx].contains("{{") {
                return Err(AppError::Validation(
                    "Malformed template token syntax: orphaned closing '}}' without matching '{{'"
                        .to_string(),
                ));
            }
            cursor = actual_idx + 2;
        }

        Ok(())
    }

    /// Validates that all required tokens in template are provided and non-empty.
    /// Returns Err(AppError::Validation) detailing all missing or null tokens.
    pub fn validate_tokens(template: &str, values: &HashMap<&str, &str>) -> AppResult<()> {
        Self::check_syntax(template)?;
        let required = Self::extract_tokens(template);
        let mut missing = Vec::new();

        for key in &required {
            match values.get(key.as_str()) {
                Some(val) if !val.trim().is_empty() => {}
                _ => missing.push(key.clone()),
            }
        }

        if !missing.is_empty() {
            return Err(AppError::Validation(format!(
                "Template token validation failed: missing {} required token(s): [{}]",
                missing.len(),
                missing.join(", ")
            )));
        }

        Ok(())
    }

    /// Strict interpolation: validates template syntax and required tokens before rendering
    pub fn interpolate_strict(template: &str, values: &HashMap<&str, &str>) -> AppResult<String> {
        Self::validate_tokens(template, values)?;
        Ok(Self::interpolate(template, values))
    }

    /// Safe fallback interpolation: missing or empty tokens are replaced with `fallback` string
    pub fn interpolate_with_fallback(
        template: &str,
        values: &HashMap<&str, &str>,
        fallback: &str,
    ) -> String {
        let required = Self::extract_tokens(template);
        let mut output = template.to_string();

        for key in required {
            let token = format!("{{{{{}}}}}", key);
            let replacement = match values.get(key.as_str()) {
                Some(val) if !val.trim().is_empty() => *val,
                _ => fallback,
            };
            output = output.replace(&token, replacement);
        }

        output
    }

    /// Escapes HTML-sensitive characters to prevent Cross-Site Scripting (XSS)
    pub fn escape_html(input: &str) -> String {
        let mut escaped = String::with_capacity(input.len());
        for c in input.chars() {
            match c {
                '&' => escaped.push_str("&amp;"),
                '<' => escaped.push_str("&lt;"),
                '>' => escaped.push_str("&gt;"),
                '"' => escaped.push_str("&quot;"),
                '\'' => escaped.push_str("&#x27;"),
                _ => escaped.push(c),
            }
        }
        escaped
    }

    /// Detects if input contains potential script injection or HTML tags
    pub fn contains_xss_payload(input: &str) -> bool {
        let lower = input.to_lowercase();
        lower.contains("<script")
            || lower.contains("</script>")
            || lower.contains("<iframe")
            || lower.contains("<svg")
            || lower.contains("<img")
            || lower.contains("<body")
            || lower.contains("<input")
            || lower.contains("onerror=")
            || lower.contains("onload=")
            || lower.contains("onclick=")
            || lower.contains("javascript:")
            || lower.contains("data:text/html")
            || lower.contains("alert(")
    }

    /// Neutralizes dangerous executable script tags and attribute event handlers
    pub fn sanitize_input(input: &str) -> String {
        Self::escape_html(input)
    }

    /// Safe interpolation with automatic XSS escaping: all user token values
    /// are safely HTML-escaped before interpolation into the template
    pub fn interpolate_escaped(
        template: &str,
        values: &HashMap<&str, &str>,
        fallback: Option<&str>,
    ) -> String {
        let required = Self::extract_tokens(template);
        let mut output = template.to_string();
        let fallback_val = fallback.unwrap_or("[NOT PROVIDED]");

        for key in required {
            let token = format!("{{{{{}}}}}", key);
            let raw_val = match values.get(key.as_str()) {
                Some(val) if !val.trim().is_empty() => *val,
                _ => fallback_val,
            };
            let escaped_val = Self::escape_html(raw_val);
            output = output.replace(&token, &escaped_val);
        }

        output
    }

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

    /// Limited Cease and Desist Demand (15 U.S.C. § 1692c(c))
    pub fn limited_cease_and_desist_template() -> &'static str {
        r#"SENT VIA USPS CERTIFIED MAIL (TRACKING NO: {{CERTIFIED_MAIL_TRACKING}})
DATE: {{CURRENT_DATE}}

TO: {{COLLECTION_AGENCY}}
RE: FORMAL LIMITED CEASE AND DESIST NOTICE (15 U.S.C. § 1692c(c))
ALLEGED ACCOUNT NO: {{COLLECTION_ACCOUNT_NO}}
ALLEGED CREDITOR: {{ORIGINAL_PROVIDER}}
DOCKET REFERENCE: {{BATES_DOCKET}}

To Whom It May Concern:

Pursuant to my rights under the Fair Debt Collection Practices Act (FDCPA), 15 U.S.C. § 1692c(c), I hereby formally demand that you immediately CEASE AND DESIST all further communication with me regarding the alleged debt referenced above, subject ONLY to the strict statutory exceptions provided below.

Specifically:
1. You and your representatives are strictly prohibited from contacting me via telephone, cellular device, text message (SMS), facsimile, email, or digital messaging platform.
2. You and your representatives are strictly prohibited from contacting my place of employment, employer, coworkers, family members, or any third parties (15 U.S.C. § 1692c(b)).
3. All future communication from your agency must be conducted EXCLUSIVELY in writing and dispatched via physical USPS mail to my mailing address on file.

Under 15 U.S.C. § 1692c(c), after receipt of this notice, you may only contact me by written mail for the sole purpose of:
(1) Advising me that your further efforts are being terminated;
(2) Notifying me that you or the creditor may invoke specified remedies ordinarily invoked; or
(3) Where applicable, notifying me that you or the creditor intend to invoke a specified remedy.

Any non-conforming communication, phone call, or third-party contact following delivery of this notice constitutes a willful statutory violation of 15 U.S.C. § 1692c, entitling the consumer to statutory damages of up to $1,000 per violation, actual damages, and attorney's fees pursuant to 15 U.S.C. § 1692k.

Sincerely,
{{DEBTOR_NAME}}"#
    }

    /// Credit Bureau Direct Dispute Package (FCRA 15 U.S.C. § 1681i & § 1681s-2)
    pub fn cra_dispute_template() -> &'static str {
        r#"SENT VIA USPS CERTIFIED MAIL (TRACKING NO: {{CERTIFIED_MAIL_TRACKING}})
DATE: {{CURRENT_DATE}}

TO: CONSUMER REPORTING DISPUTE DEPARTMENT
RE: FORMAL CONSUMER DISPUTE & AUDIT DEMAND (FCRA 15 U.S.C. § 1681i & § 1681s-2)
ALLEGED ACCOUNT NO: {{COLLECTION_ACCOUNT_NO}}
REPORTING COLLECTION AGENCY: {{COLLECTION_AGENCY}}
ORIGINAL CREDITOR: {{ORIGINAL_PROVIDER}}
ALLEGED BALANCE: {{DISPUTED_AMOUNT}}
DOCKET REFERENCE: {{BATES_DOCKET}}

Dear Dispute Resolution Officer:

I am writing pursuant to Section 611 of the Fair Credit Reporting Act (FCRA), 15 U.S.C. § 1681i, to formally dispute the completeness and accuracy of the collection tradeline reported on my credit file by {{COLLECTION_AGENCY}}.

I have formally requested debt verification and proof of legal standing from {{COLLECTION_AGENCY}} pursuant to 15 U.S.C. § 1692g. The agency has failed to provide verified documentation substantiating this alleged debt, yet continues to furnish inaccurate, unverified, and derogatory trade line information to your bureau in violation of FCRA § 623(a)(3) and FDCPA § 1692e(8).

Demand is hereby made that your bureau:
1. Conduct a prompt and thorough independent reinvestigation of this disputed tradeline pursuant to 15 U.S.C. § 1681i(a)(1).
2. Forward all relevant documentation and dispute grounds to the furnisher pursuant to 15 U.S.C. § 1681i(a)(2).
3. Immediately update the trade line to clearly note: "ACCOUNT IN DISPUTE BY CONSUMER" pursuant to FCRA § 623(a)(3).
4. In the event the furnisher fails to verify the accuracy of the disputed item within the mandatory 30-day statutory investigation period, permanently delete this derogatory tradeline from my credit file pursuant to 15 U.S.C. § 1681i(a)(5)(A).

Please furnish written confirmation of the results of your reinvestigation and a free copy of my updated consumer report upon conclusion.

Sincerely,
{{DEBTOR_NAME}}"#
    }

    /// CFPB Regulatory Formal Complaint Narrative
    pub fn cfpb_complaint_template() -> &'static str {
        r#"FORMAL REGULATORY COMPLAINT NARRATIVE
AGENCY: CONSUMER FINANCIAL PROTECTION BUREAU (CFPB)
DATE OF SUBMISSION: {{CURRENT_DATE}}
RESPONDENT ENTITY: {{COLLECTION_AGENCY}}
ALLEGED ORIGINAL CREDITOR: {{ORIGINAL_PROVIDER}}
ALLEGED ACCOUNT NUMBER: {{COLLECTION_ACCOUNT_NO}}
DISPUTED SUM: {{DISPUTED_AMOUNT}}
CONSUMER COMPLAINANT: {{DEBTOR_NAME}}
EVIDENTIARY DOCKET: {{BATES_DOCKET}}

I. FACTUAL BACKGROUND & PROCEDURAL HISTORY
On or about {{CURRENT_DATE}}, the consumer received collection communications from {{COLLECTION_AGENCY}} concerning an alleged consumer debt originating from {{ORIGINAL_PROVIDER}}.

The consumer timely served a formal Debt Validation Demand pursuant to 15 U.S.C. § 1692g via USPS Certified Mail (Tracking No: {{CERTIFIED_MAIL_TRACKING}}). Despite receipt, {{COLLECTION_AGENCY}} failed to provide competent statutory verification, including failure to establish chain of assignment, detailed itemization, and proof of license within the consumer's jurisdiction.

II. STATUTORY VIOLATIONS OF FEDERAL LAW
1. 15 U.S.C. § 1692g(b) — Continued collection activity prior to mailing verification of debt.
2. 15 U.S.C. § 1692e(2)(A) & § 1692e(8) — False representation of the character, amount, or legal status of the debt, and failure to communicate that a disputed debt is disputed.
3. 12 C.F.R. § 1006.34 (CFPB Regulation F) — Failure to furnish mandatory validation notice itemization of interest, fees, payments, and post-charge-off additions.

III. PRAYER FOR REGULATORY ENFORCEMENT & CONSUMER RELIEF
The complainant respectfully requests that the CFPB:
1. Direct {{COLLECTION_AGENCY}} to immediately cease all unlawful collection actions.
2. Require immediate deletion of all derogatory reporting from consumer reporting agencies.
3. Investigate systemic non-compliance with CFPB Regulation F itemization requirements.

Submitted Under Penalty of Unsworn Falsification:
{{DEBTOR_NAME}}"#
    }

    /// Pay-For-Delete Settlement Offer & Dismissal Demand (Rule 408 Inadmissible)
    pub fn pay_for_delete_template() -> &'static str {
        r#"SENT VIA USPS CERTIFIED MAIL (TRACKING NO: {{CERTIFIED_MAIL_TRACKING}})
DATE: {{CURRENT_DATE}}

TO: SETTLEMENT & COMPLIANCE DEPARTMENT
ENTITY: {{COLLECTION_AGENCY}}
RE: CONDITIONAL SETTLEMENT & FULL TRADELINE DELETION PROPOSAL (INADMISSIBLE RULE 408 SETTLEMENT COMMUNICATION)
ALLEGED ACCOUNT NO: {{COLLECTION_ACCOUNT_NO}}
ALLEGED CREDITOR: {{ORIGINAL_PROVIDER}}
ALLEGED BALANCE: {{DISPUTED_AMOUNT}}
DOCKET REFERENCE: {{BATES_DOCKET}}

To Authorized Settlement Counsel or Officer:

This letter constitutes a confidential settlement offer made pursuant to Federal Rule of Evidence 408 (and corresponding state evidentiary codes). This letter does NOT constitute an admission of liability, validity, or ownership of the alleged debt referenced above.

Without prejudice to any statutory claims or defenses under the FDCPA and FCRA, the consumer proposes a mutually agreeable compromised settlement under the following strict terms and conditions:

TERMS OF SETTLEMENT:
1. Compromised Settlement Sum: The consumer will pay the agreed compromised amount of {{DISPUTED_AMOUNT}} via certified cashier's check or money order upon receipt of your executed counterpart of this agreement.
2. Full and Final Satisfaction: The agreed payment shall constitute full, final, and complete satisfaction of the alleged account with zero remaining balance.
3. Complete Bureau Deletion: {{COLLECTION_AGENCY}} agrees to request the complete and permanent deletion of the tradeline associated with this account from all three nationwide consumer reporting agencies (Equifax, Experian, TransUnion) within ten (10) business days of receiving the settlement funds.
4. Prohibition on Secondary Assignment: {{COLLECTION_AGENCY}} covenants and warrants that it will not sell, assign, transfer, or refer any remaining balance or portion of this account to any other debt collector, purchaser, or servicer.
5. Mutual Release & Confidentiality: The parties mutually release all claims arising from this account, and both parties agree to maintain the strict confidentiality of this agreement.

If these terms are acceptable, please return an executed copy of this agreement on your official corporate letterhead signed by an authorized officer.

Respectfully submitted,
{{DEBTOR_NAME}}"#
    }
}

/// Supported export formats for legal dispute packages (Section 4.4.3)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ExportFormat {
    Txt,
    Markdown,
    Pdf,
}

impl ExportFormat {
    pub fn extension(&self) -> &'static str {
        match self {
            ExportFormat::Txt => "txt",
            ExportFormat::Markdown => "md",
            ExportFormat::Pdf => "pdf",
        }
    }

    pub fn mime_type(&self) -> &'static str {
        match self {
            ExportFormat::Txt => "text/plain",
            ExportFormat::Markdown => "text/markdown",
            ExportFormat::Pdf => "application/pdf",
        }
    }
}

/// Evidentiary Document Exporter generating court-admissible legal files
pub struct DocumentExporter;

impl DocumentExporter {
    /// Generates structured plain text with Bates docket and statutory notice banners
    pub fn generate_txt(docket_number: &str, title: &str, content: &str) -> String {
        format!(
            "================================================================================\n{}\nBATES DOCKET: {}\n================================================================================\n\n{}\n\n================================================================================\nSTATUTORY NOTICE: Formal Legal Dispute Demand (15 U.S.C. § 1692g & CFPB Reg F)\n================================================================================\n",
            title.to_uppercase(),
            docket_number,
            content
        )
    }

    /// Generates structured Markdown with Bates metadata block and statutory notice quote
    pub fn generate_markdown(docket_number: &str, title: &str, content: &str) -> String {
        format!(
            "# {}\n\n**BATES DOCKET:** `{}`  \n**DATE OF ISSUANCE:** October 15, 2026\n\n---\n\n{}\n\n---\n\n> **STATUTORY NOTICE:** This document constitutes a formal evidentiary dispute demand pursuant to 15 U.S.C. § 1692g and CFPB Regulation F, 12 C.F.R. Part 1006.\n",
            title, docket_number, content
        )
    }

    /// Generates court-ready PDF-1.4 with 1-inch margins (72pt), Bates watermark header, and statutory notice footer
    pub fn generate_pdf(docket_number: &str, _title: &str, content: &str) -> Vec<u8> {
        let safe_docket = docket_number.replace(['(', ')', '\\'], "");
        let safe_content = content.replace(['(', ')', '\\'], "");

        let mut stream_content = String::new();
        stream_content.push_str("BT\n");
        stream_content.push_str("/F1 9 Tf\n");
        // Bates Watermark / Header (1-inch from top: Y=740pt, Left: 72pt)
        stream_content.push_str(&format!(
            "72 740 Td\n(BATES DOCKET WATERMARK: {}) Tj\n",
            safe_docket
        ));

        // 1-inch margins (Left: 72pt, Top: 700pt)
        stream_content.push_str("/F1 10 Tf\n");
        stream_content.push_str("0 -40 Td\n");

        for line in safe_content.lines().take(40) {
            let clean_line = line.trim();
            if !clean_line.is_empty() {
                stream_content.push_str(&format!("({}) Tj\n", clean_line));
            }
            stream_content.push_str("0 -14 Td\n");
        }

        // Statutory notice embedding at bottom margin (1-inch from bottom: Y=72pt, Left: 72pt)
        stream_content.push_str("ET\nBT\n/F1 8 Tf\n");
        stream_content.push_str("72 72 Td\n");
        stream_content.push_str("(STATUTORY NOTICE: 15 U.S.C. § 1692g / CFPB Reg F Evidentiary Demand. Local-first Advocacy.) Tj\n");
        stream_content.push_str("ET\n");

        let stream_bytes = stream_content.as_bytes();
        let stream_len = stream_bytes.len();

        let obj1 = "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";
        let obj2 = "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n";
        let obj3 = "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n";
        let obj4 = "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n";
        let obj5 = format!(
            "5 0 obj\n<< /Length {} >>\nstream\n{}\nendstream\nendobj\n",
            stream_len, stream_content
        );

        let mut pdf = Vec::new();
        pdf.extend_from_slice(b"%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");
        let offset1 = pdf.len();
        pdf.extend_from_slice(obj1.as_bytes());
        let offset2 = pdf.len();
        pdf.extend_from_slice(obj2.as_bytes());
        let offset3 = pdf.len();
        pdf.extend_from_slice(obj3.as_bytes());
        let offset4 = pdf.len();
        pdf.extend_from_slice(obj4.as_bytes());
        let offset5 = pdf.len();
        pdf.extend_from_slice(obj5.as_bytes());
        let xref_offset = pdf.len();

        let xref = format!(
            "xref\n0 6\n0000000000 65535 f \n{:010} 00000 n \n{:010} 00000 n \n{:010} 00000 n \n{:010} 00000 n \n{:010} 00000 n \n",
            offset1, offset2, offset3, offset4, offset5
        );
        pdf.extend_from_slice(xref.as_bytes());
        let trailer = format!(
            "trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n{}\n%%EOF\n",
            xref_offset
        );
        pdf.extend_from_slice(trailer.as_bytes());

        pdf
    }

    /// Exports document into sandboxed letters directory with containment verification
    pub fn export_to_sandbox(
        sandbox: &SandboxPaths,
        docket_number: &str,
        title: &str,
        content: &str,
        format: ExportFormat,
    ) -> AppResult<PathBuf> {
        sandbox.create_all()?;
        let safe_docket = EvidenceVault::sanitize_filename(docket_number)?;
        let safe_title = EvidenceVault::sanitize_filename(title)?;
        let filename = format!("{}_{}.{}", safe_docket, safe_title, format.extension());
        let target_path = sandbox.letters_dir.join(&filename);
        EvidenceVault::validate_sandbox_containment(&sandbox.base_dir, &target_path)?;

        match format {
            ExportFormat::Pdf => {
                let bytes = Self::generate_pdf(&safe_docket, &safe_title, content);
                std::fs::write(&target_path, bytes)?;
            }
            ExportFormat::Markdown => {
                let md = Self::generate_markdown(&safe_docket, &safe_title, content);
                std::fs::write(&target_path, md.as_bytes())?;
            }
            ExportFormat::Txt => {
                let txt = Self::generate_txt(&safe_docket, &safe_title, content);
                std::fs::write(&target_path, txt.as_bytes())?;
            }
        }

        Ok(target_path)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_all_seven_templates_token_resolution() {
        let mut tokens = HashMap::new();
        tokens.insert("CERTIFIED_MAIL_TRACKING", "7021 0950 0001 9841 3320");
        tokens.insert("CURRENT_DATE", "October 15, 2026");
        tokens.insert("COLLECTION_AGENCY", "Midland Credit Management, Inc.");
        tokens.insert("COLLECTION_ACCOUNT_NO", "MCM-99214-B");
        tokens.insert("ORIGINAL_PROVIDER", "Citibank, N.A.");
        tokens.insert("DISPUTED_AMOUNT", "$3,420.00");
        tokens.insert("BATES_DOCKET", "BATES-SM-2026-0041");
        tokens.insert("DEBTOR_NAME", "Sarah Henderson");

        let all_templates = [
            TemplateEngine::medical_dvl_template(),
            TemplateEngine::credit_card_dvl_template(),
            TemplateEngine::auto_deficiency_dvl_template(),
            TemplateEngine::limited_cease_and_desist_template(),
            TemplateEngine::cra_dispute_template(),
            TemplateEngine::cfpb_complaint_template(),
            TemplateEngine::pay_for_delete_template(),
        ];

        for (idx, tmpl) in all_templates.iter().enumerate() {
            let interpolated = TemplateEngine::interpolate(tmpl, &tokens);

            // Assert 100% token resolution with zero unparsed {{...}} placeholders
            assert!(
                !interpolated.contains("{{"),
                "Template {} contains unparsed opening token: {}",
                idx,
                interpolated
            );
            assert!(
                !interpolated.contains("}}"),
                "Template {} contains unparsed closing token: {}",
                idx,
                interpolated
            );

            // Assert key interpolated values exist
            assert!(interpolated.contains("Sarah Henderson"));
            assert!(interpolated.contains("Midland Credit Management, Inc."));
            assert!(interpolated.contains("7021 0950 0001 9841 3320"));
        }
    }

    #[test]
    fn test_missing_and_malformed_token_fallback_and_validation() {
        let template = TemplateEngine::medical_dvl_template();

        // 1. Token extraction validation
        let required_tokens = TemplateEngine::extract_tokens(template);
        assert!(required_tokens.contains(&"CERTIFIED_MAIL_TRACKING".to_string()));
        assert!(required_tokens.contains(&"CURRENT_DATE".to_string()));
        assert!(required_tokens.contains(&"COLLECTION_AGENCY".to_string()));
        assert!(required_tokens.contains(&"COLLECTION_ACCOUNT_NO".to_string()));
        assert!(required_tokens.contains(&"ORIGINAL_PROVIDER".to_string()));
        assert!(required_tokens.contains(&"DISPUTED_AMOUNT".to_string()));
        assert!(required_tokens.contains(&"BATES_DOCKET".to_string()));
        assert!(required_tokens.contains(&"DEBTOR_NAME".to_string()));

        // 2. Missing required tokens in strict mode
        let mut incomplete_tokens = HashMap::new();
        incomplete_tokens.insert("CURRENT_DATE", "October 15, 2026");
        incomplete_tokens.insert("COLLECTION_AGENCY", "Apex Receivables LLC");
        // Missing DEBTOR_NAME, DISPUTED_AMOUNT, CERTIFIED_MAIL_TRACKING, etc.

        let strict_res = TemplateEngine::interpolate_strict(template, &incomplete_tokens);
        assert!(
            strict_res.is_err(),
            "Strict interpolation must fail when required tokens are missing"
        );
        match strict_res {
            Err(AppError::Validation(msg)) => {
                assert!(msg.contains("Template token validation failed"));
                assert!(msg.contains("DEBTOR_NAME"));
                assert!(msg.contains("DISPUTED_AMOUNT"));
            }
            other => panic!("Expected AppError::Validation, got {:?}", other),
        }

        // 3. Null / whitespace empty tokens in strict mode
        let mut whitespace_tokens = incomplete_tokens.clone();
        whitespace_tokens.insert("DEBTOR_NAME", "   ");
        whitespace_tokens.insert("DISPUTED_AMOUNT", "\t\n ");
        let whitespace_res = TemplateEngine::interpolate_strict(template, &whitespace_tokens);
        assert!(
            whitespace_res.is_err(),
            "Whitespace-only tokens must be treated as missing/invalid"
        );

        // 4. Safe fallback interpolation with default placeholder
        let fallback_output = TemplateEngine::interpolate_with_fallback(
            template,
            &incomplete_tokens,
            "[NOT PROVIDED]",
        );

        // Assert no unparsed {{...}} tags remain
        assert!(!fallback_output.contains("{{"));
        assert!(!fallback_output.contains("}}"));

        // Assert provided tokens resolved
        assert!(fallback_output.contains("Apex Receivables LLC"));
        assert!(fallback_output.contains("October 15, 2026"));

        // Assert missing tokens received safe fallback
        assert!(fallback_output.contains("[NOT PROVIDED]"));

        // 5. Custom fallback interpolation
        let custom_fallback = TemplateEngine::interpolate_with_fallback(
            template,
            &incomplete_tokens,
            "PENDING_INVESTIGATION",
        );
        assert!(custom_fallback.contains("PENDING_INVESTIGATION"));
        assert!(!custom_fallback.contains("[NOT PROVIDED]"));
        assert!(!custom_fallback.contains("{{"));

        // 6. Malformed template syntax detection
        // Unclosed token {{TOKEN without }}
        let unclosed = "Dear {{COLLECTION_AGENCY, please cease all contact.";
        let mut valid_tokens = HashMap::new();
        valid_tokens.insert("COLLECTION_AGENCY", "Debt Collector Corp");
        let unclosed_res = TemplateEngine::interpolate_strict(unclosed, &valid_tokens);
        assert!(unclosed_res.is_err());
        match unclosed_res {
            Err(AppError::Validation(msg)) => {
                assert!(msg.contains("unclosed token '{{'"));
            }
            other => panic!("Expected unclosed token validation error, got {:?}", other),
        }

        // Empty token {{}}
        let empty_token = "Reference Docket: {{}} Account: {{ACC}}";
        let mut acc_tokens = HashMap::new();
        acc_tokens.insert("ACC", "12345");
        let empty_res = TemplateEngine::interpolate_strict(empty_token, &acc_tokens);
        assert!(empty_res.is_err());
        match empty_res {
            Err(AppError::Validation(msg)) => {
                assert!(msg.contains("empty token '{{}}'"));
            }
            other => panic!("Expected empty token validation error, got {:?}", other),
        }

        // Nested unclosed token {{FOO {{BAR}}
        let nested_token = "Notice for {{FOO {{BAR}} now.";
        let nested_res = TemplateEngine::interpolate_strict(nested_token, &valid_tokens);
        assert!(nested_res.is_err());

        // Orphaned closing token without matching {{
        let orphaned_closing = "Notice regarding account }} balance.";
        let orphaned_res = TemplateEngine::interpolate_strict(orphaned_closing, &valid_tokens);
        assert!(orphaned_res.is_err());
    }

    #[test]
    fn test_template_xss_and_script_injection_prevention() {
        // 1. HTML character escaping verification
        let raw_payload = "<script>alert('XSS & Cookie Theft')</script>";
        let escaped = TemplateEngine::escape_html(raw_payload);
        assert_eq!(
            escaped,
            "&lt;script&gt;alert(&#x27;XSS &amp; Cookie Theft&#x27;)&lt;/script&gt;"
        );
        assert!(!escaped.contains('<'));
        assert!(!escaped.contains('>'));
        assert!(!escaped.contains('\''));

        // 2. Detection of dangerous XSS payloads
        let malicious_vectors = [
            "<script>alert(1)</script>",
            "<img src=x onerror=alert('pwn')>",
            "<iframe src=\"javascript:alert(1)\"></iframe>",
            "<svg/onload=alert(1)>",
            "javascript:void(0)",
            "data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==",
            "<body onload=alert('exploit')>",
            "<input autofocus onfocus=alert(1)>",
        ];

        for vector in malicious_vectors {
            assert!(
                TemplateEngine::contains_xss_payload(vector),
                "Vector '{}' should have been flagged as potential XSS payload",
                vector
            );
        }

        // 3. Interpolation with XSS payloads into template
        let template = TemplateEngine::credit_card_dvl_template();
        let mut tokens = HashMap::new();
        tokens.insert("CERTIFIED_MAIL_TRACKING", "7021 0950 0001 9841 3320");
        tokens.insert("CURRENT_DATE", "October 15, 2026");
        tokens.insert("COLLECTION_AGENCY", "<script>alert('Compromised')</script>");
        tokens.insert("COLLECTION_ACCOUNT_NO", "MCM-12345\" onfocus=\"alert(1)");
        tokens.insert("ORIGINAL_PROVIDER", "Citibank <iframe src=x></iframe>");
        tokens.insert(
            "DISPUTED_AMOUNT",
            "$5,000.00<img src=x onerror=alert('steal')>",
        );
        tokens.insert("BATES_DOCKET", "BATES-0001<svg/onload=alert(1)>");
        tokens.insert(
            "DEBTOR_NAME",
            "Jane Doe & Co. <script src='http://evil.com/xss.js'></script>",
        );

        let escaped_doc = TemplateEngine::interpolate_escaped(template, &tokens, None);

        // Strict assertions: NO raw HTML/script tags in the output
        assert!(!escaped_doc.contains("<script"));
        assert!(!escaped_doc.contains("</script>"));
        assert!(!escaped_doc.contains("<iframe"));
        assert!(!escaped_doc.contains("<img"));
        assert!(!escaped_doc.contains("<svg"));
        assert!(!escaped_doc.contains("\" onfocus=\""));

        // Assert escaped entities exist
        assert!(
            escaped_doc.contains("&lt;script&gt;alert(&#x27;Compromised&#x27;)&lt;/script&gt;")
        );
        assert!(escaped_doc.contains("MCM-12345&quot; onfocus=&quot;alert(1)"));
        assert!(escaped_doc.contains("&lt;iframe src=x&gt;&lt;/iframe&gt;"));
        assert!(escaped_doc.contains("&lt;img src=x onerror=alert(&#x27;steal&#x27;)&gt;"));
        assert!(escaped_doc.contains("&lt;svg/onload=alert(1)&gt;"));
        assert!(escaped_doc.contains("Jane Doe &amp; Co. &lt;script src=&#x27;http://evil.com/xss.js&#x27;&gt;&lt;/script&gt;"));

        // 4. Sanitize input method
        let sanitized = TemplateEngine::sanitize_input("<script>alert('test')</script>");
        assert_eq!(
            sanitized,
            "&lt;script&gt;alert(&#x27;test&#x27;)&lt;/script&gt;"
        );
    }

    #[test]
    fn test_multi_format_export_pipeline_verification() {
        let temp_dir =
            std::env::temp_dir().join(format!("settlemint_export_test_{}", uuid::Uuid::new_v4()));
        let sandbox = EvidenceVault::build_sandbox_paths(&temp_dir);
        sandbox
            .create_all()
            .expect("Failed to create sandbox hierarchy");

        let docket = "BATES-2026-00042";
        let title = "Formal Dispute Demand";
        let content =
            "Please validate alleged credit card balance of $3,420.00 pursuant to 15 U.S.C. 1692g.";

        // 1. Plain Text (.txt) Export
        let txt_path = DocumentExporter::export_to_sandbox(
            &sandbox,
            docket,
            title,
            content,
            ExportFormat::Txt,
        )
        .expect("Txt export failed");

        assert!(txt_path.exists());
        assert_eq!(txt_path.extension().and_then(|s| s.to_str()), Some("txt"));
        assert!(txt_path.starts_with(&sandbox.letters_dir));

        let txt_content = std::fs::read_to_string(&txt_path).unwrap();
        assert!(txt_content.contains("BATES DOCKET: BATES-2026-00042"));
        assert!(txt_content.contains("FORMAL DISPUTE DEMAND"));
        assert!(txt_content.contains("STATUTORY NOTICE: Formal Legal Dispute Demand"));
        assert!(txt_content.contains(content));

        // 2. Markdown (.md) Export
        let md_path = DocumentExporter::export_to_sandbox(
            &sandbox,
            docket,
            title,
            content,
            ExportFormat::Markdown,
        )
        .expect("Markdown export failed");

        assert!(md_path.exists());
        assert_eq!(md_path.extension().and_then(|s| s.to_str()), Some("md"));
        assert!(md_path.starts_with(&sandbox.letters_dir));

        let md_content = std::fs::read_to_string(&md_path).unwrap();
        assert!(md_content.contains("# Formal Dispute Demand"));
        assert!(md_content.contains("**BATES DOCKET:** `BATES-2026-00042`"));
        assert!(md_content.contains("> **STATUTORY NOTICE:**"));
        assert!(md_content.contains(content));

        // 3. Court-Ready PDF-1.4 (.pdf) Export
        let pdf_path = DocumentExporter::export_to_sandbox(
            &sandbox,
            docket,
            title,
            content,
            ExportFormat::Pdf,
        )
        .expect("PDF export failed");

        assert!(pdf_path.exists());
        assert_eq!(pdf_path.extension().and_then(|s| s.to_str()), Some("pdf"));
        assert!(pdf_path.starts_with(&sandbox.letters_dir));

        let pdf_bytes = std::fs::read(&pdf_path).unwrap();
        let pdf_str = String::from_utf8_lossy(&pdf_bytes);

        // Assert valid PDF-1.4 binary structure
        assert!(pdf_bytes.starts_with(b"%PDF-1.4"));
        assert!(pdf_str.contains("%%EOF"));
        assert!(pdf_str.contains("/Type /Catalog"));
        assert!(pdf_str.contains("/Type /Pages"));
        assert!(pdf_str.contains("/Type /Page"));

        // Assert 1-inch margins (US Letter MediaBox [0 0 612 792])
        assert!(
            pdf_str.contains("/MediaBox [0 0 612 792]"),
            "Must set standard 8.5x11 in geometry"
        );

        // Assert Bates watermark header positioning (72 740 Td)
        assert!(
            pdf_str.contains("72 740 Td"),
            "Bates watermark must be positioned 1 inch from top margin"
        );
        assert!(pdf_str.contains("BATES DOCKET WATERMARK: BATES-2026-00042"));

        // Assert 1-inch top margin start (0 -40 Td from 740 is 700)
        assert!(
            pdf_str.contains("0 -40 Td"),
            "Text body must respect 1-inch top margin"
        );

        // Assert statutory notice embedding at 1-inch bottom margin (72 72 Td)
        assert!(
            pdf_str.contains("72 72 Td"),
            "Statutory notice must be embedded 1 inch from bottom margin"
        );
        assert!(pdf_str.contains("STATUTORY NOTICE: 15 U.S.C."));

        // Assert cross-reference table and trailer
        assert!(pdf_str.contains("xref"));
        assert!(pdf_str.contains("trailer"));

        // 4. Sandbox traversal security: malicious docket names must be rejected
        let traversal_res = DocumentExporter::export_to_sandbox(
            &sandbox,
            "../../escaped_docket",
            title,
            content,
            ExportFormat::Txt,
        );
        assert!(
            traversal_res.is_err(),
            "Path traversal in docket name must be rejected"
        );

        let _ = std::fs::remove_dir_all(&temp_dir);
    }

    #[test]
    fn test_character_encoding_and_internationalization() {
        // 1. Diverse international consumer names and legal/currency symbols
        let consumer_name = "José Ramón García-Núñez";
        let co_debtor = "Renée Hélène DuPont & Zoë Müller";
        let legal_statutes = "15 U.S.C. § 1692g, 15 U.S.C. §§ 1692e & 1692f, ¶ 4";
        let copyright_notice = "Copyright © 2026 SettleMint™ • All Rights Reserved";
        let multi_currency_amounts = "USD $3,450.75 | EUR €3,120.50 | GBP £2,680.00 | JPY ¥480,000";

        // 2. Validate HTML escaping retains all UTF-8 characters without corruption
        let escaped_name = TemplateEngine::escape_html(consumer_name);
        assert_eq!(
            escaped_name, "José Ramón García-Núñez",
            "Accented characters must not be corrupted"
        );

        let escaped_legal = TemplateEngine::escape_html(legal_statutes);
        assert_eq!(
            escaped_legal, "15 U.S.C. § 1692g, 15 U.S.C. §§ 1692e &amp; 1692f, ¶ 4",
            "Legal symbols (§, ¶) must be preserved while ampersand is safely escaped"
        );

        let escaped_copyright = TemplateEngine::escape_html(copyright_notice);
        assert_eq!(
            escaped_copyright, "Copyright © 2026 SettleMint™ • All Rights Reserved",
            "Copyright symbol and typographic bullet must be preserved"
        );

        let escaped_currency = TemplateEngine::escape_html(multi_currency_amounts);
        assert_eq!(
            escaped_currency, "USD $3,450.75 | EUR €3,120.50 | GBP £2,680.00 | JPY ¥480,000",
            "Multi-currency symbols ($, €, £, ¥) must be preserved"
        );

        // 3. Interpolation across template with full UTF-8 preservation
        let template = TemplateEngine::medical_dvl_template();
        let mut tokens = HashMap::new();
        tokens.insert("CERTIFIED_MAIL_TRACKING", "9400 1118 9956 1234 5678 90");
        tokens.insert("CURRENT_DATE", "15 de Octubre de 2026");
        tokens.insert("COLLECTION_AGENCY", "Midland Credit Management, Inc.");
        tokens.insert("COLLECTION_ACCOUNT_NO", "MED-ES-98765-Ñ");
        tokens.insert("ORIGINAL_PROVIDER", "Hospital Ángeles & Clinique Santé");
        tokens.insert("DISPUTED_AMOUNT", multi_currency_amounts);
        tokens.insert("BATES_DOCKET", "BATES-2026-I18N-001");
        tokens.insert("DEBTOR_NAME", consumer_name);

        let rendered = TemplateEngine::interpolate(template, &tokens);
        assert!(rendered.contains("José Ramón García-Núñez"));
        assert!(rendered.contains("Hospital Ángeles & Clinique Santé"));
        assert!(rendered.contains("MED-ES-98765-Ñ"));
        assert!(rendered.contains("USD $3,450.75 | EUR €3,120.50 | GBP £2,680.00 | JPY ¥480,000"));
        assert!(rendered.contains("15 de Octubre de 2026"));
        assert!(rendered.contains("BATES-2026-I18N-001"));

        // 4. Safe Escaped Interpolation retains UTF-8 characters and escapes HTML &
        let escaped_rendered = TemplateEngine::interpolate_escaped(template, &tokens, None);
        assert!(escaped_rendered.contains("José Ramón García-Núñez"));
        assert!(escaped_rendered.contains("Hospital Ángeles &amp; Clinique Santé"));
        assert!(
            escaped_rendered
                .contains("USD $3,450.75 | EUR €3,120.50 | GBP £2,680.00 | JPY ¥480,000")
        );

        // 5. Multi-format export pipeline UTF-8 preservation (.txt, .md, .pdf)
        let temp_dir =
            std::env::temp_dir().join(format!("settlemint_i18n_test_{}", uuid::Uuid::new_v4()));
        let sandbox = EvidenceVault::build_sandbox_paths(&temp_dir);
        sandbox
            .create_all()
            .expect("Failed to create sandbox paths");

        let docket = "BATES-2026-I18N-001";
        let title = "Reclamación Formal de Validación";
        let body = format!(
            "Consumidor: {}\nCo-Deudor: {}\nDisposiciones: {}\nNotificación: {}\nMontos: {}",
            consumer_name, co_debtor, legal_statutes, copyright_notice, multi_currency_amounts
        );

        // Export TXT
        let txt_path =
            DocumentExporter::export_to_sandbox(&sandbox, docket, title, &body, ExportFormat::Txt)
                .expect("Export TXT failed");
        let txt_read = std::fs::read_to_string(&txt_path).expect("Read TXT failed");
        assert!(txt_read.contains("RECLAMACIÓN FORMAL DE VALIDACIÓN"));
        assert!(txt_read.contains(consumer_name));
        assert!(txt_read.contains(co_debtor));
        assert!(txt_read.contains("§ 1692g"));
        assert!(txt_read.contains("§§ 1692e"));
        assert!(txt_read.contains("¶ 4"));
        assert!(txt_read.contains("© 2026"));
        assert!(txt_read.contains("€3,120.50"));
        assert!(txt_read.contains("£2,680.00"));
        assert!(txt_read.contains("¥480,000"));

        // Export Markdown
        let md_path = DocumentExporter::export_to_sandbox(
            &sandbox,
            docket,
            title,
            &body,
            ExportFormat::Markdown,
        )
        .expect("Export MD failed");
        let md_read = std::fs::read_to_string(&md_path).expect("Read MD failed");
        assert!(md_read.contains("# Reclamación Formal de Validación"));
        assert!(md_read.contains(consumer_name));
        assert!(md_read.contains(co_debtor));
        assert!(md_read.contains("§ 1692g"));
        assert!(md_read.contains("¶ 4"));
        assert!(md_read.contains("© 2026"));
        assert!(md_read.contains("€3,120.50"));
        assert!(md_read.contains("¥480,000"));

        // Export PDF
        let pdf_path =
            DocumentExporter::export_to_sandbox(&sandbox, docket, title, &body, ExportFormat::Pdf)
                .expect("Export PDF failed");
        let pdf_bytes = std::fs::read(&pdf_path).expect("Read PDF failed");
        let pdf_str = String::from_utf8_lossy(&pdf_bytes);
        assert!(
            pdf_str.contains(consumer_name),
            "PDF stream must preserve accented UTF-8 characters"
        );
        assert!(
            pdf_str.contains("§ 1692g"),
            "PDF stream must preserve section sign §"
        );
        assert!(
            pdf_str.contains("¶ 4"),
            "PDF stream must preserve paragraph sign ¶"
        );
        assert!(
            pdf_str.contains("© 2026"),
            "PDF stream must preserve copyright sign ©"
        );
        assert!(
            pdf_str.contains("€3,120.50"),
            "PDF stream must preserve Euro symbol €"
        );
        assert!(
            pdf_str.contains("£2,680.00"),
            "PDF stream must preserve Pound symbol £"
        );
        assert!(
            pdf_str.contains("¥480,000"),
            "PDF stream must preserve Yen symbol ¥"
        );

        let _ = std::fs::remove_dir_all(&temp_dir);
    }
}
