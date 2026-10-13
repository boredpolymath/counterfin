/**
 * SettleMint Letter Studio View
 * Side-by-side template drafting workbench with real-time legal preview & token interpolation
 */

export function renderLetterStudio(activeCase) {
  return `
    <div class="studio-layout">
      <!-- Left Panel: Structured Input Fields & Template Selection -->
      <div class="studio-form-pane">
        <div class="studio-pane-header">
          <span class="label-caps">DISPUTE LETTER CONFIGURATION</span>
          <span class="label-code">TEMPLATE ENGINE</span>
        </div>
        <div class="studio-scroll">
          <div class="form-group">
            <label class="label-caps">SELECT DISPUTE TEMPLATE</label>
            <select class="input-field" id="templateSelect">
              <option value="dvl" selected>Formal Debt Validation Demand (15 U.S.C. § 1692g)</option>
              <option value="cease_desist">Limited Cease & Desist (Physical Mail Only)</option>
              <option value="cra_dispute">Medical Debt Dispute to Credit Reporting Agencies</option>
              <option value="cfpb_complaint">CFPB Formal Regulatory Complaint Narrative</option>
              <option value="pay_for_delete">Pay-For-Delete Settlement Offer & Dismissal Demand</option>
            </select>
          </div>

          <div class="form-group">
            <label class="label-caps">USPS CERTIFIED MAIL TRACKING #</label>
            <input type="text" class="input-field label-code" id="templateCertifiedMail" value="${activeCase.certifiedMailTracking || '7021 0950 0001 8492 1104'}">
          </div>

          <div class="form-group">
            <label class="label-caps">COLLECTOR RECIPIENT ENTITY</label>
            <input type="text" class="input-field" id="templateRecipient" value="${activeCase.collectionAgency}">
          </div>

          <div class="form-group">
            <label class="label-caps">DISPUTED BALANCE AMOUNT</label>
            <input type="text" class="input-field label-code" id="templateAmount" value="$${activeCase.disputedBalance.toFixed(2)}">
          </div>

          <div class="form-group">
            <label class="label-caps">SPECIFIC STATUTORY DEMANDS</label>
            <div class="checkbox-grid" style="margin-top: 4px;">
              <label class="check-item">
                <input type="checkbox" checked id="reqChainOfTitle">
                <span>Demand complete, unbroken chain of assignment / title</span>
              </label>
              <label class="check-item">
                <input type="checkbox" checked id="reqItemizedBill">
                <span>Demand itemized medical billing breakdown (CPT & ICD-10 codes)</span>
              </label>
              <label class="check-item">
                <input type="checkbox" checked id="reqOriginalContract">
                <span>Demand copy of original signed agreement bearing consumer signature</span>
              </label>
              <label class="check-item">
                <input type="checkbox" checked id="reqLicenseProof">
                <span>Demand proof of active state debt collection licensing & bond</span>
              </label>
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
            <p class="label-code" style="margin-bottom: 16px;">TRACKING NO: <span id="docTrackingNo">${activeCase.certifiedMailTracking || '7021 0950 0001 8492 1104'}</span></p>

            <p style="margin-bottom: 16px;">
              <strong>DATE:</strong> October 13, 2026<br>
              <strong>TO:</strong> <span id="docRecipient">${activeCase.collectionAgency}</span><br>
              <strong>RE:</strong> NOTICE OF DISPUTE AND FORMAL DEMAND FOR DEBT VALIDATION PURSUANT TO 15 U.S.C. § 1692g<br>
              <strong>ALLEGED ACCOUNT NO:</strong> <span class="label-code">${activeCase.collectionAccountNumber}</span><br>
              <strong>ALLEGED ORIGINAL CREDITOR:</strong> ${activeCase.originalProvider}<br>
              <strong>DISPUTED AMOUNT:</strong> <span id="docDisputedAmount">$${activeCase.disputedBalance.toFixed(2)}</span>
            </p>

            <p style="margin-bottom: 12px;">To the Compliance Department:</p>

            <p style="margin-bottom: 12px; text-align: justify;">
              Please be advised that I am writing to formally dispute the validity of the alleged debt referenced above in its entirety, pursuant to the Fair Debt Collection Practices Act (FDCPA), 15 U.S.C. § 1692g(b).
            </p>

            <p style="margin-bottom: 12px; text-align: justify;">
              This letter serves as my timely demand for verification. Pursuant to federal statute, you are required to immediately cease and desist all collection activities—including telephone calls, letters, and reporting to credit bureaus—until your agency obtains and mails verification of this alleged debt to me.
            </p>

            <p style="margin-bottom: 12px;">Specifically, I demand that you furnish the following evidentiary documentation:</p>
            <ol style="margin-left: 20px; margin-bottom: 12px; line-height: 1.6;">
              <li>A complete, itemized clinical accounting statement detailing all medical charges, contractual adjustments, and insurance payments.</li>
              <li>A verified, unbroken chain of title demonstrating your agency's legal standing and assignment to collect this debt.</li>
              <li>A copy of the original contract or financial responsibility agreement bearing my signature.</li>
              <li>Verification of your active debt collection license and bond number within the debtor's state of jurisdiction.</li>
            </ol>

            <p style="margin-bottom: 12px; text-align: justify;">
              If your agency fails to supply competent verification within the statutory period, or continues collection efforts or credit reporting prior to providing validation, such actions will constitute willful violations of 15 U.S.C. § 1692g and § 1692e, subjecting your agency to statutory damages of up to $1,000 per violation plus actual damages and attorney's fees under 15 U.S.C. § 1692k.
            </p>

            <p style="margin-top: 24px;">
              Respectfully submitted,<br><br>
              <strong>${activeCase.debtorName}</strong><br>
              <em>(Signed electronically with evidentiary timestamp)</em>
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
}
