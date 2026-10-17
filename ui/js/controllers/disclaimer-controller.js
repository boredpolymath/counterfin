/**
 * SettleMint Legal Disclaimer Controller
 * Manages mandatory procedural self-advocacy gating and compliance acknowledgments
 */

import { ipc } from '../ipc.js';

export class DisclaimerController {
  constructor(app) {
    this.app = app;
    this.DISCLAIMER_STORAGE_SLOT = "debtshark_legal_disclaimer_agreed_v1";
    this.hasAgreedDisclaimer = false;

    this.initElements();
    this.bindEvents();
    this.initLegalDisclaimer();
  }

  initElements() {
    this.legalDisclaimerModal = document.getElementById("legalDisclaimerModal");
    this.closeLegalDisclaimerModal = document.getElementById("closeLegalDisclaimerModal");
    this.disclaimerSplashTag = document.getElementById("disclaimerSplashTag");
    this.legalDisclaimerTitle = document.getElementById("legalDisclaimerTitle");
    this.legalDisclaimerSubtitle = document.getElementById("legalDisclaimerSubtitle");
    this.disclaimerConsentSection = document.getElementById("disclaimerConsentSection");
    this.disclaimerConsentCheckbox = document.getElementById("disclaimerConsentCheckbox");
    this.disclaimerValidationMsg = document.getElementById("disclaimerValidationMsg");
    this.disclaimerAgreedCard = document.getElementById("disclaimerAgreedCard");
    this.disclaimerAgreedMeta = document.getElementById("disclaimerAgreedMeta");
    this.resetDisclaimerBtn = document.getElementById("resetDisclaimerBtn");
    this.agreeDisclaimerBtn = document.getElementById("agreeDisclaimerBtn");
    this.declineDisclaimerBtn = document.getElementById("declineDisclaimerBtn");
    this.closeDisclaimerReviewBtn = document.getElementById("closeDisclaimerReviewBtn");
    this.footerDisclaimerBtn = document.getElementById("footerDisclaimerBtn");
    this.disclaimerDeclinedModal = document.getElementById("disclaimerDeclinedModal");
    this.returnToDisclaimerBtn = document.getElementById("returnToDisclaimerBtn");
  }

