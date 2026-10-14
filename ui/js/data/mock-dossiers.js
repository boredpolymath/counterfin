/**
 * SettleMint Initial Seed Data & Domain Fixtures
 * Conforming to Medical Debt Collection Specifications & Patient Protection Dashboard
 */

export const USER_PROFILE = {
  name: "Sarah Henderson",
  shortName: "Sarah",
  initials: "SH",
  statuteState: "NY",
  totalUnderReview: 4820.00,
  activeAccountsCount: 3,
  nextDeadlineDays: 11,
  nextDeadlineAgency: "Apex Recovery Group",
  violationsTotal: 3,
  potentialStatutoryClaim: 3000.00
};

export const INITIAL_CASES = [
  {
    id: "case-sm-2026-0042",
    docketNumber: "BATES-SM-2026-0042",
    debtorName: "Sarah Henderson",
    originalProvider: "Metro Health System (ER Visit)",
    providerCategory: "Emergency Department",
    iconType: "emergency",
    collectionAgency: "Apex Recovery Group",
    originalAccountNumber: "MHS-99412-ER",
    collectionAccountNumber: "APX-88201-9",
    dateOfService: "2024-04-12",
    initialNoticeDate: "2026-10-03",
    originalBalance: 2350.00,
    disputedBalance: 2350.00,
    currentPhase: "ValidationPending", // State machine phase
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
    notes: "Emergency department physician billing dispute. DVL delivered via USPS Certified Mail Oct 14. 11 days remaining for validation."
  },
  {
    id: "case-sm-2026-0043",
    docketNumber: "BATES-SM-2026-0043",
    debtorName: "Sarah Henderson",
    originalProvider: "St. Jude Cardiology",
    providerCategory: "Specialist Consultation",
    iconType: "cardiology",
    collectionAgency: "Northern Financial Billing",
    originalAccountNumber: "SJC-33019-CARD",
    collectionAccountNumber: "NFB-44102-B",
    dateOfService: "2023-09-18",
    initialNoticeDate: "2026-09-15",
    originalBalance: 1580.00,
    disputedBalance: 1580.00,
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
    notes: "Late-night call recorded & flagged for statutory penalty. Written stop-contact notice served."
  },
  {
    id: "case-sm-2026-0044",
    docketNumber: "BATES-SM-2026-0044",
    debtorName: "Sarah Henderson",
    originalProvider: "Valley Imaging (MRI Scan)",
    providerCategory: "Diagnostic Radiology",
    iconType: "imaging",
    collectionAgency: "Cadence Receivables LLC",
    originalAccountNumber: "VAL-55104-MRI",
    collectionAccountNumber: "CR-10923-C",
    dateOfService: "2024-08-11",
    initialNoticeDate: "2026-10-23",
    originalBalance: 890.00,
    disputedBalance: 890.00,
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
    notes: "Notice received Oct 23. Standard 30-day dispute window active. Ready for formal Debt Validation Letter."
  }
];

export const INITIAL_INTERACTIONS = [
  {
    id: "int-101",
    caseId: "case-sm-2026-0043",
    timestamp: "2026-10-09 09:42 PM",
    direction: "Incoming",
    channel: "Phone",
    contactName: "Agent Miller #412",
    durationSec: 185,
    summary: "Collector called at 9:42 PM (outside 8 AM - 9 PM window). Threatening immediate credit destruction and wage attachment without judgment.",
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
    summary: "Initial written dunning notice received from Cadence Receivables for Valley Imaging bill.",
    violations: [],
    recorded: false
  }
];

export const INITIAL_EVIDENCE = [
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
    title: "Cadence Receivables Initial Notice.pdf",
    docType: "Scanned Notice",
    fileSize: "1.1 MB",
    batesStamp: "BATES-SM-2026-0044-EV01",
    sha256Hash: "110481720a4b892ca8910471928cbe019482910abfc771920ca8819014bca811",
    uploadedDate: "2026-10-23"
  }
];

export const INITIAL_CREDIT_TRADELINES = [
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
    reportedBalance: 1580.00,
    disputeRemarkStatus: "DISPUTED_IN_WRITING",
    compliant: true,
    lastReportedDate: "2026-10-01"
  }
];
