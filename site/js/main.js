/**
 * SettleMint Landing Page Client Script
 * Handles OS detection, interactive showcase gallery,
 * 50-State SOL statutory calculator, copy-to-clipboard, and lightbox.
 */

document.addEventListener('DOMContentLoaded', () => {
  initOsDetection();
  initShowcaseTabs();
  initSolSimulator();
  initCopyButtons();
  initLightbox();
  initMobileMenu();
});

/* ==========================================================================
   1. OS Detection & Dynamic Hero Button
   ========================================================================== */
function initOsDetection() {
  const heroBtn = document.getElementById('heroDownloadBtn');
  const heroBtnText = document.getElementById('heroBtnText');
  const heroBtnSub = document.getElementById('heroBtnSub');
  const heroBtnIcon = document.getElementById('heroBtnIcon');

  if (!heroBtn) return;

  const userAgent = window.navigator.userAgent.toLowerCase();
  const platform = (window.navigator.platform || '').toLowerCase();

  const releaseBase = 'https://github.com/boredpolymath/settlemint/releases/download/v0.1.2';

  if (platform.includes('mac') || userAgent.includes('macintosh') || userAgent.includes('mac os')) {
    // macOS
    heroBtn.href = `${releaseBase}/SettleMint_0.1.2_aarch64.dmg`;
    if (heroBtnText) heroBtnText.textContent = 'Download for macOS (Apple Silicon)';
    if (heroBtnSub) heroBtnSub.textContent = 'v0.1.2 • .dmg (6.4 MB) • macOS 11+';
    if (heroBtnIcon) heroBtnIcon.innerHTML = `<path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 1.01-2.87-.96.04-2.15.65-2.82 1.43-.59.68-1.11 1.76-.97 2.8 1.07.08 2.19-.61 2.78-1.36z" fill="currentColor"/>`;
  } else if (platform.includes('win') || userAgent.includes('windows')) {
    // Windows
    heroBtn.href = `${releaseBase}/SettleMint_0.1.2_x64-setup.exe`;
    if (heroBtnText) heroBtnText.textContent = 'Download for Windows';
    if (heroBtnSub) heroBtnSub.textContent = 'v0.1.2 • .exe (2.3 MB) • Windows 10/11';
    if (heroBtnIcon) heroBtnIcon.innerHTML = `<path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.951-1.799" fill="currentColor"/>`;
  } else if (platform.includes('linux') || userAgent.includes('linux')) {
    // Linux
    heroBtn.href = `${releaseBase}/SettleMint_0.1.2_amd64.AppImage`;
    if (heroBtnText) heroBtnText.textContent = 'Download for Linux (AppImage)';
    if (heroBtnSub) heroBtnSub.textContent = 'v0.1.2 • .AppImage (78 MB) • x86_64';
    if (heroBtnIcon) heroBtnIcon.innerHTML = `<path d="M12 2a10 10 0 0 0-10 10 10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2zm1 14.5v-5l4.5 2.5-4.5 2.5zm-2-2.5L6.5 11.5 11 9v5z" fill="currentColor"/>`;
  }
}

/* ==========================================================================
   2. Interactive Showcase Gallery Tabs
   ========================================================================== */
function initShowcaseTabs() {
  const tabs = document.querySelectorAll('.showcase-tab');
  const screenImg = document.getElementById('showcaseImage');
  const captionEl = document.getElementById('showcaseCaptionText');

  const tabData = {
    dashboard: {
      src: 'assets/images/dashboard.png',
      caption: '<strong>Live Statutory Dashboard:</strong> Real-time tracking of 30-day FDCPA dispute windows, 7-in-7 call violations, and accrued statutory damages.'
    },
    letters: {
      src: 'assets/images/letters.png',
      caption: '<strong>7 Automated Legal Dispute Generators:</strong> Context-aware statutory demand letter generation with live PDF & Markdown export.'
    },
    interactions: {
      src: 'assets/images/interactions.png',
      caption: '<strong>Interaction & Violation Log:</strong> Precise tracking of phone calls, voicemails, and written notices under 12 CFR § 1006 Regulation F.'
    },
    evidence: {
      src: 'assets/images/evidence.png',
      caption: '<strong>NIST SHA-256 Evidence Vault:</strong> Cryptographic file integrity hashing with automated tamper detection and chain of custody.'
    },
    credit: {
      src: 'assets/images/credit.png',
      caption: '<strong>Credit Bureau Audit (FCRA § 623):</strong> Direct CRA trade-line dispute engine for Experian, Equifax, and TransUnion records.'
    },
    callScript: {
      src: 'assets/images/callScriptModal.png',
      caption: '<strong>Real-Time Defense Scripts:</strong> Step-by-step interactive script cards during incoming phone calls to record violations and stop harassment.'
    }
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const key = tab.getAttribute('data-tab');
      if (tabData[key] && screenImg) {
        screenImg.style.opacity = '0.3';
        setTimeout(() => {
          screenImg.src = tabData[key].src;
          if (captionEl) captionEl.innerHTML = tabData[key].caption;
          screenImg.style.opacity = '1';
        }, 120);
      }
    });
  });
}

