# SettleMint Release Notes

## SettleMint v0.1.3 — Architecture Hardening, UI Modularization, IPC Resilience & Automated Test Suite

**Release Date:** October 16, 2026  
**Publisher:** Bored Polymath Studios  
**Classification:** Consumer Advocacy & Credit Shield Desktop Console  
**License:** MIT License  
**Platforms Supported:** macOS (Apple Silicon / Intel Universal), Windows 10/11 (x86_64 / ARM64), Linux (Ubuntu 22.04+ / WebKitGTK 4.1)

---

### 🚀 What's New in v0.1.3

#### 1. Frontend Modular Decomposition & Code Quality Remediation
- **Modular View & Controller Separation:** Decomposed the monolithic UI into dedicated lifecycle controllers (`DisclaimerController`, `LetterController`, `ModalController`, `PatchController`) and focused view renderers (`dashboard-view`, `call-view`, `letter-view`, `vault-view`, `credit-view`).
- **Zero VibeDoctor Warnings:** 100% remediation of all diagnostic warnings, unused variable declarations, unhandled promise rejections, and DOM manipulation anti-patterns.
- **Robust XSS & DOM Sanitization:** Enforced strict context-aware HTML escaping across all template preview renderers and dynamic docket tables.
- **Showcase Tab & Edge Worker Refactoring:** Streamlined interactive feature walkthroughs and simplified Cloudflare Edge security worker parameters.

#### 2. Native IPC Bridge Hardening & Resilient Fallbacks
- **Comprehensive IPC Error Boundaries:** Enhanced `invoke`, `emit`, `listen`, and desktop notification wrappers with structured error containment and recovery.
- **Zero-Crash Web Sandbox Degradation:** Seamless, non-throwing fallback behavior when executing in web browsers or headless mock environments.
- **Event-Driven Reactive State:** Synchronized case state transitions and evidence ingestion with real-time UI updates.

#### 3. Enterprise-Grade Automated Testing Pipeline
- **Automated Frontend Test Suite:** 57 automated unit and integration tests executing via native test runners covering controllers, view renderers, mock dossiers, and accessibility compliance.
- **Rust Statutory Engine Validation:** 74 comprehensive Rust unit, integration, stress, chaos, and performance benchmark tests passing with 100% green status.
- **Chaos & Stress Tolerance:** Validated SQLite WAL recovery, 100MB+ multi-page PDF ingestion, and high-frequency concurrent interaction write loads.

#### 4. Web Security, Edge Protection & Crawler Governance
- **Edge Security Headers Worker:** Added deployable edge worker (`scripts/security-headers-worker.js`) enforcing strict Content Security Policy (CSP), Cross-Origin-Resource-Policy (`same-origin`), and HTTP Strict Transport Security (HSTS).
- **SEO & Structured Metadata:** Codified Schema.org `SoftwareApplication` JSON-LD structured data for discovery.
- **AI & Agentic Compliance:** Published comprehensive `llms.txt` and `llms-full.txt` standards detailing statutory capabilities and offline boundaries for AI assistants.

#### 5. Accessibility (WCAG 2.1 AA) & Visual Polish
- **Color Contrast & Readability:** Enforced minimum 4.5:1 text-to-background contrast across all statutory cards, badges, and code blocks.
- **Keyboard Navigation & Trapping:** Full keyboard navigation support with active modal focus traps and Escape key dismissal.
- **Cumulative Layout Shift (CLS) Elimination:** Optimized layout tokens and responsive imagery for instantaneous loading.

---

## SettleMint v0.1.2 — Production Release with Cryptographic Code Signing & Apple Notarization

**Release Date:** October 15, 2026  
**Publisher:** Bored Polymath Studios  
**Classification:** Consumer Advocacy & Credit Shield Desktop Console  
**License:** MIT License  
**Platforms Supported:** macOS (Apple Silicon / Intel Universal), Windows 10/11 (x86_64 / ARM64), Linux (Ubuntu 22.04+ / WebKitGTK 4.1)

---

### 🚀 What's New in v0.1.2

#### 1. Native Apple Code Signing & Apple Notarization
- **Hardened Runtime Enforcement:** Enabled `hardenedRuntime: true` in the macOS bundle specification, meeting Apple's mandatory Gatekeeper requirements.
- **Cryptographic Developer ID Application Signing:** Automated codesigning through GitHub Actions CI/CD using valid Developer ID Application certificates.
- **Automated Apple Notary API Submission:** Direct submission and ticket stapling via Apple `notarytool` to permanently eliminate *"damaged application"* and *"unverified developer"* Gatekeeper security dialogs.

