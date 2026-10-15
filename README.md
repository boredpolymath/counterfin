<p align="center">
  <img src="assets/settlemint-banner.png" alt="SettleMint — Credit Shield & Dispute Console" width="100%" style="max-width: 850px; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.15);" />
</p>

# SettleMint: Consumer Credit Shield & Dispute Console

[![Continuous Integration](https://github.com/boredpolymath/settlemint/actions/workflows/ci.yml/badge.svg)](https://github.com/boredpolymath/settlemint/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Rust: 1.90+](https://img.shields.io/badge/Rust-1.90%2B-blue.svg?logo=rust)](https://www.rust-lang.org/)
[![Tauri: v2](https://img.shields.io/badge/Tauri-v2.12-24C8D8.svg?logo=tauri)](https://tauri.app/)
[![Security: Zero-Telemetry](https://img.shields.io/badge/Telemetry-Zero--Network-10B981.svg)](#privacy--security-by-design)
[![Platform: macOS | Windows | Linux](https://img.shields.io/badge/Platform-macOS%20|%20Windows%20|%20Linux-lightgrey.svg)](#getting-started)

[![Checked by VibeDoctor](https://vibedoctor.io/api/badges/a33595b8-5f22-42e9-9b0e-4a0f05b49ad8)](https://vibedoctor.io)

> **SettleMint** is a free, open-source, local-first desktop app that empowers consumers to defend against debt collectors. Whether dealing with credit card debt, hospital bills, auto loan deficiencies, or personal loans, SettleMint helps you organize notices, track statutory deadlines, catch illegal collection practices, and generate formal dispute letters—all without your data ever leaving your computer.

---

## ⚖️ Legal Disclaimer

> **IMPORTANT NOTICE: SELF-ADVOCACY TOOL ONLY**  
> SettleMint is an informational, record-keeping, and procedural drafting utility designed for consumer self-advocacy under federal and state law (including the Fair Debt Collection Practices Act, 15 U.S.C. § 1692). **SettleMint is not a law firm, does not provide legal representation, and does not provide formal legal advice.**  
>
> Using this application does not create an attorney-client relationship. If you are facing an active lawsuit, a court summons, or require formal legal representation, please consult a licensed consumer rights attorney or legal aid organization in your jurisdiction.

---

## 📌 Table of Contents

- [What is SettleMint? (In Plain English)](#-what-is-settlemint-in-plain-english)
- [How It Works: 3 Simple Steps](#-how-it-works-3-simple-steps)
- [Key Features](#-key-features)
- [Debts Covered Under Federal Law (FDCPA)](#-debts-covered-under-federal-law-fdcpa)
- [Privacy & Security by Design](#-privacy--security-by-design)
- [For Developers & Contributors](#-for-developers--contributors)
  - [Tech Stack](#tech-stack)
  - [Prerequisites](#prerequisites)
  - [Quick Start Guide](#quick-start-guide)
  - [Project Directory Structure](#project-directory-structure)
  - [Testing & Quality Assurance](#testing--quality-assurance)
- [How to Contribute](#-how-to-contribute)
- [Community & Support](#-community--support)
- [License](#-license)

---

## 💡 What is SettleMint? (In Plain English)

Dealing with debt collection agencies can feel intimidating, confusing, and overwhelming. Collection agencies often rely on pressure tactics, incomplete documentation, and expired statutes of limitations.

**SettleMint levels the playing field.** It acts as your personal digital case manager:

1. **Keeps Everything in One Place:** Organize collection notices, creditor names, original account numbers, and alleged balances securely on your computer.
2. **Watches Your Deadlines:** Never miss the crucial **30-Day Debt Validation Window** under federal law.
3. **Flags Expired Debts:** Automatically checks whether a debt is past your state’s **Statute of Limitations (SOL)** so you don't accidentally revive a legally unenforceable debt.
4. **Catches Illegal Collector Behavior:** Keeps a timestamped log of phone calls, threats, and harassing behavior that violate the law.
5. **Drafts Professional Dispute Letters:** Generates customized, legally grounded dispute letters ready to print, sign, and mail via Certified Mail.

---

## 🚀 How It Works: 3 Simple Steps

```
┌─────────────────────────┐     ┌─────────────────────────┐     ┌─────────────────────────┐
│  1. Log Your Notice     │ ──> │  2. Spot Violations     │ ──> │  3. Send Your Dispute   │
│  Add creditor details,  │     │  App checks deadlines,  │     │  Preview, edit, and     │
│  dates & debt types.    │     │  SOL rules & illegal acts│    │  print customized letter│
└─────────────────────────┘     └─────────────────────────┘     └─────────────────────────┘
```

1. **Log Your Notice:** Enter details from the collector's letter or phone call (e.g., credit card balance, hospital bill, or car loan deficiency).
2. **Review Statutory Analysis:** SettleMint instantly calculates your 30-day response window, checks your state's statute of limitations, and audits whether the collector provided required chain-of-title proof.
3. **Generate & Send Dispute Letters:** Choose a tailored dispute template (Debt Validation, Time-Barred Cease & Desist, or Medical Coding Audit), customize it live in the preview editor, and print it out.

---

## ✨ Key Features

### 🗂️ Multi-Debt Case Dossiers
Organize disputes by debt type with custom color-coded indicators:
* **Credit Card Debt:** Audit junk debt buyers (Midland, Portfolio Recovery, LVNV) for missing chains of assignment, cardholder agreements, and itemized billing statements.
* **Medical Bills:** Request itemized billing with diagnostic and procedure codes (CPT/ICD-10) and check for out-of-network balance billing protections under the No Surprises Act.
* **Auto Loan Deficiencies:** Audit vehicle repossession sales for required UCC Article 9 auction accounting and gross proceeds calculations.
* **Personal & Installment Loans:** Demand proof of original promissory notes, lawful assignment, and state debt collector licensing.

### ⏱️ Statutory Deadline & SOL Engine
* **30-Day FDCPA Clock:** Countdown timer tracking your right to dispute and halt collection efforts under 15 U.S.C. § 1692g.
* **Statute of Limitations (SOL) Watcher:** 50-state engine calculating whether a debt is time-barred (e.g., NY 3-year Consumer Credit Fairness Act, CA 4-year, TX 4-year, FL 5-year), with active warnings against partial payment traps that restart expired timers.

### 📜 Side-by-Side Letter Studio
* **Interactive Document Preview:** Real-time side-by-side editing pane with live Bates-stamping, legal citation checklists, and one-click print/PDF export.
* **Built-in Statutory Checklists:** Tailor demands with a single click (e.g., demand proof of original signature, accounting of interest and fees, or immediate cessation of phone calls).

### 📞 Interaction Stream & Violation Tracker
* **Communication Log:** Record incoming and outgoing calls, letters, and emails with collectors.
* **Automatic Violation Flagging:** Flags illegal actions under federal law (calls outside 8 AM–9 PM, calls at work after notice, abusive language, or threatening legal action on time-barred debt).
* **Damages Calculator:** Keeps a running tally of potential statutory damages under 15 U.S.C. § 1692k (up to $1,000 per proceeding plus actual damages).

---

## 🏛️ Debts Covered Under Federal Law (FDCPA)

Under the Fair Debt Collection Practices Act (15 U.S.C. § 1692a(5)), federal consumer protections cover debts incurred primarily for personal, family, or household purposes:

| Debt Classification | Typical Creditors & Collectors | What SettleMint Audits & Demands |
|---|---|---|
| **💳 Credit Card Debt** | Banks, Junk Debt Buyers *(Midland, PRA, LVNV)* | Unbroken chain of title, charge-off billing history, Reg F itemization (12 CFR § 1006.34). |
| **🏥 Medical Debt** | Hospitals, Clinics, Medical Collection Agencies | Itemized CPT/ICD-10 codes, insurance adjustments, No Surprises Act compliance. |
| **🚗 Auto Deficiency** | Auto Lenders, Repossession Collection Firms | UCC Article 9 repossession accounting, notice of sale timeliness, auction reasonableness. |
| **📑 Personal Loans** | Fintech Lenders, Installment Loan Companies | Original signed promissory note, state collector licensing, and surety bond verification. |
| **⚡ Utility & Telecom** | Cell Carriers, Cable Providers, Utilities | Service contract validation, meter/usage billing history, credit bureau reporting marks. |

---

## 🔒 Privacy & Security by Design

Financial and medical records are deeply personal. SettleMint is engineered with a strict **local-first, zero-telemetry** architecture:

* **100% Local Storage:** All records, dispute notes, and scans are stored on your local machine in an encrypted SQLite database.
* **Zero Telemetry & Zero Cloud:** No analytics trackers, no advertising pixels, no remote error-tracking services, and no user accounts required.
* **Offline First:** Fully functional without an internet connection. Your private financial data never traverses any cloud servers.
* **Memory Protection:** Sensitive fields (such as account numbers and SSNs) are cleared from application memory as soon as they are no longer in use.

---

## 🛠️ For Developers & Contributors

### Tech Stack

* **Core Runtime:** [Tauri v2](https://tauri.app/) (Lightweight, secure native desktop wrapper using system webviews).
* **Backend:** [Rust](https://www.rust-lang.org/) (High performance, memory safety, embedded SQLite via `rusqlite`, cryptographic hashing with `sha2`).
* **Frontend:** Clean Vanilla HTML5, Modern CSS (Design tokens, fluid grid, dark/light clinical themes), and ES6+ JavaScript. *No heavy node dependencies, no Tailwind bloat.*

### Prerequisites

1. **Rust Toolchain:** Stable Rust (`rustc >= 1.90.0`, `cargo`). Install via [rustup.rs](https://rustup.rs/).
2. **Tauri CLI v2:**
   ```bash
   cargo install tauri-cli --version "^2.0"
   ```
3. **Platform Build Tools:**
   * **macOS:** Xcode Command Line Tools (`xcode-select --install`).
   * **Windows:** Visual Studio C++ Build Tools & Microsoft WebView2 Runtime.
   * **Linux:** `libwebkit2gtk-4.1-dev`, `build-essential`, `libssl-dev`, `libgtk-3-dev`, `libayatana-appindicator3-dev`.

### Quick Start Guide

```bash
# 1. Clone the repository
git clone https://github.com/boredpolymath/settlemint.git
cd settlemint

# 2. Verify backend compilation
cd src-tauri
cargo check

# 3. Launch the desktop app in development mode
cargo tauri dev
```

### Project Directory Structure

```text
settlemint/
├── assets/                     # Branding, screenshots, and visual assets
│   └── settlemint-banner.png   # Official SettleMint Credit Shield banner
│
├── src-tauri/                  # Native Rust Core & Desktop Engine
│   ├── Cargo.toml              # Rust crate dependencies
│   ├── tauri.conf.json         # Tauri window configuration & CSP
│   └── src/
│       ├── main.rs             # Application entrypoint
│       ├── lib.rs              # Tauri IPC command registration
│       ├── db/                 # SQLite database schema & migrations
│       ├── models/             # Domain entities (DebtType, Case, Violation, etc.)
│       ├── engine/             # FDCPA, State SOL, and Template drafting engines
│       ├── commands/           # Frontend-to-Backend IPC handlers
│       └── tray/               # Lightweight desktop tray daemon (< 25MB RSS)
│
├── ui/                         # Clean Web Frontend (No Node build step needed)
│   ├── index.html              # Main dashboard, modals, and legal compliance views
│   ├── css/                    # Modular vanilla styling (tokens, layout, components)
│   └── js/                     # Application logic, mock fixtures, and view renderers
│       ├── app.js              # Event coordinator & UI controller
│       ├── ipc.js              # Tauri IPC bridge with offline fallback
│       └── views/              # View modules (Dashboard, Letter Studio, Stream, etc.)
│
├── CONTRIBUTING.md             # Contribution guidelines & coding conventions
├── CODE_OF_CONDUCT.md          # Contributor Covenant v2.1
├── LICENSE                     # MIT License
└── README.md                   # You are here!
```

### Testing & Quality Assurance

Ensure all tests and linters pass before opening a pull request:

```bash
# Run backend test suite
cargo test --all

# Run strict Clippy linter
cargo clippy --all-targets -- -D warnings

# Check code formatting
cargo fmt --all --check
```

---

## 🤝 How to Contribute

We love contributions! Whether you're an engineer, a consumer rights advocate, or a designer, there are many ways to get involved:

* **Add State SOL Rules:** Help expand our Statute of Limitations matrix for your state in `src-tauri/src/engine/sol.rs`.
* **Refine Dispute Templates:** Improve letter templates in `src-tauri/src/engine/templates.rs` to address emerging collection agency tactics.
* **Enhance the UI:** Improve accessibility, responsiveness, and keyboard shortcuts in the `ui/` directory.
* **Report Bugs & Suggest Features:** Use our [Issue Templates](.github/ISSUE_TEMPLATE/) to submit ideas or bug reports.

Please read our [Contributing Guide](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before submitting a pull request.

---

## 💬 Community & Support

* **Issues & Discussions:** [GitHub Issues](https://github.com/boredpolymath/settlemint/issues)
* **Security Reports:** Please review [SECURITY.md](SECURITY.md) for responsible disclosure guidelines.
* **Maintainer:** Bored Polymath Studios

---

## 📄 License

This project is open-source software licensed under the **[MIT License](LICENSE)**.  
Copyright © 2026 Bored Polymath Studios.