/* ==========================================================================
   3. 50-State Statutory Limitations (SOL) Simulator
   ========================================================================== */
const STATE_SOL_DATABASE = {
  CA: {
    name: 'California',
    written: 4,
    open: 4,
    oral: 2,
    medical: 3,
    antiRevival: true,
    code: 'Cal. Civ. Proc. Code § 337 / § 360.5',
    tip: 'California enacted explicit anti-revival protections. Partial payment does NOT revive time-barred consumer debt unless accompanied by a signed written agreement.'
  },
  NY: {
    name: 'New York',
    written: 3,
    open: 3,
    oral: 3,
    medical: 3,
    antiRevival: true,
    code: 'N.Y. C.P.L.R. § 214-i (Consumer Credit Act)',
    tip: 'Under NY CPLR 214-i, the SOL was reduced to 3 years. Any payment or affirmation after expiration does NOT revive the limitation period!'
  },
  TX: {
    name: 'Texas',
    written: 4,
    open: 4,
    oral: 4,
    medical: 4,
    antiRevival: false,
    code: 'Tex. Civ. Prac. & Rem. Code § 16.004 / Fin. Code § 392',
    tip: 'Texas Fin. Code § 392 requires third-party debt collectors to maintain a mandatory $10,000 surety bond filed with the Texas Secretary of State.'
  },
  FL: {
    name: 'Florida',
    written: 5,
    open: 4,
    oral: 4,
    medical: 4,
    antiRevival: false,
    code: 'Fla. Stat. § 95.11(2)(b) & (3)(p) / FCCPA § 559.72',
    tip: 'Florida Consumer Collection Practices Act (FCCPA) provides strong statutory protections against asserting legal rights when collectors know debt is time-barred.'
  },
  IL: {
    name: 'Illinois',
    written: 10,
    open: 5,
    oral: 5,
    medical: 5,
    antiRevival: false,
    code: '735 ILCS 5/13-205 & 5/13-206',
    tip: 'Credit cards are generally classified as unwritten contracts/open accounts (5 years), distinct from 10-year promissory notes.'
  },
  PA: {
    name: 'Pennsylvania',
    written: 4,
    open: 4,
    oral: 4,
    medical: 4,
    antiRevival: false,
    code: '42 Pa. Cons. Stat. § 5525',
    tip: 'Uniform 4-year statute applies to contracts and open accounts. Partial payments may restart clock prior to SOL expiration.'
  },
  OH: {
    name: 'Ohio',
    written: 6,
    open: 6,
    oral: 4,
    medical: 6,
    antiRevival: false,
    code: 'Ohio Rev. Code § 2305.06 & § 2305.07',
    tip: 'Ohio shortened its contract SOL from 8 to 6 years in 2021. Always verify the original default date.'
  },
  GA: {
    name: 'Georgia',
    written: 6,
    open: 4,
    oral: 4,
    medical: 4,
    antiRevival: false,
    code: 'O.C.G.A. § 9-3-24 & § 9-3-25',
    tip: 'Open accounts carry a 4-year period while simple written contracts carry 6 years.'
  },
  NC: {
    name: 'North Carolina',
    written: 3,
    open: 3,
    oral: 3,
    medical: 3,
    antiRevival: true,
    code: 'N.C. Gen. Stat. § 1-52 / § 58-70-115',
    tip: 'North Carolina prohibits debt buyers from suing or threatening suit on time-barred debt under penalty of per se unfair trade practices.'
  },
  MI: {
    name: 'Michigan',
    written: 6,
    open: 6,
    oral: 6,
    medical: 6,
    antiRevival: false,
    code: 'Mich. Comp. Laws § 600.5807',
    tip: 'Six-year general limitations period applies. Collector communication must comply with Michigan Occupational Code Article 9.'
  },
  WA: {
    name: 'Washington',
    written: 6,
    open: 3,
    oral: 3,
    medical: 3,
    antiRevival: false,
    code: 'Wash. Rev. Code § 4.16.040 & § 4.16.080',
    tip: 'Open accounts have a 3-year limit. Washington Collection Agency Act requires clear disclosure of original creditor details.'
  },
  CO: {
    name: 'Colorado',
    written: 6,
    open: 3,
    oral: 3,
    medical: 3,
    antiRevival: true,
    code: 'Colo. Rev. Stat. § 13-80-101 / § 5-16-111',
    tip: 'Colorado Uniform Consumer Credit Code § 5-16-111 renders any lawsuit or collection threat on time-barred debt illegal.'
  },
  VA: {
    name: 'Virginia',
    written: 5,
    open: 3,
    oral: 3,
    medical: 3,
    antiRevival: false,
    code: 'Va. Code § 8.01-246',
    tip: 'Open accounts and oral contracts carry a strict 3-year SOL, while written contracts carry 5 years.'
  },
  NJ: {
    name: 'New Jersey',
    written: 6,
    open: 6,
    oral: 6,
    medical: 6,
    antiRevival: false,
    code: 'N.J. Stat. Ann. § 2A:14-1',
    tip: '6-year period for contract claims. Debt collection agencies must file a $5,000 surety bond with the NJ Department of Banking.'
  },
  MA: {
    name: 'Massachusetts',
    written: 6,
    open: 6,
    oral: 6,
    medical: 6,
    antiRevival: false,
    code: 'Mass. Gen. Laws ch. 260, § 2',
    tip: 'Massachusetts 940 CMR 7.00 limits collector contacts to no more than two per 7-day period (stricter than federal 7-in-7).'
  }
};

