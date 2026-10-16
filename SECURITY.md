# Security Policy: CounterFin

Bored Polymath Studios takes the security and privacy of CounterFin users with the utmost seriousness. Because the application processes sensitive Protected Health Information (PHI), financial account numbers, and debt collection disputes, our security posture is engineered for maximum defense-in-depth.

---

## 1. Supported Versions

Security patches and regulatory updates are actively provided for the following versions:

| Version | Supported | Maintenance Status |
|---|---|---|
| `0.1.x` | :white_check_mark: | Active Development |
| `< 0.1.0` | :x: | Unsupported Pre-Release |

---

## 2. Core Security Guarantees & Threat Model

CounterFin is built on the following foundational security architectural principles:

1. **Zero-Telemetry Default:** Complete network silence. CounterFin contains zero analytics beacons, telemetry hooks, or crash-reporting webhooks.
2. **Local-First At-Rest Cryptography:** All database files (`CounterFin.db`) are encrypted at rest using AES-256 in CBC mode (via SQLCipher) or equivalent modern authenticated cryptography. Keys are derived using Argon2id with memory-hard parameters.
3. **RAM Protection & Zeroization:** Sensitive strings (master passphrases, Social Security Numbers, banking account numbers) are actively zeroized in memory upon drop using the Rust `zeroize` crate.
4. **Strict Web Runtime Isolation:** The Tauri webview operates under an uncompromising Content Security Policy (CSP):
   ```
   default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:;
   ```
   Inline script execution, external script loading, and unauthenticated network requests are strictly forbidden.
5. **Cryptographic Chain of Custody:** All ingested evidence documents are stored under anonymized UUID identifiers and hashed via SHA-256 to ensure evidentiary integrity.

---

## 3. Reporting a Vulnerability

If you discover a security vulnerability, cryptographic weakness, or unauthorized network egress in CounterFin, **do not open a public GitHub issue or discussion**.

Please report all vulnerabilities privately through GitHub's **Private Vulnerability Reporting**:

1. Navigate to the **[Security Advisories](https://github.com/boredpolymath/counterfin/security/advisories)** tab of this repository.
2. Click **"Report a vulnerability"** (or use the direct link: [New Security Advisory](https://github.com/boredpolymath/counterfin/security/advisories/new)).
3. Fill out the advisory form with the vulnerability details outlined below.

- **Response Timeline:** We acknowledge receipt within **48 hours** via the advisory thread and provide an initial severity assessment within **5 business days**.


### Please include in your report:
1. Detailed description of the vulnerability, affected components, and potential impact.
2. Reproducible proof-of-concept (PoC) steps or script.
3. Host environment details (Operating system, Tauri/Rust version).
4. Proposed mitigation or patch (if available).

---

## 4. Coordinated Disclosure & Bounty Policy

We follow a coordinated disclosure process:
- We will work directly with you to reproduce and resolve the issue.
- We request that you maintain confidentiality until an official patch has been published and release notes have been made available.
- Contributors reporting verifiable security vulnerabilities will be recognized in our Security Hall of Fame (with their consent).
