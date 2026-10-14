/**
 * SettleMint Initial Seed Data & Domain Fixtures
 * Full FDCPA Consumer Debt Protection Suite:
 * - Credit Card Debt & Purchased Portfolios (CFPB Reg F, TILA, Chain of Title)
 * - Medical Debt (No Surprises Act, Clinical Itemization)
 * - Auto Loan Deficiency (UCC Article 9 Accounting)
 * - Personal & Installment Loans (Consumer Lending Statutes)
 */

export const USER_PROFILE = {
  name: "Sarah Henderson",
  shortName: "Sarah",
  initials: "SH",
  statuteState: "NY",
  totalUnderReview: 11540.00,
  activeAccountsCount: 4,
  nextDeadlineDays: 8,
  nextDeadlineAgency: "Midland Credit Management",
  violationsTotal: 5,
  potentialStatutoryClaim: 5000.00
};

export const INITIAL_CASES = [
  {
    id: "case-sm-2026-0041",
    docketNumber: "BATES-SM-2026-0041",
    debtorName: "Sarah Henderson",
    debtType: "credit_card",
    originalProvider: "Citibank, N.A. (Diamond Preferred)",
    providerCategory: "Credit Card (Revolving)",
    iconType: "credit_card",
    collectionAgency: "Midland Credit Management, Inc.",
    originalAccountNumber: "CITI-4491-****-8812",
    collectionAccountNumber: "MCM-99214-B",
    dateOfService: "2023-05-14",
    initialNoticeDate: "2026-10-06",
    originalBalance: 3420.00,
    disputedBalance: 3420.00,
    currentPhase: "ValidationPending",
    statuteState: "NY",
    statuteLimitYears: 3,
    statutoryDaysRemaining: 8,
    statusBadge: "Waiting on collector response",
    secondaryBadge: "Missing Chain of Title",
    certifiedMailDeliveredDate: "Oct 12",
    certifiedMailTracking: "7021 0950 0001 9841 3320",
    actionLabel: "View Details",
    violationsCount: 2,
    potentialDamages: 2000.00,
    collectionStatus: "Paused by Law (CFPB Reg F)",
    notes: "Purchased credit card portfolio debt. Disputed under FDCPA § 1692g & CFPB Reg F for failure to furnish assignment chain and unverified post-charge-off interest additions.",
    legalFramework: "CFPB Reg F § 1006.34 & TILA"
  },
  {
    id: "case-sm-2026-0042",
    docketNumber: "BATES-SM-2026-0042",
    debtorName: "Sarah Henderson",
    debtType: "medical",
    originalProvider: "Metro Health System (ER Visit)",
    providerCategory: "Emergency Department",
    iconType: "medical",
    collectionAgency: "Apex Recovery Group",
    originalAccountNumber: "MHS-99412-ER",
    collectionAccountNumber: "APX-88201-9",
    dateOfService: "2024-04-12",
    initialNoticeDate: "2026-10-03",
    originalBalance: 2350.00,
    disputedBalance: 2350.00,
    currentPhase: "ValidationPending",
    statuteState: "NY",
    statuteLimitYears: 3,
    statutoryDaysRemaining: 11,
    statusBadge: "Waiting on collector response",
    secondaryBadge: "1 Violation Logged",
    certifiedMailDeliveredDate: "Oct 14",
    certifiedMailTracking: "7021 0950 0001 8492 1104",
    actionLabel: "View Details",
    violationsCount: 1,
    potentialDamages: 1000.00,
    collectionStatus: "Paused by Law",
    notes: "Emergency department physician billing dispute. DVL delivered via USPS Certified Mail Oct 14. 11 days remaining for validation.",
    legalFramework: "No Surprises Act & FDCPA § 1692g"
  },
  {
    id: "case-sm-2026-0043",
    docketNumber: "BATES-SM-2026-0043",
    debtorName: "Sarah Henderson",
    debtType: "auto_deficiency",
    originalProvider: "Santander Consumer USA",
    providerCategory: "Auto Finance (Deficiency)",
    iconType: "auto",
    collectionAgency: "Northern Financial Billing",
    originalAccountNumber: "SC-88319-AUTO",
    collectionAccountNumber: "NFB-44102-B",
    dateOfService: "2023-09-18",
    initialNoticeDate: "2026-09-15",
    originalBalance: 4150.00,
    disputedBalance: 4150.00,
    currentPhase: "DisputeEscalated",
    statuteState: "NY",
    statuteLimitYears: 3,
    statutoryDaysRemaining: 0,
    statusBadge: "Stop-Contact Notice Sent",
    secondaryBadge: "Calls Blocked",
    certifiedMailDeliveredDate: "Sep 22",
    certifiedMailTracking: "7021 0950 0002 9183 4401",
    actionLabel: "View Details",
    violationsCount: 2,
    potentialDamages: 2000.00,
    collectionStatus: "Collection Paused",
    notes: "Late-night call recorded & flagged for statutory penalty. Written stop-contact notice served. Demand for UCC Article 9 post-sale accounting.",
    legalFramework: "UCC Article 9 & FDCPA § 1692c"
  },
  {
    id: "case-sm-2026-0044",
    docketNumber: "BATES-SM-2026-0044",
    debtorName: "Sarah Henderson",
    debtType: "personal_loan",
    originalProvider: "Cross River Bank / Upstart",
    providerCategory: "Personal Installment Loan",
    iconType: "loan",
    collectionAgency: "Cadence Receivables LLC",
    originalAccountNumber: "UPST-55104-LOAN",
    collectionAccountNumber: "CR-10923-C",
    dateOfService: "2024-08-11",
    initialNoticeDate: "2026-10-23",
    originalBalance: 1620.00,
    disputedBalance: 1620.00,
    currentPhase: "InitialNotice",
    statuteState: "NY",
    statuteLimitYears: 3,
    statutoryDaysRemaining: 28,
    statusBadge: "Notice Received",
    secondaryBadge: "Standard 30-day window",
    certifiedMailDeliveredDate: null,
    certifiedMailTracking: "7021 0950 0003 7741 9012",
    actionLabel: "Review Letter",
    violationsCount: 0,
    potentialDamages: 0.00,
    collectionStatus: "Dispute letter ready to send",
    notes: "Notice received Oct 23. Standard 30-day dispute window active. Ready for formal Promissory Note & Assignment Validation Letter.",
    legalFramework: "15 U.S.C. § 1692g & NY CCFA"
  }
];