function initSolSimulator() {
  const stateSelect = document.getElementById('simStateSelect');
  const debtSelect = document.getElementById('simDebtSelect');

  if (!stateSelect || !debtSelect) return;

  function updateResult() {
    const stateCode = stateSelect.value;
    const debtType = debtSelect.value;

    const data = STATE_SOL_DATABASE[stateCode] || STATE_SOL_DATABASE['CA'];

    let years = data.open;
    if (debtType === 'written') years = data.written;
    else if (debtType === 'oral') years = data.oral;
    else if (debtType === 'medical') years = data.medical || data.open;

    const stateTitle = document.getElementById('resStateTitle');
    const badgeYears = document.getElementById('resBadgeYears');
    const statYears = document.getElementById('resStatYears');
    const statAntiRevival = document.getElementById('resStatAntiRevival');
    const statCode = document.getElementById('resStatCode');
    const statTip = document.getElementById('resStatTip');

    if (stateTitle) stateTitle.textContent = `${data.name} (${stateCode})`;
    if (badgeYears) badgeYears.textContent = `${years} Year Limit`;
    if (statYears) statYears.textContent = `${years} Years`;

    if (statAntiRevival) {
      if (data.antiRevival) {
        statAntiRevival.textContent = 'Protected (Cannot Revive)';
        statAntiRevival.className = 'stat-value protected';
      } else {
        statAntiRevival.textContent = 'Warning (Payment May Restart)';
        statAntiRevival.className = 'stat-value warning';
      }
    }

    if (statCode) statCode.textContent = data.code;
    if (statTip) statTip.textContent = data.tip;
  }

  stateSelect.addEventListener('change', updateResult);
  debtSelect.addEventListener('change', updateResult);
  updateResult();
}

/* ==========================================================================
   4. Copy-to-Clipboard Functionality
   ========================================================================== */
function initCopyButtons() {
  const copyBtns = document.querySelectorAll('.btn-copy-hash');

  copyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-copy-target');
      const targetEl = document.getElementById(targetId);

      if (targetEl) {
        const text = targetEl.textContent.trim();
        navigator.clipboard.writeText(text).then(() => {
          const originalText = btn.textContent;
          btn.textContent = 'Copied!';
          btn.style.color = '#34d399';
          setTimeout(() => {
            btn.textContent = originalText;
            btn.style.color = '';
          }, 2000);
        }).catch((err) => {
          console.warn('Clipboard copy failed:', err);
        });
      }
    });
  });
}

/* ==========================================================================
   5. Modal Lightbox
   ========================================================================== */
function initLightbox() {
  const lightbox = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImage');
  const closeBtn = document.getElementById('lightboxClose');
  const showcaseScreen = document.querySelector('.showcase-screen');

  if (!lightbox || !lightboxImg || !closeBtn || !showcaseScreen) return;

  showcaseScreen.addEventListener('click', () => {
    const currentImg = document.getElementById('showcaseImage');
    if (currentImg) {
      lightboxImg.src = currentImg.src;
      lightbox.classList.add('active');
    }
  });

  closeBtn.addEventListener('click', () => {
    lightbox.classList.remove('active');
  });

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      lightbox.classList.remove('active');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      lightbox.classList.remove('active');
    }
  });
}

/* ==========================================================================
   6. Mobile Navigation Menu Toggle
   ========================================================================== */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobileMenuToggle');
  const navLinks = document.getElementById('navLinks');

  if (!toggleBtn || !navLinks) return;

  toggleBtn.addEventListener('click', () => {
    navLinks.classList.toggle('mobile-open');
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('mobile-open');
    });
  });
}