  bindEvents() {
    if (this.disclaimerConsentCheckbox) {
      this.disclaimerConsentCheckbox.addEventListener("change", () => this.handleDisclaimerConsentToggle());
    }
    if (this.agreeDisclaimerBtn) {
      this.agreeDisclaimerBtn.addEventListener("click", () => this.handleDisclaimerAgreementSubmit());
    }
    if (this.declineDisclaimerBtn) {
      this.declineDisclaimerBtn.addEventListener("click", () => {
        if (this.legalDisclaimerModal) this.legalDisclaimerModal.close();
        if (this.disclaimerDeclinedModal) this.disclaimerDeclinedModal.showModal();
      });
    }
    if (this.returnToDisclaimerBtn) {
      this.returnToDisclaimerBtn.addEventListener("click", () => {
        if (this.disclaimerDeclinedModal) this.disclaimerDeclinedModal.close();
        this.openLegalDisclaimer(true);
      });
    }
    if (this.resetDisclaimerBtn) {
      this.resetDisclaimerBtn.addEventListener("click", () => {
        try {
          localStorage.removeItem(this.DISCLAIMER_STORAGE_SLOT);
          localStorage.removeItem("counterfin_legal_disclaimer_agreed_v1");
          localStorage.removeItem("settlemint_legal_disclaimer_agreed_v1");
        } catch (_e) {
          // LocalStorage fallback handled gracefully
        }
        this.hasAgreedDisclaimer = false;
        this.openLegalDisclaimer(true);
      });
    }
    if (this.closeLegalDisclaimerModal) {
      this.closeLegalDisclaimerModal.addEventListener("click", () => {
        if (this.hasAgreedDisclaimer && this.legalDisclaimerModal) {
          this.legalDisclaimerModal.close();
        }
      });
    }
    if (this.closeDisclaimerReviewBtn) {
      this.closeDisclaimerReviewBtn.addEventListener("click", () => {
        if (this.hasAgreedDisclaimer && this.legalDisclaimerModal) {
          this.legalDisclaimerModal.close();
        }
      });
    }
    if (this.legalDisclaimerModal) {
      this.legalDisclaimerModal.addEventListener("cancel", (e) => {
        if (!this.hasAgreedDisclaimer) {
          e.preventDefault();
        }
      });
      this.legalDisclaimerModal.addEventListener("click", (e) => {
        if (!this.hasAgreedDisclaimer) return;
        const rect = this.legalDisclaimerModal.getBoundingClientRect();
        const isInDialog = (
          rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
          rect.left <= e.clientX && e.clientX <= rect.left + rect.width
        );
        if (!isInDialog) {
          this.closeDialog(this.legalDisclaimerModal);
        }
      });
    }
    if (this.disclaimerDeclinedModal) {
      this.disclaimerDeclinedModal.addEventListener("click", (e) => {
        const rect = this.disclaimerDeclinedModal.getBoundingClientRect();
        const isInDialog = (
          rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
          rect.left <= e.clientX && e.clientX <= rect.left + rect.width
        );
        if (!isInDialog) {
          this.closeDialog(this.disclaimerDeclinedModal);
        }
      });
    }
    if (this.footerDisclaimerBtn) {
      this.footerDisclaimerBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.openLegalDisclaimer(false);
      });
    }
  }

  showDialog(dialog) {
    if (!dialog) return;
    if (!dialog.open) {
      try {
        dialog.showModal();
      } catch (err) {
        console.warn("showModal failed for dialog:", dialog.id, err);
      }
    }
  }

  closeDialog(dialog) {
    if (!dialog) return;
    if (dialog.open) {
      try {
        dialog.close();
      } catch (err) {
        console.warn("close failed for dialog:", dialog.id, err);
      }
    }
  }

  getStoredDisclaimerAgreement() {
    try {
      const raw = localStorage.getItem(this.DISCLAIMER_STORAGE_SLOT)
        || localStorage.getItem("counterfin_legal_disclaimer_agreed_v1")
        || localStorage.getItem("settlemint_legal_disclaimer_agreed_v1");
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (_e) {
      return null;
    }
  }

  initLegalDisclaimer() {
    const searchStr = (typeof window !== "undefined" && window.location?.search) || "";
    const urlParams = new URLSearchParams(searchStr);
    const forceSplash = urlParams.get("splash") === "1" || urlParams.get("reset_terms") === "1";

    if (forceSplash) {
      try {
        localStorage.removeItem(this.DISCLAIMER_STORAGE_SLOT);
      } catch (_e) {
        // Fallback handled gracefully
      }
      this.hasAgreedDisclaimer = false;
      this.openLegalDisclaimer(true);
      return;
    }

    const record = this.getStoredDisclaimerAgreement();
    if (record && record.agreed) {
      this.hasAgreedDisclaimer = true;
    } else {
      this.hasAgreedDisclaimer = false;
      this.openLegalDisclaimer(true);
    }
  }

  setupSplashScreenMode() {
    this.legalDisclaimerModal.classList.add("is-splash-screen");
    if (this.disclaimerSplashTag) this.disclaimerSplashTag.style.display = "inline-flex";
    if (this.legalDisclaimerTitle) this.legalDisclaimerTitle.textContent = "Legal & Statutory Disclaimer";
    if (this.legalDisclaimerSubtitle) this.legalDisclaimerSubtitle.textContent = "Procedural Self-Advocacy Instrument — Mandatory Agreement Required";
    if (this.closeLegalDisclaimerModal) this.closeLegalDisclaimerModal.style.display = "none";
    if (this.disclaimerConsentSection) {
      this.disclaimerConsentSection.style.display = "block";
      this.disclaimerConsentSection.classList.remove("shake-error", "is-agreed");
    }
    if (this.disclaimerConsentCheckbox) this.disclaimerConsentCheckbox.checked = false;
    if (this.disclaimerValidationMsg) this.disclaimerValidationMsg.style.display = "none";
    if (this.disclaimerAgreedCard) this.disclaimerAgreedCard.style.display = "none";
    if (this.declineDisclaimerBtn) this.declineDisclaimerBtn.style.display = "inline-flex";
    if (this.closeDisclaimerReviewBtn) this.closeDisclaimerReviewBtn.style.display = "none";
    if (this.agreeDisclaimerBtn) {
      this.agreeDisclaimerBtn.style.display = "inline-flex";
      this.agreeDisclaimerBtn.replaceChildren();
      const txt = document.createElement("span");
      txt.textContent = "I Agree & Enter Application ";
      const arrow = document.createElement("span");
      arrow.textContent = "→";
      arrow.style.fontSize = "15px";
      this.agreeDisclaimerBtn.append(txt, arrow);
    }
  }

  setupReviewMode() {
    this.legalDisclaimerModal.classList.remove("is-splash-screen");
    if (this.disclaimerSplashTag) this.disclaimerSplashTag.style.display = "none";
    if (this.legalDisclaimerTitle) this.legalDisclaimerTitle.textContent = "Mandatory Legal & Statutory Compliance Terms";
    if (this.legalDisclaimerSubtitle) this.legalDisclaimerSubtitle.textContent = "Procedural Self-Advocacy Instrument — Not Attorney Representation";
    if (this.closeLegalDisclaimerModal) this.closeLegalDisclaimerModal.style.display = "flex";
    if (this.disclaimerConsentSection) this.disclaimerConsentSection.style.display = "none";
    if (this.disclaimerAgreedCard) {
      this.disclaimerAgreedCard.style.display = "flex";
      const record = this.getStoredDisclaimerAgreement();
      const dateStr = record?.agreedAt ? new Date(record.agreedAt).toLocaleString() : "Active Session";
      if (this.disclaimerAgreedMeta) {
        this.disclaimerAgreedMeta.textContent = `User agreed on ${dateStr} (v${record?.version || "1.0"})`;
      }
    }
    if (this.declineDisclaimerBtn) this.declineDisclaimerBtn.style.display = "none";
    if (this.agreeDisclaimerBtn) this.agreeDisclaimerBtn.style.display = "none";
    if (this.closeDisclaimerReviewBtn) this.closeDisclaimerReviewBtn.style.display = "inline-flex";
  }

  openLegalDisclaimer(isSplash = false) {
    if (!this.legalDisclaimerModal) return;
    if (isSplash) {
      this.setupSplashScreenMode();
    } else {
      this.setupReviewMode();
    }
    this.showDialog(this.legalDisclaimerModal);
  }

  handleDisclaimerConsentToggle() {
    if (!this.disclaimerConsentCheckbox || !this.disclaimerConsentSection) return;
    const checked = this.disclaimerConsentCheckbox.checked;
    this.disclaimerConsentSection.classList.toggle("is-agreed", checked);
    if (checked && this.disclaimerValidationMsg) {
      this.disclaimerValidationMsg.style.display = "none";
      this.disclaimerConsentSection.classList.remove("shake-error");
    }
  }

  handleDisclaimerAgreementSubmit() {
    if (!this.disclaimerConsentCheckbox?.checked) {
      if (this.disclaimerConsentSection) {
        this.disclaimerConsentSection.classList.remove("shake-error");
        void this.disclaimerConsentSection.offsetWidth;
        this.disclaimerConsentSection.classList.add("shake-error");
      }
      if (this.disclaimerValidationMsg) {
        this.disclaimerValidationMsg.style.display = "block";
      }
      return;
    }

    const record = { agreed: true, agreedAt: new Date().toISOString(), version: "1.0" };
    try {
      localStorage.setItem(this.DISCLAIMER_STORAGE_SLOT, JSON.stringify(record));
    } catch (_e) {
      // LocalStorage access handled gracefully
    }
    this.hasAgreedDisclaimer = true;

    if (this.agreeDisclaimerBtn) {
      this.agreeDisclaimerBtn.textContent = "Agreed ✓ Unlocking Console...";
    }

    setTimeout(() => {
      this.closeDialog(this.legalDisclaimerModal);
      ipc.sendNotification(
        "DebtShark Console Ready",
        "Statutory compliance agreement acknowledged. All self-advocacy modules unlocked."
      );
    }, 250);
  }
}
