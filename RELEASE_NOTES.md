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

## 📦 Production Package Verification

| Artifact Name | Target Platform / Architecture | Format | Size | SHA-256 Checksum |
|---|---|---|---|---|
| `SettleMint_0.1.0_aarch64.dmg` | macOS Apple Silicon (M1/M2/M3/M4) | DMG Installer | 6.41 MiB | `e8a7730653fea61df35f62d87c47708ae550f6cf6e02f5d01a40ea0707d1a37d` |
| `SettleMint_0.1.0_amd64.AppImage` | Linux x86_64 (glibc 2.31+) | Standalone AppImage | 78.21 MiB | `5f82be65e28fc893f0af7bd9583bf83751b35f2be8fb18b02b227ea612ef9474` |
| `SettleMint_0.1.0_amd64.deb` | Linux Debian / Ubuntu | Debian Package | 3.20 MiB | `735ffd52fab9835911c134f77d55f5064151c044c3d1fd8ae040f2e9725be0a2` |
| `SettleMint_0.1.0_x64-setup.exe` | Windows 10/11 x86_64 | NSIS Installer | 2.31 MiB | `404b5e8a5599091f7c463abcb7954d1865971cccaeaca5a0d30e3bbb9a70f42c` |
| `SettleMint_0.1.0_x64_en-US.msi` | Windows 10/11 x86_64 | MSI Enterprise Installer | 3.22 MiB | `c3b0b9a993981bb37b3e5d6c852468977d0e2321cf7171d6d483d8ef92ce98b7` |

