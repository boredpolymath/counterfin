/**
 * SettleMint Letter Studio View
 * Multi-Debt FDCPA Template Drafting Workbench with Real-Time Legal Preview & Token Interpolation
 * Supports: Credit Cards (CFPB Reg F / TILA), Medical (No Surprises Act), Auto (UCC Art 9), Installment Loans
 */

export function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function renderLetterEmptyState() {
  return `
    <div class="empty-state-card" style="background:#ffffff; border:1px dashed var(--color-border-standard); border-radius:var(--radius-xl); padding:60px 24px; text-align:center; max-width:600px; margin:40px auto;">
      <div style="width:48px; height:48px; border-radius:12px; background:var(--color-primary-mint-wash); color:var(--color-primary); display:inline-flex; align-items:center; justify-content:center; margin-bottom:16px;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
      </div>
      <h3 style="font-size:18px; font-weight:700; color:#0f172a; margin-bottom:8px;">No Dispute Dossier Selected</h3>
      <p style="font-size:14px; color:#64748b; margin-bottom:20px; line-height:1.5;">To draft and export statutory dispute letters, open a new dispute dossier or select an account from your dashboard.</p>
      <button type="button" class="btn btn-pill-primary" id="letterStudioEmptyNewCaseBtn">+ Open New Dispute</button>
    </div>
  `;
}

function renderCreditCardDemands() {
  return `
    <label class="statutory-demand-item">
      <input type="checkbox" checked id="reqChainOfTitle" class="statutory-demand-checkbox" data-doc-item="docReq1">
      <div class="statutory-demand-body">
        <span class="statutory-demand-title">Unbroken Chain of Assignment</span>
        <span class="statutory-demand-desc">Demand complete, unbroken chain of assignment from original card issuer</span>
      </div>
    </label>
    <label class="statutory-demand-item">
      <input type="checkbox" checked id="reqStatements" class="statutory-demand-checkbox" data-doc-item="docReq2">
      <div class="statutory-demand-body">
        <span class="statutory-demand-title">Periodic Billing Statements</span>
        <span class="statutory-demand-desc">Demand billing statements from $0 balance or date of charge-off</span>
      </div>
    </label>
    <label class="statutory-demand-item">
      <input type="checkbox" checked id="reqRegFItemization" class="statutory-demand-checkbox" data-doc-item="docReq3">
      <div class="statutory-demand-body">
        <span class="statutory-demand-title">CFPB Reg F Itemization (§ 1006.34)</span>
        <span class="statutory-demand-desc">Itemized calculation of charge-off balance, statutory fees, interest & post-charge additions</span>
      </div>
    </label>
    <label class="statutory-demand-item">
      <input type="checkbox" checked id="reqCardAgreement" class="statutory-demand-checkbox" data-doc-item="docReq4">
      <div class="statutory-demand-body">
        <span class="statutory-demand-title">Original Cardholder Agreement</span>
        <span class="statutory-demand-desc">Demand original cardholder agreement and terms bearing proof of consent</span>
      </div>
    </label>
    <label class="statutory-demand-item">
      <input type="checkbox" checked id="reqLicenseProof" class="statutory-demand-checkbox" data-doc-item="docReq5">
      <div class="statutory-demand-body">
        <span class="statutory-demand-title">State Licensing & Surety Bond</span>
        <span class="statutory-demand-desc">Demand proof of active state debt collection licensing & bond</span>
      </div>
    </label>
  `;
}

