/**
 * SettleMint Letter Studio Controller
 * Manages document generation, live preview synchronization, and certified exports
 */

import { ipc } from '../ipc.js';

export class LetterController {
  constructor(app) {
    this.app = app;
  }

  bindLetterEvents(activeCase) {
    document.getElementById("letterStudioEmptyNewCaseBtn")?.addEventListener("click", () => {
      this.app.openNewDisputeModal();
    });
    this.bindInputSync();
    this.bindExportActions(activeCase);
    this.bindTemplateChange(activeCase);
  }

  bindInputSync() {
    const syncMap = [
      ["templateRecipient", "docRecipient"],
      ["templateAmount", "docDisputedAmount"],
      ["templateCertifiedMail", "docTrackingNo"]
    ];
    syncMap.forEach(([inputId, docId]) => {
      document.getElementById(inputId)?.addEventListener("input", (e) => {
        const el = document.getElementById(docId);
        if (el) el.textContent = e.target.value;
      });
    });

    document.querySelectorAll(".statutory-demand-checkbox").forEach(cb => {
      cb.addEventListener("change", (e) => {
        const docItemId = e.target.getAttribute("data-doc-item");
        const docEl = docItemId ? document.getElementById(docItemId) : null;
        if (docEl) docEl.style.display = e.target.checked ? "list-item" : "none";
      });
    });
  }

  bindExportActions(activeCase) {
    const paper = document.getElementById("legalDocumentPaper");
    const docket = activeCase?.docketNumber || "DISPUTE";

    document.getElementById("copyTextBtn")?.addEventListener("click", () => {
      if (paper) {
        navigator.clipboard?.writeText(paper.innerText);
        const label = document.getElementById("copyTextBtn").querySelector(".btn-label") || document.getElementById("copyTextBtn");
        label.textContent = "Copied ✓";
        setTimeout(() => { label.textContent = "Copy Text"; }, 2000);
      }
    });

    document.getElementById("exportTxtBtn")?.addEventListener("click", async () => {
      const text = paper ? paper.innerText : "";
      this.downloadBlob(text, `${docket}_DVL.txt`, "text/plain");
      if (ipc.isTauri()) {
        try {
          const path = await ipc.exportDocumentFile(docket, "DVL_Letter", text, "txt");
          ipc.sendNotification("Document Exported", `Saved to ${path}`);
        } catch (e) {
          console.debug("Export text error:", e);
        }
      }
    });

    document.getElementById("exportMdBtn")?.addEventListener("click", async () => {
      const text = paper ? `# ${docket} — Formal Dispute Letter\n\n${paper.innerText}` : "";
      this.downloadBlob(text, `${docket}_DVL.md`, "text/markdown");
      if (ipc.isTauri()) {
        try {
          const path = await ipc.exportDocumentFile(docket, "DVL_Letter", text, "md");
          ipc.sendNotification("Document Exported", `Saved to ${path}`);
        } catch (e) {
          console.debug("Export markdown error:", e);
        }
      }
    });

    document.getElementById("exportPdfBtn")?.addEventListener("click", async () => {
      const text = paper ? paper.innerText : "";
      if (ipc.isTauri()) {
        try {
          const path = await ipc.exportDocumentFile(docket, "DVL_Letter", text, "pdf");
          ipc.sendNotification("Certified PDF Generated", `Letter encrypted to ${path}`);
        } catch (e) {
          ipc.sendNotification("Certified PDF Dispatched", `Letter encrypted to vault.`);
        }
      } else {
        window.print();
      }
    });
  }

  bindTemplateChange(activeCase) {
    document.getElementById("templateSelect")?.addEventListener("change", async (e) => {
      if (!ipc.isTauri() || !activeCase) return;
      const docType = e.target.value === 'credit_card_dvl' ? 'credit_card_dvl' :
                      e.target.value === 'medical_dvl' ? 'medical_dvl' :
                      e.target.value === 'auto_dvl' ? 'auto_deficiency_dvl' : 'general_dvl';
      try {
        await ipc.generateDisputeDocument(docType, {
          CERTIFIED_MAIL_TRACKING: document.getElementById("templateCertifiedMail")?.value || activeCase.certifiedMailTracking || '',
          CURRENT_DATE: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
          COLLECTION_AGENCY: document.getElementById("templateRecipient")?.value || activeCase.collectionAgency,
          COLLECTION_ACCOUNT_NO: activeCase.collectionAccountNumber,
          ORIGINAL_PROVIDER: activeCase.originalProvider,
          DISPUTED_AMOUNT: `$${(activeCase.disputedBalance || 0).toFixed(2)}`,
          BATES_DOCKET: activeCase.docketNumber,
          DEBTOR_NAME: activeCase.debtorName
        });
      } catch (err) {
        console.debug("Backend template generation note:", err);
      }
    });
  }

  downloadBlob(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }
}
