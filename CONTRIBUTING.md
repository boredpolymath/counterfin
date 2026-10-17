# Contributing to DebtShark

Thank you for your interest in contributing to **DebtShark**, an open-source, local-first consumer advocacy console engineered by **Bored Polymath Studios**.

DebtShark operates in a high-consequence environment involving medical debt disputes, Protected Health Information (PHI), and federal civil statutes (FDCPA, FCRA). As such, our engineering, security, and statutory standards are rigorous.

---

## 1. Ground Rules & Non-Negotiables

### 1.1 Zero-Telemetry Mandate
DebtShark enforces complete network silence during standard operation.
- **NEVER** introduce analytics SDKs, crash-reporting webhooks, remote pingbacks, or third-party tracking pixels.
- Outbound network requests are restricted strictly to USPS Certified Mail tracking queries and authenticated credit bureau APIs with explicit user initiation.
- Any pull request violating this policy will be rejected immediately.

### 1.2 Medical Privacy & Data Isolation
- Protected Health Information (PHI), medical billing codes (CPT/ICD-10), and personal financial records must **never** leave the host machine.
- All persistence must route through the encrypted local SQLite layer with zeroization of sensitive variables in memory.

### 1.3 Legal & Statutory Integrity
- Code implementing or altering statutory rules (e.g., FDCPA § 1692, FCRA § 1681, or state Statute of Limitations tables) must cite official statutory references and be accompanied by unit tests covering statutory edge cases.
- Generated letter templates must maintain mandatory procedural self-advocacy disclaimers stating that the software does not provide formal legal representation.

---

## 2. Development Setup

### 2.1 Prerequisites
1. **Rust Toolchain:** Stable Rust compiler (`rustc >= 1.90.0`, `cargo`).
2. **Tauri CLI v2:** Installed via `cargo install tauri-cli --version "^2.0"`.
3. **Platform Dependencies:**
   - **macOS:** Xcode Command Line Tools (`xcode-select --install`).
   - **Windows:** Microsoft C++ Build Tools & Microsoft WebView2 runtime.
   - **Linux:** WebKitGTK 4.1 (`libwebkit2gtk-4.1-dev`), `build-essential`, `libssl-dev`, `libgtk-3-dev`.

### 2.2 Running Locally
1. Clone the repository:
   ```bash
   git clone https://github.com/boredpolymath/debtshark.git
   cd debtshark
   ```
2. Verify the Rust compilation:
   ```bash
   cd src-tauri
   cargo check
   ```
3. Launch the development workspace:
   ```bash
   cargo tauri dev
   ```

---

## 3. Code Standards & Style Guidelines

### 3.1 Rust Backend
- Run `cargo fmt --all` prior to committing.
- Run `cargo clippy --all-targets -- -D warnings` to verify zero compiler warnings.
- Avoid `.unwrap()` or `.expect()` in non-test production code. Propagate errors gracefully using structured `Result<T, AppError>` types.
- Ensure sensitive strings (passwords, SSNs, account numbers) are wrapped in zeroizing structures (`zeroize::ZeroizeOnDrop`).

### 3.2 Frontend & Design System
- DebtShark uses Vanilla HTML5, CSS, and modular ES JavaScript. Do not introduce large UI component libraries (e.g., React, Tailwind) unless agreed upon via an approved architectural RFC.
- Adhere strictly to the **Clinical Forensic Defense** design tokens defined in [`ui/css/tokens.css`](file:///Volumes/External/boredpolymath/projects/debtshark/ui/css/tokens.css):
  - **Zero-radius geometry:** `border-radius: 0px` across all containers, inputs, chips, and modals.
  - **Typography:** `Public Sans` for briefs, captions, and body; `JetBrains Mono` for Bates numbering, countdowns, timestamps, and hashes.
  - **Color restraint:** Saturated emergency crimson (`#DC2626`) is strictly reserved for statutory limits, acute liabilities, and FDCPA violation flags.

---

## 4. Pull Request Workflow

1. **Create a Topic Branch:**
   ```bash
   git checkout -b feat/statutory-sol-update
   ```
2. **Commit Conventions:** Follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` New features or UI components
   - `fix:` Bug fixes or calculation corrections
   - `statute:` Updates to legal rule tables or citations
   - `docs:` Documentation or checklist updates
   - `sec:` Security enhancements or cryptographic upgrades
3. **Run Test Suites:**
   ```bash
   cargo test --all
   ```
4. **Submit PR:** Use our [Pull Request Template](.github/pull_request_template.md) and verify that all security, compliance, and test checkboxes are satisfied.

---

## 5. Reporting Issues

- **Bug Reports:** Use the [Bug Report Template](.github/ISSUE_TEMPLATE/bug_report.yml).
- **Statutory Updates:** If an FDCPA rule, CFPB Regulation F guidance, or state debt Statute of Limitations has changed, submit a report via the [Statutory Update Template](.github/ISSUE_TEMPLATE/statutory_update.yml).
- **Security Vulnerabilities:** Follow the instructions in [SECURITY.md](SECURITY.md). Do **not** file public issues for potential security vulnerabilities.