function renderAutoDemands() {
  return `
    <label class="statutory-demand-item">
      <input type="checkbox" checked id="reqContract" class="statutory-demand-checkbox" data-doc-item="docReq1">
      <div class="statutory-demand-body">
        <span class="statutory-demand-title">Retail Installment Contract & Note</span>
        <span class="statutory-demand-desc">Demand original retail installment sale contract & promissory note</span>
      </div>
    </label>
    <label class="statutory-demand-item">
      <input type="checkbox" checked id="reqNoticeOfSale" class="statutory-demand-checkbox" data-doc-item="docReq2">
      <div class="statutory-demand-body">
        <span class="statutory-demand-title">Notice of Intent to Dispose (UCC § 9-611)</span>
        <span class="statutory-demand-desc">Demand UCC § 9-611 Notice of Intent to Dispose of Vehicle</span>
      </div>
    </label>
    <label class="statutory-demand-item">
      <input type="checkbox" checked id="reqDeficiencyCalc" class="statutory-demand-checkbox" data-doc-item="docReq3">
      <div class="statutory-demand-body">
        <span class="statutory-demand-title">Deficiency Accounting (UCC § 9-616)</span>
        <span class="statutory-demand-desc">Demand UCC § 9-616 post-sale calculation of deficiency & gross proceeds</span>
      </div>
    </label>
    <label class="statutory-demand-item">
      <input type="checkbox" checked id="reqCommercialReasonable" class="statutory-demand-checkbox" data-doc-item="docReq4">
      <div class="statutory-demand-body">
        <span class="statutory-demand-title">Commercial Reasonableness (UCC § 9-610)</span>
        <span class="statutory-demand-desc">Demand proof of commercially reasonable disposition</span>
      </div>
    </label>
    <label class="statutory-demand-item">
      <input type="checkbox" checked id="reqLicenseProof" class="statutory-demand-checkbox" data-doc-item="docReq5">
      <div class="statutory-demand-body">
        <span class="statutory-demand-title">State Licensing & Surety Bond</span>
        <span class="statutory-demand-desc">Demand proof of active state debt collection licensing & bond</span>
      </div>
    </label>
  `;
}

function renderMedicalDemands() {
  return `
    <label class="statutory-demand-item">
      <input type="checkbox" checked id="reqChainOfTitle" class="statutory-demand-checkbox" data-doc-item="docReq1">
      <div class="statutory-demand-body">
        <span class="statutory-demand-title">Unbroken Chain of Assignment</span>
        <span class="statutory-demand-desc">Demand complete, unbroken chain of assignment / title</span>
      </div>
    </label>
    <label class="statutory-demand-item">
      <input type="checkbox" checked id="reqItemizedBill" class="statutory-demand-checkbox" data-doc-item="docReq2">
      <div class="statutory-demand-body">
        <span class="statutory-demand-title">Clinical Billing Breakdown</span>
        <span class="statutory-demand-desc">Demand itemized clinical breakdown (CPT & ICD-10 codes)</span>
      </div>
    </label>
    <label class="statutory-demand-item">
      <input type="checkbox" checked id="reqNoSurprises" class="statutory-demand-checkbox" data-doc-item="docReq3">
      <div class="statutory-demand-body">
        <span class="statutory-demand-title">No Surprises Act Compliance</span>
        <span class="statutory-demand-desc">Demand proof of compliance with federal No Surprises Act</span>
      </div>
    </label>
    <label class="statutory-demand-item">
      <input type="checkbox" checked id="reqOriginalContract" class="statutory-demand-checkbox" data-doc-item="docReq4">
      <div class="statutory-demand-body">
        <span class="statutory-demand-title">Financial Responsibility Agreement</span>
        <span class="statutory-demand-desc">Demand copy of original signed financial responsibility agreement</span>
      </div>
    </label>
    <label class="statutory-demand-item">
      <input type="checkbox" checked id="reqLicenseProof" class="statutory-demand-checkbox" data-doc-item="docReq5">
      <div class="statutory-demand-body">
        <span class="statutory-demand-title">State Licensing & Surety Bond</span>
        <span class="statutory-demand-desc">Demand proof of active state debt collection licensing & bond</span>
      </div>
    </label>
  `;
}

function renderStatutoryDemandsChecklist(isCreditCard, isAuto) {
  if (isCreditCard) return renderCreditCardDemands();
  if (isAuto) return renderAutoDemands();
  return renderMedicalDemands();
}

function renderTemplateOptions(defaultTemplate) {
  return `
    <option value="credit_card_dvl" ${defaultTemplate === 'credit_card_dvl' ? 'selected' : ''}>Credit Card Debt Validation & Chain of Title (15 U.S.C. § 1692g & CFPB Reg F)</option>
    <option value="medical_dvl" ${defaultTemplate === 'medical_dvl' ? 'selected' : ''}>Medical Debt Validation & Clinical Audit (FDCPA & No Surprises Act)</option>
    <option value="auto_dvl" ${defaultTemplate === 'auto_dvl' ? 'selected' : ''}>Auto Loan Deficiency Defense (FDCPA & UCC Article 9)</option>
    <option value="general_dvl">General Consumer Debt Validation Demand (15 U.S.C. § 1692g)</option>
    <option value="cease_desist">Limited Cease & Desist (Physical Mail Only — 15 U.S.C. § 1692c(c))</option>
    <option value="cra_dispute">Direct Credit Bureau Dispute (FCRA § 623)</option>
    <option value="cfpb_complaint">CFPB Formal Regulatory Complaint Narrative</option>
    <option value="pay_for_delete">Pay-For-Delete Settlement Offer & Dismissal Demand</option>
  `;
}

