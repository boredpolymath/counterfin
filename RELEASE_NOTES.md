# SettleMint v0.1.0 Production Release Notes

**Release Date:** October 15, 2026  
**Publisher:** Bored Polymath Studios  
**Classification:** Consumer Advocacy & Credit Shield Desktop Console  
**License:** MIT License  
**Platforms Supported:** macOS (Apple Silicon / Intel Universal), Windows 10/11 (x86_64 / ARM64), Linux (Ubuntu 22.04+ / WebKitGTK 4.1)

---

## 🚀 Overview

SettleMint is a zero-telemetry, local-first consumer credit shield and debt dispute application. Version 0.1.0 marks the initial production release, codifying federal and state consumer protection statutes into an intuitive, air-gapped desktop console.

---

## 🛡️ Key Features & Statutory Engines

### 1. 54-Jurisdiction Statute of Limitations (SOL) Matrix
- Complete statutory lookups across all **54 US jurisdictions** (50 US States, District of Columbia, Puerto Rico, Guam, and US Virgin Islands) for Credit Card, Medical, Written Contract, and Open Account debts.
- Anti-revival statutory enforcement for jurisdictions where partial payment cannot reset expired debts (e.g., New York CPLR § 214-i, Texas CPRC § 16.004).

### 2. Debt Collector Licensing & Surety Bond Registry
- Codified regulatory agencies and mandatory bond thresholds (e.g., Texas $10,000 bond, California $25,000 bond, New Jersey $5,000 bond) to immediately catch unlicensed third-party collectors.

### 3. Evidentiary Brutalism Letter Studio
- 7 codified dispute letter templates covering Debt Validation (15 U.S.C. § 1692g), CFPB Regulation F (12 CFR § 1006.34), No Surprises Act balance billing audits, UCC Article 9 repossession deficiency disputes, and Pay-For-Delete settlements.
- Real-time side-by-side editing pane with live Bates-stamping, legal citation checklists, and one-click print/export.

### 4. Background System Tray Companion
- Ultra-efficient desktop daemon running at `< 25MB RSS`.
- Real-time deadline monitoring with sleep/wake clock drift compensation and instant quick-action dispute capture.

---

## 🔒 Security, Privacy & Zero-Telemetry Architecture

- **Argon2id Master Key Derivation:** Memory-hardened 256-bit key derivation (64MB memory, 3 iterations, 4 parallelism lanes).
- **ChaCha20-Poly1305 AEAD Encryption:** Authenticated encryption for at-rest storage and encrypted `.smbak` backup archives.
- **Cryptographic Memory Zeroization:** Sensitive consumer data (SSNs, account numbers, master keys) implements `Zeroize` and `ZeroizeOnDrop` to scrub memory buffers immediately upon deallocation.
- **Tamper-Evident Evidence Vault:** Automated SHA-256 integrity checksums, OS-level directory sandboxing, and strict MIME-type validation.
- **Crash-Resilient SQLite (WAL Mode):** Write-Ahead Logging with normal synchronization, resisting process crashes (SIGKILL) and power failure.
- **100% Air-Gapped Network Silence:** Zero HTTP requests, zero telemetry beacons, zero analytics pixels. CSP strictly enforces `default-src 'self'`.

---

## 📦 Production Package Verification (macOS Apple Silicon)

| Artifact Name | Format | Size | SHA-256 Checksum |
|---|---|---|---|
| `SettleMint_0.1.0_aarch64.dmg` | macOS Installer DMG | 3.36 MB | `01578d8c6a34fd14b4a3b8159dfca0c4395d62e24c26436d733b7a695b90e8f7` |
| `SettleMint.app` | macOS App Bundle | 6.51 MB | Built with LTO, `opt-level = 3`, and debug symbol stripping (`strip = true`) |