export const INITIAL_INTERACTIONS = [
  {
    id: "int-100",
    caseId: "case-sm-2026-0041",
    timestamp: "2026-10-11 10:15 AM",
    direction: "Incoming",
    channel: "Phone",
    contactName: "Midland Senior Negotiator #882",
    durationSec: 210,
    summary: "Collector demanded payment on Citibank credit card balance, claiming legal action was imminent. Account was purchased in a bulk portfolio without chain of custody documentation.",
    violations: [
      {
        citation: "15 U.S.C. § 1692e(5)",
        title: "Threatening legal suit without verifying title or legal authority to file",
        damages: 1000.00
      },
      {
        citation: "12 C.F.R. § 1006.34",
        title: "Failure to provide mandatory CFPB Regulation F validation notice itemization",
        damages: 1000.00
      }
    ],
    recorded: true
  },
  {
    id: "int-101",
    caseId: "case-sm-2026-0043",
    timestamp: "2026-10-09 09:42 PM",
    direction: "Incoming",
    channel: "Phone",
    contactName: "Agent Miller #412",
    durationSec: 185,
    summary: "Collector called at 9:42 PM (outside 8 AM - 9 PM window) regarding auto loan deficiency balance. Threatening immediate credit destruction and wage attachment without judgment.",
    violations: [
      {
        citation: "15 U.S.C. § 1692c(a)(1)",
        title: "Communication at inconvenient time (post-9:00 PM debtor local time)",
        damages: 1000.00
      },
      {
        citation: "15 U.S.C. § 1692e(4)",
        title: "Unlawful threat of wage garnishment prior to civil judgment",
        damages: 1000.00
      }
    ],
    recorded: true
  },
  {
    id: "int-102",
    caseId: "case-sm-2026-0042",
    timestamp: "2026-10-14 11:22 AM",
    direction: "Outgoing",
    channel: "Mail",
    contactName: "Apex Recovery Compliance Unit",
    durationSec: 0,
    summary: "USPS Certified Mail Delivery Confirmed (#7021 0950 0001 8492 1104). Formal DVL demand delivered; statutory validation stay active.",
    violations: [],
    recorded: false
  },
  {
    id: "int-103",
    caseId: "case-sm-2026-0042",
    timestamp: "2026-10-18 03:15 PM",
    direction: "Incoming",
    channel: "Phone",
    contactName: "Apex Recovery Representative",
    durationSec: 75,
    summary: "Incoming telephone collection contact made after verified delivery of validation demand before verification was furnished.",
    violations: [
      {
        citation: "15 U.S.C. § 1692g(b)",
        title: "Continued telephone collection prior to furnishing verification of debt",
        damages: 1000.00
      }
    ],
    recorded: false
  },
  {
    id: "int-104",
    caseId: "case-sm-2026-0044",
    timestamp: "2026-10-23 09:00 AM",
    direction: "Incoming",
    channel: "Mail",
    contactName: "Cadence Receivables LLC",
    durationSec: 0,
    summary: "Initial written dunning notice received from Cadence Receivables for Upstart installment loan balance.",
    violations: [],
    recorded: false
  }
];

