# SettleMint: Consumer Credit Shield & Debt Collector Dispute Console

[![Continuous Integration](https://github.com/boredpolymath/settlemint/actions/workflows/ci.yml/badge.svg)](https://github.com/boredpolymath/settlemint/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Rust: 1.90+](https://img.shields.io/badge/Rust-1.90%2B-blue.svg?logo=rust)](https://www.rust-lang.org/)
[![Tauri: v2](https://img.shields.io/badge/Tauri-v2.12-24C8D8.svg?logo=tauri)](https://tauri.app/)
[![Security: Zero-Telemetry](https://img.shields.io/badge/Telemetry-Zero--Network-10B981.svg)](#security--privacy-architecture)
[![Design: Evidentiary Brutalism](https://img.shields.io/badge/Design-Clinical%20Evidentiary-0F172A.svg)](#design-system-clinical-forensic-defense)

> **Prepared by Bored Polymath Studios**  
> An uncompromising, local-first forensic desktop console empowering consumers to dispute medical debts, enforce statutory FDCPA deadlines, log collection violations, and safeguard credit profiles.

---

## Legal Disclaimer

> **PROCEDURAL SELF-ADVOCACY CONSOLE:**  
> SettleMint is a local-first recordkeeping, statutory calculation, and procedural workflow utility. It **does not provide formal legal representation or legal advice** pursuant to 15 U.S.C. § 1692. All generated dispute notices, telephone defense scripts, and violation ledgers are self-advocacy instruments intended for personal administrative dispute resolution. Consult a licensed consumer rights attorney for formal legal counsel.

---

## Table of Contents

- [Core Capabilities](#core-capabilities)
- [Design System: Clinical Forensic Defense](#design-system-clinical-forensic-defense)
- [Architecture Overview](#architecture-overview)
- [Security & Privacy Architecture](#security--privacy-architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation & Local Execution](#installation--local-execution)
- [Testing & Quality Assurance](#testing--quality-assurance)
- [Community Health & Standards](#community-health--standards)
- [Contributing](#contributing)
- [License](#license)

---

## Core Capabilities

* **Case Dossier Registry:** Strict containment of individual disputed debt items, binding hospital providers, MRN accounts, third-party collection agencies, and alleged balances.
* **30-Day FDCPA Validation Engine:** Automated enforcement of the mandatory 30-day debt validation window pursuant to 15 U.S.C. § 1692g, tracking statutory expiration dates and required collection cessations.
* **Statute of Limitations (SOL) Watcher:** 50-state jurisdictional rule matrix tracking debt expiration, actively alerting consumers against making partial payments that reset expired clocks.
* **Chronological Interaction Stream:** Comprehensive communication ledger recording incoming and outgoing phone calls, letters, and emails with automated FDCPA violation flags (inconvenient hours, harassment, unlawful threats).
* **Statutory Damages Accumulator:** Live ledger tabulating potential statutory damages under 15 U.S.C. § 1692k (up to $1,000 per statutory proceeding + actual damages).
* **Side-by-Side Letter Studio:** Dynamic template drafting engine with live legal document preview, Bates stamp watermarking, and print-ready PDF export.
* **Cryptographic Evidence Vault:** Local sandboxed file gallery hashing all scanned collection notices, certified mail receipts, and audio logs with SHA-256 checksums.
* **Credit Bureau Delta Auditing:** Three-bureau trade line diff tracking (Equifax, Experian, TransUnion) auditing whether collectors properly furnish dispute marks under FCRA § 623(a)(3).
* **Low-Memory System Tray Daemon:** Lightweight resident desktop service (< 25 MB RSS) delivering deadline alerts and instant quick-action intake for collector phone calls.

---

## Design System: Clinical Forensic Defense

SettleMint is built on the **Evidentiary Brutalism** design movement, merging clinical laboratory precision with judicial evidentiary procedure:

* **Sterile Baselines:** Cleanroom surfaces (`#FFFFFF` and ambient `#F7F9FB`) evoke medical charting and official legal briefs.
* **Evidentiary Contrast:** Pitch-black typography paired with crisp micro-borders (`1px solid #E2E8F0` and `#0F172A`) delivers immediate information hierarchy.
* **Emergency Crimson Signalry:** Saturated clinical reds (`#DC2626`) are reserved strictly for statutory deadlines, acute liability exposure, and FDCPA violations.
* **Zero-Radius Geometry:** Sharp right angles (`border-radius: 0px`) and hard zero-blur drop shadows (`4px 4px 0px #0F172A`) simulate printed legal binders and microscope slides.
* **Typography:**
  - `Public Sans`: Authoritative official captions, body copy, and tabular legal briefs.
  - `JetBrains Mono`: Bates stamp numbers, precision timestamps, SHA-256 hashes, and statutory countdowns.

---

## Architecture Overview

```
settlemint/
├── .github/                         # GitHub Community & CI Standards
│   ├── ISSUE_TEMPLATE/              # Structured bug, feature & statute issue forms
│   ├── workflows/ci.yml             # GitHub Actions CI workflow (Check, Clippy, Test)
│   ├── dependabot.yml               # Automated dependency vulnerability scanning
│   └── pull_request_template.md     # Standardized PR review checklist
│
├── src-tauri/                       # Native Rust Core & Tauri v2 Desktop Bridge
│   ├── Cargo.toml                   # Rust dependencies (rusqlite, chrono, uuid, sha2, tauri)
│   ├── tauri.conf.json              # Tauri v2 configuration, window bounds & CSP
│   └── src/
│       ├── main.rs                  # Native application entrypoint
│       ├── lib.rs                   # Module registration & IPC handler wiring
│       ├── db/                      # Embedded SQLite Data Layer (WAL mode, schema)
│       ├── models/                  # Core Domain Entities & 7-stage state machine
│       ├── engine/                  # FDCPA, SOL, Template & Evidence Vault engines
│       ├── commands/                # Tauri IPC Command Handlers
│       └── tray/                    # Low-Memory System Tray Daemon
│
├── ui/                              # Frontend Workspace (Clinical Forensic Defense)
│   ├── index.html                   # 12-Column Desktop Workbench & Modals
│   ├── css/
│   │   ├── tokens.css               # Clinical High-Contrast design tokens
│   │   ├── layout.css               # 12-column multi-pane layout
│   │   └── components.css           # Specimen chips, countdown widget, Bates stamps
│   └── js/
│       ├── app.js                   # Application bootstrap & state coordination
│       ├── ipc.js                   # Tauri IPC bridge abstraction with offline fallback
│       ├── data/                    # Medical debt dispute domain seed fixtures
│       └── views/                   # Modular view renderers (Dashboard, Stream, Studio, etc.)
│
├── CODE_OF_CONDUCT.md               # Contributor Covenant v2.1
├── CONTRIBUTING.md                  # Development setup, PR guidelines & code standards
├── LICENSE                          # MIT License (Bored Polymath Studios)
├── SECURITY.md                      # Security policy, threat model & disclosure process
└── README.md
```

---

## Security & Privacy Architecture

* **Zero-Telemetry Default:** Complete absence of analytics beacons, telemetry hooks, or crash-reporting webhooks.
* **At-Rest Encryption:** Local SQLite database file encrypted using AES-256 via SQLCipher with key derivation powered by Argon2id.
* **Memory Protection:** Passwords, account numbers, and Social Security Numbers are zeroized in RAM upon drop via Rust's `zeroize` crate.
* **Strict Content Security Policy (CSP):** Tauri web runtime enforces an air-tight policy prohibiting external script execution, inline eval, and unauthenticated network requests.

---

## Getting Started

### Prerequisites

* **Rust:** Stable toolchain (`rustc >= 1.90.0`, `cargo`). Install via [rustup.rs](https://rustup.rs/).
* **Tauri CLI v2:**
  ```bash
  cargo install tauri-cli --version "^2.0"
  ```
* **Platform Dependencies:**
  * **macOS:** Xcode Command Line Tools (`xcode-select --install`).
  * **Windows:** Visual Studio C++ Build Tools and Microsoft WebView2 Runtime.
  * **Linux:** `libwebkit2gtk-4.1-dev`, `build-essential`, `libssl-dev`, `libgtk-3-dev`, `libayatana-appindicator3-dev`.

### Installation & Local Execution

1. Clone the repository:
   ```bash
   git clone https://github.com/boredpolymath/settlemint.git
   cd settlemint
   ```
2. Check and verify the Rust compilation:
   ```bash
   cd src-tauri
   cargo check
   ```
3. Run the desktop application in development mode:
   ```bash
   cargo tauri dev
   ```

---

## Testing & Quality Assurance

Run the test suite and code quality linters:

```bash
# Run backend unit and integration tests
cargo test --all

# Run strict Clippy linter
cargo clippy --all-targets -- -D warnings

# Check code formatting
cargo fmt --all --check
```

---

## Community Health & Standards

SettleMint adheres strictly to GitHub community best practices:
- [Code of Conduct](CODE_OF_CONDUCT.md): Contributor Covenant v2.1.
- [Contributing Guide](CONTRIBUTING.md): Detailed development workflow, code styles, and statutory rules.
- [Security Policy](SECURITY.md): Responsible disclosure process and threat model.
- [Issue Templates](.github/ISSUE_TEMPLATE/): Structured forms for bugs, feature requests, and statutory rule updates.
- [Pull Request Template](.github/pull_request_template.md): Architectural, security, and testing verification checklists.

---

## Contributing

We welcome contributions from consumer advocates, software engineers, and legal compliance researchers. Please review our [Contributing Guide](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before submitting pull requests.

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.  
Copyright © 2026 Bored Polymath Studios.