function renderLetterActionButtons() {
  return `
    <div class="studio-action-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
      <button class="btn btn-pill-outline" id="copyTextBtn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        <span class="btn-label">Copy Text</span>
      </button>
      <button class="btn btn-pill-outline" id="exportTxtBtn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
        </svg>
        <span class="btn-label">Save .TXT</span>
      </button>
      <button class="btn btn-pill-outline" id="exportMdBtn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
          <polyline points="7 15 7 9 10 12 13 9 13 15"></polyline>
          <polyline points="17 9 17 15"></polyline>
        </svg>
        <span class="btn-label">Save .MD</span>
      </button>
      <button class="btn btn-pill-primary" id="exportPdfBtn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        <span class="btn-label">Export PDF</span>
      </button>
    </div>
  `;
}

function renderLetterControls(activeCase, defaultTemplate, isCreditCard, isAuto) {
  return `
    <div class="studio-form-pane">
      <div class="studio-pane-header">
        <div style="display: flex; align-items: center; gap: 8px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#006948" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
          </svg>
          <span class="label-caps">DISPUTE LETTER CONFIGURATION</span>
        </div>
        <span class="status-pill status-pill-mint" style="font-size: 11px; padding: 2px 8px;">
          <span class="status-dot status-dot-mint"></span>
          FDCPA Engine
        </span>
      </div>
      <div class="studio-scroll">
        <div class="form-group">
          <label class="form-label" style="font-size: 11px; font-weight: 700; color: #475569; letter-spacing: 0.05em; text-transform: uppercase;">SELECT DISPUTE TEMPLATE</label>
          <select class="input-rounded studio-select" id="templateSelect">
            ${renderTemplateOptions(defaultTemplate)}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label" style="font-size: 11px; font-weight: 700; color: #475569; letter-spacing: 0.05em; text-transform: uppercase;">USPS CERTIFIED MAIL TRACKING #</label>
          <input type="text" class="input-rounded label-code" id="templateCertifiedMail" value="${activeCase.certifiedMailTracking || '7021 0950 0001 9841 3320'}">
        </div>

        <div class="form-group">
          <label class="form-label" style="font-size: 11px; font-weight: 700; color: #475569; letter-spacing: 0.05em; text-transform: uppercase;">COLLECTOR RECIPIENT ENTITY</label>
          <input type="text" class="input-rounded" id="templateRecipient" value="${activeCase.collectionAgency}">
        </div>

        <div class="form-group">
          <label class="form-label" style="font-size: 11px; font-weight: 700; color: #475569; letter-spacing: 0.05em; text-transform: uppercase;">DISPUTED BALANCE AMOUNT</label>
          <input type="text" class="input-rounded label-code" id="templateAmount" value="$${activeCase.disputedBalance.toFixed(2)}">
        </div>

        <div class="form-group" style="margin-top: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <label class="form-label" style="font-size: 11px; font-weight: 700; color: #475569; letter-spacing: 0.05em; text-transform: uppercase;">SPECIFIC STATUTORY DEMANDS</label>
            <span class="status-pill status-pill-mint" style="font-size: 11px; padding: 2px 8px;">5 Demands Active</span>
          </div>
          <div class="statutory-demands-list" id="statutoryDemandsChecklist">
            ${renderStatutoryDemandsChecklist(isCreditCard, isAuto)}
          </div>
        </div>

        ${renderLetterActionButtons()}
      </div>
    </div>
  `;
}