export const INITIAL_EVIDENCE = [
  {
    id: "ev-00",
    caseId: "case-sm-2026-0041",
    title: "Citibank Final Card Statement & Charge-off Notice.pdf",
    docType: "Billing Statement",
    fileSize: "1.8 MB",
    batesStamp: "BATES-SM-2026-0041-EV01",
    sha256Hash: "5a22d710b14b3f88ef49190c1092a472910fa88921bdfc0199e4001dca41f90a",
    uploadedDate: "2026-10-07"
  },
  {
    id: "ev-01",
    caseId: "case-sm-2026-0042",
    title: "Metro Health ER Itemized Bill.pdf",
    docType: "Clinical Record",
    fileSize: "2.1 MB",
    batesStamp: "BATES-SM-2026-0042-EV01",
    sha256Hash: "8c77d901a14b3f88ef49190c1092a472910fa88921bdfc0199e4001dca41f90a",
    uploadedDate: "2026-10-04"
  },
  {
    id: "ev-02",
    caseId: "case-sm-2026-0042",
    title: "USPS Certified Mail Receipt 7021.pdf",
    docType: "Postal Receipt",
    fileSize: "740 KB",
    batesStamp: "BATES-SM-2026-0042-EV02",
    sha256Hash: "3f901192da08bca019284716aebdf48910ca981726a455018b9914c8100ff912",
    uploadedDate: "2026-10-14"
  },
  {
    id: "ev-03",
    caseId: "case-sm-2026-0043",
    title: "Late Night Call Voicemail Recording.wav",
    docType: "Audio Log",
    fileSize: "4.8 MB",
    batesStamp: "BATES-SM-2026-0043-EV01",
    sha256Hash: "6e01a890bd819a820461829e102947190ca817293bca819028eab7162940af11",
    uploadedDate: "2026-10-09"
  },
  {
    id: "ev-04",
    caseId: "case-sm-2026-0044",
    title: "Cadence Receivables Upstart Notice.pdf",
    docType: "Scanned Notice",
    fileSize: "1.1 MB",
    batesStamp: "BATES-SM-2026-0044-EV01",
    sha256Hash: "110481720a4b892ca8910471928cbe019482910abfc771920ca8819014bca811",
    uploadedDate: "2026-10-23"
  }
];

export const INITIAL_CREDIT_TRADELINES = [
  {
    id: "cr-00",
    caseId: "case-sm-2026-0041",
    bureau: "Experian",
    agencyName: "MIDLAND CREDIT MANAGEMENT",
    accountNumber: "MCM-99214-****",
    reportedBalance: 3420.00,
    disputeRemarkStatus: "COLLECTION_ACCOUNT",
    compliant: false, // Violation: omitted notice of dispute after consumer letter
    lastReportedDate: "2026-10-14"
  },
  {
    id: "cr-01",
    caseId: "case-sm-2026-0042",
    bureau: "Experian",
    agencyName: "APEX RECOVERY GROUP",
    accountNumber: "APX-88201-****",
    reportedBalance: 2350.00,
    disputeRemarkStatus: "DISPUTED_BY_CONSUMER",
    compliant: true,
    lastReportedDate: "2026-10-16"
  },
  {
    id: "cr-02",
    caseId: "case-sm-2026-0042",
    bureau: "Equifax",
    agencyName: "APEX RECOVERY GROUP",
    accountNumber: "APX-88201-****",
    reportedBalance: 2350.00,
    disputeRemarkStatus: "COLLECTION_ACCOUNT",
    compliant: false, // Violation: omitted notice of dispute
    lastReportedDate: "2026-10-18"
  },
  {
    id: "cr-03",
    caseId: "case-sm-2026-0043",
    bureau: "TransUnion",
    agencyName: "NORTHERN FINANCIAL BILLING",
    accountNumber: "NFB-44102-****",
    reportedBalance: 4150.00,
    disputeRemarkStatus: "DISPUTED_IN_WRITING",
    compliant: true,
    lastReportedDate: "2026-10-01"
  }
];
