/**
 * SettleMint Initial Seed Data & Domain Fixtures
 * Conforming to Medical Debt Collection Specifications
 */

export const INITIAL_CASES = [
  {
    id: "case-sm-2026-0042",
    docketNumber: "BATES-SM-2026-0042",
    debtorName: "Eleanor Vance",
    originalProvider: "North Shore University Hospital",
    collectionAgency: "Apex Recovery Management LLC",
    originalAccountNumber: "NSH-99218-ER",
    collectionAccountNumber: "APX-88201-9",
    dateOfService: "2024-04-12",
    initialNoticeDate: "2026-09-25",
    originalBalance: 4850.00,
    disputedBalance: 4850.00,
    currentPhase: "ValidationPending", // State machine phase
    statuteState: "NY",
    statuteLimitYears: 3,
    statutoryDaysRemaining: 18,
    certifiedMailTracking: "7021 0950 0001 8492 1104",
    certifiedMailDeliveredDate: "2026-10-02",
    violationsCount: 2,
    potentialDamages: 2000.00,
    notes: "Emergency department billing dispute. Unverified physician group facility fees."
  },
  {
    id: "case-sm-2026-0043",
    docketNumber: "BATES-SM-2026-0043",
    debtorName: "Eleanor Vance",
    originalProvider: "Metro Imaging Diagnostics",
    collectionAgency: "Paramount Credit Services Inc",
    originalAccountNumber: "MID-44019-MRI",
    collectionAccountNumber: "PCS-55910-A",
    dateOfService: "2023-11-08",
    initialNoticeDate: "2026-08-10",
    originalBalance: 1240.00,
    disputedBalance: 1240.00,
    currentPhase: "DisputeEscalated",
    statuteState: "NY",
    statuteLimitYears: 3,
    statutoryDaysRemaining: 0,
    certifiedMailTracking: "7021 0950 0002 9183 4401",
    certifiedMailDeliveredDate: "2026-08-20",
    violationsCount: 1,
    potentialDamages: 1000.00,
    notes: "Failed to supply chain of title after 30-day window elapsed. Reporting unverified debt to Experian."
  },
  {
    id: "case-sm-2026-0044",
    docketNumber: "BATES-SM-2026-0044",
    debtorName: "Eleanor Vance",
    originalProvider: "Regional Pathology Labs",
    collectionAgency: "Frontier Debt Associates",
    originalAccountNumber: "RPL-10294-LAB",
    collectionAccountNumber: "FDA-00912-C",
    dateOfService: "2025-01-14",
    initialNoticeDate: "2026-10-01",
    originalBalance: 620.00,
    disputedBalance: 620.00,
    currentPhase: "InitialNotice",
    statuteState: "NY",
    statuteLimitYears: 3,
    statutoryDaysRemaining: 24,
    certifiedMailTracking: "",
    certifiedMailDeliveredDate: null,
    violationsCount: 0,
    potentialDamages: 0.00,
    notes: "Initial demand letter received. Preparing formal Debt Validation Letter (DVL)."
  }
];

export const INITIAL_INTERACTIONS = [
  {
    id: "int-101",
    caseId: "case-sm-2026-0042",
    timestamp: "2026-10-08 07:14 AM",
    direction: "Incoming",
    channel: "Phone",
    contactName: "Agent Marcus #310",
    durationSec: 140,
    summary: "Collector called before 8:00 AM statutory window. Demanded immediate debit card payment under threat of wage garnishment.",
    violations: [
      {
        citation: "15 U.S.C. § 1692c(a)(1)",
        title: "Communication at unusual or inconvenient time (prior to 8:00 AM)",
        damages: 1000.00
      },
      {
        citation: "15 U.S.C. § 1692e(4)",
        title: "Threat of garnishment without legal judgment",
        damages: 1000.00
      }
    ],
    recorded: false
  },
  {
    id: "int-102",
    caseId: "case-sm-2026-0042",
    timestamp: "2026-10-02 10:14 AM",
    direction: "Outgoing",
    channel: "Mail",
    contactName: "Apex Recovery Compliance Dept",
    durationSec: 0,
    summary: "USPS Certified Mail Delivery Confirmed (Tracking #7021 0950 0001 8492 1104). DVL Demand delivered.",
    violations: [],
    recorded: false
  },
  {
    id: "int-103",
    caseId: "case-sm-2026-0042",
    timestamp: "2026-09-28 02:40 PM",
    direction: "Outgoing",
    channel: "Mail",
    contactName: "Apex Recovery Management LLC",
    durationSec: 0,
    summary: "Mailed Formal Debt Validation Letter via USPS Certified Mail demanding chain of title and itemized billing.",
    violations: [],
    recorded: false
  }
];

export const INITIAL_EVIDENCE = [
  {
    id: "ev-01",
    caseId: "case-sm-2026-0042",
    title: "Apex Initial Collection Notice.pdf",
    docType: "Scanned Notice",
    fileSize: "1.4 MB",
    batesStamp: "BATES-SM-2026-0042-EV01",
    sha256Hash: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
    uploadedDate: "2026-09-26"
  },
  {
    id: "ev-02",
    caseId: "case-sm-2026-0042",
    title: "Certified Mail Receipt Form 3800.png",
    docType: "Postal Receipt",
    fileSize: "820 KB",
    batesStamp: "BATES-SM-2026-0042-EV02",
    sha256Hash: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
    uploadedDate: "2026-09-28"
  },
  {
    id: "ev-03",
    caseId: "case-sm-2026-0042",
    title: "Voicemail Recording - Early Morning Harassment.wav",
    docType: "Audio Log",
    fileSize: "3.1 MB",
    batesStamp: "BATES-SM-2026-0042-EV03",
    sha256Hash: "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a",
    uploadedDate: "2026-10-08"
  }
];

export const INITIAL_CREDIT_TRADELINES = [
  {
    id: "cr-01",
    caseId: "case-sm-2026-0042",
    bureau: "Experian",
    agencyName: "APEX RECOVERY MGMT",
    accountNumber: "APX-88201-****",
    reportedBalance: 4850.00,
    disputeRemarkStatus: "DISPUTED_BY_CONSUMER",
    compliant: true,
    lastReportedDate: "2026-10-05"
  },
  {
    id: "cr-02",
    caseId: "case-sm-2026-0042",
    bureau: "Equifax",
    agencyName: "APEX RECOVERY MGMT",
    accountNumber: "APX-88201-****",
    reportedBalance: 4850.00,
    disputeRemarkStatus: "COLLECTION_ACCOUNT", // Violation: omitted dispute remark
    compliant: false,
    lastReportedDate: "2026-10-01"
  },
  {
    id: "cr-03",
    caseId: "case-sm-2026-0042",
    bureau: "TransUnion",
    agencyName: "APEX RECOVERY MGMT",
    accountNumber: "APX-88201-****",
    reportedBalance: 4850.00,
    disputeRemarkStatus: "NOT_REPORTED",
    compliant: true,
    lastReportedDate: "2026-09-20"
  }
];