#### 2. Official Website & Interactive Legal Web Suite
- **GitHub Pages Launch:** Live web application hosted at [boredpolymath.github.io/settlemint](https://boredpolymath.github.io/settlemint/).
- **Interactive 50-State SOL Simulator:** Real-time web calculator computing limitation years, anti-revival statutes, and citations for all 50 states.
- **Responsive Top Navigation:** Cleaned and polished navigation bar with responsive layout, zero wrapping, and unified brand presence.

#### 3. Air-Gapped Dynamic Statutory Rules Patch Engine (Phase 13)
- **Ed25519 Cryptographic Patch Verification:** Support for importing offline JSON statutory updates signed with Ed25519 keys.
- **Statutory Overrides & Instant Rollback:** Local override table for dynamic state SOL and licensing thresholds without modifying baseline compiled databases.

---

### 🛡️ Core Statutory Engines (Full Stack)

1. **54-Jurisdiction Statute of Limitations (SOL) Matrix:**
   - Complete statutory lookups across all 54 US jurisdictions for Credit Card, Medical, Written Contract, and Open Account debts.
   - Anti-revival statutory enforcement preventing accidental clock resets.
2. **CFPB Regulation F & FDCPA Telephone Harassment Engine:**
   - Real-time 7-in-7 call frequency monitoring and inconvenient hours audit (9 PM – 8 AM).
   - $1,000 statutory damages tracker and evidence ledger.
3. **Medical Debt & No Surprises Act Auditor:**
   - 42 U.S.C. § 300gg-111 balance billing protection and mandatory itemized CPT/ICD coding dispute generator.
4. **UCC Article 9 Automobile Deficiency Defense:**
   - 10-day pre-sale notice audit, 14-day post-sale accounting calculator, and uncredited GAP rebate recovery.
5. **The 7 Automated Court-Grade Dispute Generators:**
   - Complete dispute letter generation pipeline with live PDF and Markdown export.

---

### 🔒 Privacy & Cryptographic Security Guarantees

- **100% Offline & Air-Gapped:** Zero network sockets, zero telemetry, zero analytics.
- **Argon2id + ChaCha20-Poly1305:** Authenticated encryption for all local SQLite storage and backup archives.
- **NIST SHA-256 Vault:** Cryptographic hashing for evidence file integrity and tamper detection.

### 📦 Verified Release Packages & Checksums

| Artifact Name | Target Platform / Architecture | Format | Size | SHA-256 Checksum |
|---|---|---|---|---|
| `SettleMint_0.1.2_aarch64.dmg` | macOS Apple Silicon (M1/M2/M3/M4) | Signed & Notarized DMG | 6.45 MiB | `ef7e261f6e8096d75d0a38306be0fa2f1ee9b382d778b78c297519444365d349` |
| `SettleMint_0.1.2_amd64.AppImage` | Linux x86_64 (glibc 2.31+) | Standalone AppImage | 78.68 MiB | `008e92ec436e2c62230dff57bbb701cbb7ce803bf5b6b96e5c160c0670a6c461` |
| `SettleMint_0.1.2_amd64.deb` | Linux Debian / Ubuntu | Debian Package | 3.68 MiB | `e7e8de0a771b1db126921a9d7119b4268d8b7ebf83f58563f8b61e5b395c945a` |
| `SettleMint_0.1.2_x64-setup.exe` | Windows 10/11 x86_64 | NSIS Installer | 2.75 MiB | `a587abe55da743d0461a95abbf1b1227847377f28c6afc2f754d70deecd1c38c` |
| `SettleMint_0.1.2_x64_en-US.msi` | Windows 10/11 x86_64 | MSI Enterprise Installer | 3.75 MiB | `de8e815334921dc83f5420b390149c061eb1a3a6eb070410f756fe30a7222827` |
| `SettleMint_aarch64.app.tar.gz` | macOS Apple Silicon | Signed App Bundle | 4.78 MiB | `bfd6e2dd46c7d68a32540307bbe070d6c0278ec18b1224f602e4bfc957024683` |

---

## SettleMint v0.1.0 — Initial Release Notes

**Release Date:** October 15, 2026  
**Publisher:** Bored Polymath Studios  

Initial production release codifying federal and state consumer protection statutes into an air-gapped desktop console.