function renderDocDemandsList(isCreditCard, isAuto) {
  if (isCreditCard) {
    return `
      <ol class="doc-demands-list" id="docDemandsList" style="margin-left: 20px; margin-bottom: 14px; line-height: 1.65;">
        <li id="docReq1">Complete, unbroken chain of assignment from the original card issuer (including all bills of sale, purchase agreements, and assignment schedules specifically identifying this account) demonstrating your standing.</li>
        <li id="docReq2">Complete periodic billing statements from $0 balance or date of charge-off establishing the accurate calculation of principal, interest, and late charges.</li>
        <li id="docReq3">Itemized calculation pursuant to 12 C.F.R. § 1006.34 of all interest, late fees, collection costs, and post-charge-off additions, alongside all payments and credits applied.</li>
        <li id="docReq4">The complete original cardholder agreement governing this account, including applicable terms in effect when the account was opened and at charge-off, with proof of consumer assent.</li>
        <li id="docReq5">Proof of active debt collection license and surety bond number within the debtor's state of jurisdiction.</li>
      </ol>
    `;
  }
  if (isAuto) {
    return `
      <ol class="doc-demands-list" id="docDemandsList" style="margin-left: 20px; margin-bottom: 14px; line-height: 1.65;">
        <li id="docReq1">Complete original retail installment contract and promissory note bearing consumer signature.</li>
        <li id="docReq2">Verified Notice of Intent to Dispose of Repossessed Vehicle and proof of timely postal delivery conforming to UCC § 9-611.</li>
        <li id="docReq3">Complete itemized explanation and accounting of the post-sale deficiency balance conforming to UCC § 9-616, including gross sale proceeds, auction fees, storage costs, and calculation of rebates/credits.</li>
        <li id="docReq4">Proof of commercially reasonable disposition of collateral pursuant to UCC § 9-610.</li>
        <li id="docReq5">Complete chain of title and legal assignment from the original auto financing institution.</li>
      </ol>
    `;
  }
  return `
    <ol class="doc-demands-list" id="docDemandsList" style="margin-left: 20px; margin-bottom: 14px; line-height: 1.65;">
      <li id="docReq1">A complete, itemized clinical accounting statement detailing all medical charges, contractual adjustments, and insurance payments (including CPT and ICD-10 diagnosis codes).</li>
      <li id="docReq2">Proof of compliance with the federal No Surprises Act prohibiting surprise out-of-network balance billing.</li>
      <li id="docReq3">A verified, unbroken chain of title demonstrating your agency's legal standing and assignment to collect this debt.</li>
      <li id="docReq4">A copy of the original contract or financial responsibility agreement bearing the consumer's signature.</li>
      <li id="docReq5">Verification of your active debt collection license and bond number within the debtor's state of jurisdiction.</li>
    </ol>
  `;
}

function renderDocHeader(activeCase, todayStr, senderName, senderCityStateZip) {
  return `
    <div class="watermark-bates">${activeCase.docketNumber}</div>
    <div class="doc-certified-banner">
      <span class="doc-usps-icon">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#006948" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
      </span>
      <span>SENT VIA USPS CERTIFIED MAIL — RETURN RECEIPT REQUESTED</span>
    </div>
    <p class="label-code doc-tracking-row">
      TRACKING NO: <span id="docTrackingNo">${activeCase.certifiedMailTracking || '7021 0950 0001 9841 3320'}</span>
    </p>

    <div class="doc-meta-table">
      <div class="meta-line"><strong>DATE:</strong> <span>${escapeHtml(todayStr)}</span></div>
      <div class="meta-line"><strong>FROM:</strong> <span>${escapeHtml(senderName)}${senderCityStateZip ? ` (${escapeHtml(senderCityStateZip)})` : ''}</span></div>
      <div class="meta-line"><strong>TO:</strong> <span id="docRecipient">${escapeHtml(activeCase.collectionAgency)}</span></div>
      <div class="meta-line"><strong>RE:</strong> <span>NOTICE OF FORMAL DISPUTE & MANDATORY DEBT VALIDATION (15 U.S.C. § 1692g)</span></div>
      <div class="meta-line"><strong>ALLEGED ACCOUNT NO:</strong> <span class="label-code">${escapeHtml(activeCase.collectionAccountNumber)}</span></div>
      <div class="meta-line"><strong>ORIGINAL CREDITOR:</strong> <span>${escapeHtml(activeCase.originalProvider)}</span></div>
      <div class="meta-line"><strong>DISPUTED AMOUNT:</strong> <span class="label-code" id="docDisputedAmount" style="font-weight: 700; color: #0f172a;">$${activeCase.disputedBalance.toFixed(2)}</span></div>
    </div>
  `;
}

