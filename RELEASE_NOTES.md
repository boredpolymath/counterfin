# SettleMint Release Notes

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
