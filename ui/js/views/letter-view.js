/**
 * SettleMint Letter Studio View
 * Multi-Debt FDCPA Template Drafting Workbench with Real-Time Legal Preview & Token Interpolation
 * Supports: Credit Cards (CFPB Reg F / TILA), Medical (No Surprises Act), Auto (UCC Art 9), Installment Loans
 */

export function renderLetterStudio(activeCase) {
  const isCreditCard = activeCase.debtType === 'credit_card' || activeCase.iconType === 'credit_card';
  const isAuto = activeCase.debtType === 'auto_deficiency' || activeCase.iconType === 'auto';
  const isMedical = activeCase.debtType === 'medical' || (!isCreditCard && !isAuto && activeCase.debtType !== 'personal_loan');

  let defaultTemplate = 'credit_card_dvl';
  if (isMedical) defaultTemplate = 'medical_dvl';
  else if (isAuto) defaultTemplate = 'auto_dvl';

  const todayStr = "October 13, 2026";

  return `
    <div class="studio-layout">
      <!-- Left Panel: Structured Input Fields & Template Selection -->
      <div class="studio-form-pane">
        <div class="studio-pane-header">
          <span class="label-caps">DISPUTE LETTER CONFIGURATION</span>
          <span class="label-code">FDCPA ENGINE</span>
        </div>
        <div class="studio-scroll">
          <div class="form-group">
            <label class="label-caps">SELECT DISPUTE TEMPLATE</label>
            <select class="input-field" id="templateSelect">
              <option value="credit_card_dvl" ${defaultTemplate === 'credit_card_dvl' ? 'selected' : ''}>Credit Card Debt Validation & Chain of Title (15 U.S.C. § 1692g & CFPB Reg F)</option>
              <option value="medical_dvl" ${defaultTemplate === 'medical_dvl' ? 'selected' : ''}>Medical Debt Validation & Clinical Audit (FDCPA & No Surprises Act)</option>
              <option value="auto_dvl" ${defaultTemplate === 'auto_dvl' ? 'selected' : ''}>Auto Loan Deficiency Defense (FDCPA & UCC Article 9)</option>
              <option value="general_dvl">General Consumer Debt Validation Demand (15 U.S.C. § 1692g)</option>
              <option value="cease_desist">Limited Cease & Desist (Physical Mail Only — 15 U.S.C. § 1692c(c))</option>
              <option value="cra_dispute">Direct Credit Bureau Dispute (FCRA § 623)</option>
              <option value="cfpb_complaint">CFPB Formal Regulatory Complaint Narrative</option>
              <option value="pay_for_delete">Pay-For-Delete Settlement Offer & Dismissal Demand</option>
            </select>
          </div>

          <div class="form-group">
            <label class="label-caps">USPS CERTIFIED MAIL TRACKING #</label>
            <input type="text" class="input-field label-code" id="templateCertifiedMail" value="${activeCase.certifiedMailTracking || '7021 0950 0001 9841 3320'}">
          </div>

          <div class="form-group">
            <label class="label-caps">COLLECTOR RECIPIENT ENTITY</label>
            <input type="text" class="input-field" id="templateRecipient" value="${activeCase.collectionAgency}">
          </div>

          <div class="form-group">
            <label class="label-caps">DISPUTED BALANCE AMOUNT</label>
            <input type="text" class="input-field label-code" id="templateAmount" value="$${activeCase.disputedBalance.toFixed(2)}">
          </div>

          <!-- Dynamic Statutory Demands Checklist -->
          <div class="form-group">
            <label class="label-caps">SPECIFIC STATUTORY DEMANDS</label>
            <div class="checkbox-grid" id="statutoryDemandsChecklist" style="margin-top: 4px;">
              ${isCreditCard ? `
                <label class="check-item">
                  <input type="checkbox" checked id="reqChainOfTitle">
                  <span>Demand complete, unbroken chain of assignment from original card issuer</span>
                </label>
                <label class="check-item">
                  <input type="checkbox" checked id="reqStatements">
                  <span>Demand periodic billing statements from $0 balance or date of charge-off</span>
                </label>
                <label class="check-item">
                  <input type="checkbox" checked id="reqRegFItemization">
                  <span>Demand CFPB Reg F itemization (charge-off balance, fees & interest)</span>
                </label>
                <label class="check-item">
                  <input type="checkbox" checked id="reqCardAgreement">
                  <span>Demand original cardholder agreement and terms bearing proof of consent</span>
                </label>
                <label class="check-item">
                  <input type="checkbox" checked id="reqLicenseProof">
                  <span>Demand proof of active state debt collection licensing & bond</span>
                </label>
              ` : isAuto ? `
                <label class="check-item">
                  <input type="checkbox" checked id="reqContract">
                  <span>Demand original retail installment sale contract & promissory note</span>
                </label>
                <label class="check-item">
                  <input type="checkbox" checked id="reqNoticeOfSale">
                  <span>Demand UCC § 9-611 Notice of Intent to Dispose of Vehicle</span>
                </label>
                <label class="check-item">
                  <input type="checkbox" checked id="reqDeficiencyCalc">
                  <span>Demand UCC § 9-616 post-sale calculation of deficiency & gross proceeds</span>
                </label>
                <label class="check-item">
                  <input type="checkbox" checked id="reqCommercialReasonable">
                  <span>Demand proof of commercially reasonable disposition (UCC § 9-610)</span>
                </label>
                <label class="check-item">
                  <input type="checkbox" checked id="reqLicenseProof">
                  <span>Demand proof of active state debt collection licensing & bond</span>
                </label>
              ` : `
                <label class="check-item">
                  <input type="checkbox" checked id="reqChainOfTitle">
                  <span>Demand complete, unbroken chain of assignment / title</span>
                </label>
                <label class="check-item">
                  <input type="checkbox" checked id="reqItemizedBill">
                  <span>Demand itemized clinical breakdown (CPT & ICD-10 codes)</span>
                </label>
                <label class="check-item">
                  <input type="checkbox" checked id="reqNoSurprises">
                  <span>Demand proof of compliance with federal No Surprises Act</span>
                </label>
                <label class="check-item">
                  <input type="checkbox" checked id="reqOriginalContract">
                  <span>Demand copy of original signed financial responsibility agreement</span>
                </label>
                <label class="check-item">
                  <input type="checkbox" checked id="reqLicenseProof">
                  <span>Demand proof of active state debt collection licensing & bond</span>
                </label>
              `}
            </div>
          </div>

          <div style="display:flex; gap: 8px; margin-top: var(--space-md);">
            <button class="btn btn-secondary-evidentiary" id="copyTextBtn">COPY TEXT</button>
            <button class="btn btn-primary" id="exportPdfBtn">EXPORT CERTIFIED PDF</button>
          </div>
        </div>
      </div>

      <!-- Right Panel: Real-Time Legal Document Preview -->
      <div class="studio-preview-pane">
        <div class="studio-pane-header">
          <span class="label-caps">STANDARDIZED LEGAL BRIEF PREVIEW</span>
          <span class="label-code" id="previewBatesStamp">${activeCase.docketNumber}-DOC01</span>
        </div>
        <div class="studio-scroll" style="background-color: var(--color-surface-container);">
          <div class="legal-document-paper" id="legalDocumentPaper">
            <div class="watermark-bates">${activeCase.docketNumber}</div>
            
            <p style="font-weight: 700; margin-bottom: 12px;">SENT VIA USPS CERTIFIED MAIL — RETURN RECEIPT REQUESTED</p>
            <p class="label-code" style="margin-bottom: 16px;">TRACKING NO: <span id="docTrackingNo">${activeCase.certifiedMailTracking || '7021 0950 0001 9841 3320'}</span></p>

            <p style="margin-bottom: 16px;">
              <strong>DATE:</strong> ${todayStr}<br>
              <strong>TO:</strong> <span id="docRecipient">${activeCase.collectionAgency}</span><br>
              <strong>RE:</strong> NOTICE OF FORMAL DISPUTE & MANDATORY DEBT VALIDATION (15 U.S.C. § 1692g)<br>
              <strong>ALLEGED ACCOUNT NO:</strong> <span class="label-code">${activeCase.collectionAccountNumber}</span><br>
              <strong>ORIGINAL CREDITOR / ISSUER:</strong> ${activeCase.originalProvider}<br>
              <strong>DISPUTED AMOUNT:</strong> <span id="docDisputedAmount">$${activeCase.disputedBalance.toFixed(2)}</span>
            </p>

            <p style="margin-bottom: 12px;">To the Legal & Compliance Department:</p>

            <p style="margin-bottom: 12px; text-align: justify;">
              Please be advised that I am writing to formally dispute the validity of the alleged debt referenced above in its entirety, pursuant to the Fair Debt Collection Practices Act (FDCPA), 15 U.S.C. § 1692g(b)${isCreditCard ? ', CFPB Regulation F, 12 C.F.R. § 1006.34, and the Truth in Lending Act (TILA)' : isAuto ? ', and Uniform Commercial Code (UCC) Article 9' : ', and the federal No Surprises Act (P.L. 116-260)'}.
            </p>

            <p style="margin-bottom: 12px; text-align: justify;">
              This letter constitutes my timely written demand for verification. Pursuant to federal statute, you are required to immediately cease and desist all collection activities—including telephone outreach, letters, and reporting to consumer reporting agencies—until your agency obtains and mails comprehensive statutory verification of this alleged debt to me.
            </p>

            <p style="margin-bottom: 12px;">Specifically, I demand that you furnish the following certified evidentiary documentation:</p>
            
            ${isCreditCard ? `
              <ol style="margin-left: 20px; margin-bottom: 12px; line-height: 1.6;">
                <li>Complete, unbroken chain of assignment from the original card issuer (including all bills of sale, purchase agreements, and assignment schedules specifically identifying this account) demonstrating your standing.</li>
                <li>Complete periodic billing statements from $0 balance or date of charge-off establishing the accurate calculation of principal, interest, and late charges.</li>
                <li>Itemized calculation pursuant to 12 C.F.R. § 1006.34 of all interest, late fees, collection costs, and post-charge-off additions, alongside all payments and credits applied.</li>
                <li>The complete original cardholder agreement governing this account, including applicable terms in effect when the account was opened and at charge-off, with proof of consumer assent.</li>
                <li>Proof of active debt collection license and surety bond number within the debtor's state of jurisdiction.</li>
              </ol>
            ` : isAuto ? `
              <ol style="margin-left: 20px; margin-bottom: 12px; line-height: 1.6;">
                <li>Complete original retail installment contract and promissory note bearing consumer signature.</li>
                <li>Verified Notice of Intent to Dispose of Repossessed Vehicle and proof of timely postal delivery conforming to UCC § 9-611.</li>
                <li>Complete itemized explanation and accounting of the post-sale deficiency balance conforming to UCC § 9-616, including gross sale proceeds, auction fees, storage costs, and calculation of rebates/credits.</li>
                <li>Proof of commercially reasonable disposition of collateral pursuant to UCC § 9-610.</li>
                <li>Complete chain of title and legal assignment from the original auto financing institution.</li>
              </ol>
            ` : `
              <ol style="margin-left: 20px; margin-bottom: 12px; line-height: 1.6;">
                <li>A complete, itemized clinical accounting statement detailing all medical charges, contractual adjustments, and insurance payments (including CPT and ICD-10 diagnosis codes).</li>
                <li>Proof of compliance with the federal No Surprises Act prohibiting surprise out-of-network balance billing.</li>
                <li>A verified, unbroken chain of title demonstrating your agency's legal standing and assignment to collect this debt.</li>
                <li>A copy of the original contract or financial responsibility agreement bearing the consumer's signature.</li>
                <li>Verification of your active debt collection license and bond number within the debtor's state of jurisdiction.</li>
              </ol>
            `}

            <p style="margin-bottom: 12px; text-align: justify;">
              If your agency fails to supply competent verification within the statutory period, or continues collection efforts or credit reporting prior to providing validation, such actions will constitute willful violations of 15 U.S.C. § 1692g and § 1692e, subjecting your agency to statutory damages of up to $1,000 per violation plus actual damages and attorney's fees under 15 U.S.C. § 1692k.
            </p>

            <p style="margin-top: 24px;">
              Respectfully submitted,<br><br>
              <strong>${activeCase.debtorName}</strong><br>
              <em>(Signed electronically with evidentiary timestamp & certified mail tracking log)</em>
            </p>

            <div class="legal-document-disclaimer">
              <strong>Mandatory Compliance Notice:</strong> This document is a self-advocacy administrative verification demand pursuant to 15 U.S.C. § 1692g. SettleMint is a local recordkeeping utility and does not provide legal representation or formal legal advice.
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}