function renderDocBody(isCreditCard, isAuto, senderName, senderStreet, senderCityStateZip) {
  const statuteSuffix = isCreditCard
    ? ', CFPB Regulation F, 12 C.F.R. § 1006.34, and the Truth in Lending Act (TILA)'
    : isAuto
    ? ', and Uniform Commercial Code (UCC) Article 9'
    : ', and the federal No Surprises Act (P.L. 116-260)';

  return `
    <p style="margin-bottom: 12px; font-weight: 600;">To the Legal & Compliance Department:</p>
    <p style="margin-bottom: 12px; text-align: justify;">
      Please be advised that I am writing to formally dispute the validity of the alleged debt referenced above in its entirety, pursuant to the Fair Debt Collection Practices Act (FDCPA), 15 U.S.C. § 1692g(b)${statuteSuffix}.
    </p>
    <p style="margin-bottom: 12px; text-align: justify;">
      This letter constitutes my timely written demand for verification. Pursuant to federal statute, you are required to immediately cease and desist all collection activities—including telephone outreach, letters, and reporting to consumer reporting agencies—until your agency obtains and mails comprehensive statutory verification of this alleged debt to me.
    </p>
    <p style="margin-bottom: 12px; font-weight: 600;">Specifically, I demand that you furnish the following certified evidentiary documentation:</p>
    ${renderDocDemandsList(isCreditCard, isAuto)}
    <p style="margin-bottom: 12px; text-align: justify;">
      If your agency fails to supply competent verification within the statutory period, or continues collection efforts or credit reporting prior to providing validation, such actions will constitute willful violations of 15 U.S.C. § 1692g and § 1692e, subjecting your agency to statutory damages of up to $1,000 per violation plus actual damages and attorney's fees under 15 U.S.C. § 1692k.
    </p>
    <p style="margin-top: 24px;">
      Respectfully submitted,<br><br>
      <strong>${escapeHtml(senderName)}</strong><br>
      ${senderStreet ? `<span>${escapeHtml(senderStreet)}</span><br>` : ''}
      ${senderCityStateZip ? `<span>${escapeHtml(senderCityStateZip)}</span><br>` : ''}
      <em>(Signed electronically with evidentiary timestamp & certified mail tracking log)</em>
    </p>
    <div class="legal-document-disclaimer">
      <strong>Mandatory Compliance Notice:</strong> This document is a self-advocacy administrative verification demand pursuant to 15 U.S.C. § 1692g. CounterFin is a local recordkeeping utility and does not provide legal representation or formal legal advice.
    </div>
  `;
}

function renderLetterPaper(activeCase, userProfile, isCreditCard, isAuto) {
  const today = new Date();
  const todayStr = today.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const senderName = userProfile?.name || activeCase.debtorName || "Protected Consumer";
  const senderStreet = userProfile?.address || "";
  const senderCityStateZip = (userProfile?.city && userProfile?.state)
    ? `${userProfile.city}, ${userProfile.state} ${userProfile.zip || ''}`.trim()
    : (userProfile?.state ? `${userProfile.state} ${userProfile.zip || ''}`.trim() : '');

  return `
    <div class="studio-preview-pane">
      <div class="studio-pane-header">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="label-caps">STANDARDIZED LEGAL BRIEF PREVIEW</span>
          <span class="status-pill status-pill-mint" style="font-size: 11px; padding: 2px 8px;">
            <span class="status-dot status-dot-mint"></span>
            Statutory DVL
          </span>
        </div>
        <span class="docket-id-tag" id="previewBatesStamp">${activeCase.docketNumber}-DOC01</span>
      </div>
      <div class="studio-scroll" style="background-color: var(--color-surface-container-low);">
        <div class="legal-document-paper" id="legalDocumentPaper">
          ${renderDocHeader(activeCase, todayStr, senderName, senderCityStateZip)}
          ${renderDocBody(isCreditCard, isAuto, senderName, senderStreet, senderCityStateZip)}
        </div>
      </div>
    </div>
  `;
}

export function renderLetterStudio(activeCase, userProfile = null) {
  if (!activeCase) {
    return renderLetterEmptyState();
  }

  const isCreditCard = activeCase.debtType === 'credit_card' || activeCase.iconType === 'credit_card';
  const isAuto = activeCase.debtType === 'auto_deficiency' || activeCase.iconType === 'auto';
  const isMedical = activeCase.debtType === 'medical' || (!isCreditCard && !isAuto && activeCase.debtType !== 'personal_loan');

  let defaultTemplate = 'credit_card_dvl';
  if (isMedical) defaultTemplate = 'medical_dvl';
  else if (isAuto) defaultTemplate = 'auto_dvl';

  return `
    <div class="studio-layout">
      ${renderLetterControls(activeCase, defaultTemplate, isCreditCard, isAuto)}
      ${renderLetterPaper(activeCase, userProfile, isCreditCard, isAuto)}
    </div>
  `;
}
