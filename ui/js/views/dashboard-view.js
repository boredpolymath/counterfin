/**
 * SettleMint Dashboard View: Orderly Consumer Advocacy Dashboard
 * Clean, structured, anxiety-reducing information hierarchy
 * Covers Credit Cards, Medical Debt, Auto Loan Deficiencies, and all FDCPA debts
 */

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function renderFirstRunWelcomeHero(userName) {
  return `
    <div style="background: linear-gradient(135deg, #006948 0%, #004d34 100%); border-radius: var(--radius-xl); padding: 36px 32px; color: #ffffff; box-shadow: var(--shadow-lg); margin-bottom: 28px; position: relative; overflow: hidden;">
      <div style="position: absolute; right: -20px; top: -20px; opacity: 0.08;">
        <svg width="220" height="220" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
      </div>
      <div style="position: relative; z-index: 1;">
        <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(8px); padding: 4px 12px; border-radius: 9999px; font-size: 11.5px; font-weight: 700; letter-spacing: 0.05em; margin-bottom: 14px;">
          <span>LOCAL SANCTUARY ACTIVE</span><span>•</span><span>FDCPA CONSUMER SHIELD</span>
        </div>
        <h1 style="font-size: 26px; font-weight: 800; line-height: 1.25; margin-bottom: 8px; color: #ffffff;">Welcome to SettleMint, ${escapeHtml(userName)}</h1>
        <p style="font-size: 14.5px; opacity: 0.92; line-height: 1.55; max-width: 650px; margin-bottom: 22px;">
          Your private, zero-knowledge console for asserting federal consumer protections against unlawful debt collectors. No accounts, no cloud tracking, and 100% encrypted locally on your machine.
        </p>
        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          <button type="button" class="btn btn-pill-primary" id="firstRunNewDisputeBtn" style="background: #ffffff; color: #006948; font-weight: 700; box-shadow: 0 4px 14px rgba(0,0,0,0.15);">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <span>Log Your First Notice</span>
          </button>
          <button type="button" class="btn btn-pill-outline" id="firstRunProfileBtn" style="color: #ffffff; border-color: rgba(255,255,255,0.4); background: rgba(255,255,255,0.08);">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <span>Setup Legal Profile</span>
          </button>
          <button type="button" class="btn btn-pill-outline" id="firstRunDemoBtn" style="color: #85f8c4; border-color: rgba(133,248,196,0.5); background: rgba(0,0,0,0.1);">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>
            <span>Explore Sample Dossiers</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderFirstRunPillars() {
  const pillars = [
    {
      bg: 'var(--color-primary-mint-wash)', color: 'var(--color-primary)',
      icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>',
      title: '1. Start 30-Day Dispute Clock',
      desc: 'Under 15 U.S.C. § 1692g, you have 30 days from receiving an initial collection notice to demand verification and pause all collection activity.'
    },
    {
      bg: '#eff6ff', color: '#2563eb',
      icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>',
      title: '2. Demand Chain of Title',
      desc: 'Generate formal CFPB Reg F & UCC Article 9 validation letters requiring debt buyers to prove they lawfully own your account.'
    },
    {
      bg: '#fff1f2', color: '#e11d48',
      icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m14 13-7.5 7.5a2.12 2.12 0 1 1-3-3L11 10"></path><path d="m16 16 6-6"></path><path d="m8 8 6-6"></path></svg>',
      title: '3. Catch Collector Violations',
      desc: 'Log phone calls, threats, and false credit reporting. Each violation is eligible for up to $1,000 in statutory damages under 15 U.S.C. § 1692k.'
    }
  ];

  return `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 18px; margin-bottom: 28px;">
      ${pillars.map(p => `
        <div style="background: #ffffff; border: 1px solid var(--color-border-standard); border-radius: var(--radius-lg); padding: 22px; box-shadow: var(--shadow-sm);">
          <div style="width: 38px; height: 38px; border-radius: 10px; background: ${p.bg}; color: ${p.color}; display: flex; align-items: center; justify-content: center; margin-bottom: 14px;">
            ${p.icon}
          </div>
          <h3 style="font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">${p.title}</h3>
          <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin: 0;">${p.desc}</p>
        </div>
      `).join('')}
    </div>
  `;
}

function renderFirstRunDashboard(userProfile) {
  const userName = userProfile?.shortName || (userProfile?.name ? userProfile.name.split(' ')[0] : 'Advocate');
  return `
    <div class="first-run-dashboard empty-state" style="max-width: 900px; margin: 20px auto; padding: 24px;">
      ${renderFirstRunWelcomeHero(userName)}
      ${renderFirstRunPillars()}
      <div style="background: var(--color-surface-container-low); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-md); padding: 14px 18px; display: flex; align-items: center; gap: 12px;">
        <div style="color: #006948;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
        </div>
        <div style="font-size: 12.5px; color: #475569; line-height: 1.45;">
          <strong>Local Zero-Knowledge Architecture:</strong> SettleMint runs 100% on your device using encrypted SQLite. No servers, no tracking, and no external requests.
        </div>
      </div>
    </div>
  `;
}

function getCaseIconAndBadge(c) {
  if (c.debtType === 'credit_card' || c.iconType === 'credit_card') {
    return {
      iconSvg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line><circle cx="6" cy="15" r="1.5" fill="currentColor"></circle></svg>',
      iconClass: 'indigo', serviceBadge: 'Credit Card • Revolving', badgeClass: 'badge-credit'
    };
  }
  if (c.debtType === 'auto_deficiency' || c.iconType === 'auto') {
    return {
      iconSvg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9C2.1 11 2 11.5 2 12v4c0 .6.4 1 1 1h2"></path><circle cx="7" cy="17" r="2"></circle><path d="M9 17h6"></path><circle cx="17" cy="17" r="2"></circle></svg>',
      iconClass: 'amber', serviceBadge: 'Auto Finance • Deficiency', badgeClass: 'badge-auto'
    };
  }
  if (c.debtType === 'personal_loan' || c.iconType === 'loan') {
    return {
      iconSvg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M3 10h18M5 10v11M19 10v11M9 10v11M14 10v11M12 2 2 7h20L12 2z"></path></svg>',
      iconClass: 'violet', serviceBadge: 'Installment Loan • Unsecured', badgeClass: 'badge-loan'
    };
  }
  return {
    iconSvg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><line x1="12" y1="8" x2="12" y2="14"></line><line x1="9" y1="11" x2="15" y2="11"></line></svg>',
    iconClass: 'mint', serviceBadge: c.providerCategory || 'Medical • Healthcare', badgeClass: 'badge-medical'
  };
}

function getStatusPillAndTimeline(c) {
  let statusPillClass = "status-pill-neutral";
  let statusDotClass = "status-dot-amber";
  if (c.statusBadge.includes("Waiting")) {
    statusPillClass = "status-pill-amber";
    statusDotClass = "status-dot-amber";
  } else if (c.statusBadge.includes("Stop-Contact")) {
    statusPillClass = "status-pill-mint";
    statusDotClass = "status-dot-mint";
  }

  let timelinePhrase = c.collectionStatus;
  let timelineColor = "#64748b";
  if (c.statutoryDaysRemaining > 0) {
    timelinePhrase = `${c.statutoryDaysRemaining} days to validate`;
    timelineColor = "var(--color-amber)";
  } else if (c.collectionStatus.includes("Paused")) {
    timelineColor = "var(--color-primary)";
  }

  return { statusPillClass, statusDotClass, timelinePhrase, timelineColor };
}

function renderDisputeTimelineStepper(currentPhase) {
  return `
    <div class="card-inspector-stepper-wrap">
      <div class="timeline-stepper">
        <div class="step-node ${currentPhase === 'InitialNotice' ? 'active' : 'done'}">
          <span class="step-num">1</span><span class="step-name">Notice Received</span>
        </div>
        <div class="step-connector ${currentPhase !== 'InitialNotice' ? 'active' : ''}"></div>
        <div class="step-node ${currentPhase === 'ValidationPending' ? 'active' : currentPhase !== 'InitialNotice' ? 'done' : ''}">
          <span class="step-num">2</span><span class="step-name">DVL Demanded</span>
        </div>
        <div class="step-connector ${currentPhase === 'DisputeEscalated' || currentPhase === 'CollectorResponded' ? 'active' : ''}"></div>
        <div class="step-node ${currentPhase === 'CollectorResponded' ? 'active' : ''}">
          <span class="step-num">3</span><span class="step-name">Collector Review</span>
        </div>
        <div class="step-connector ${currentPhase === 'DisputeEscalated' ? 'active' : ''}"></div>
        <div class="step-node ${currentPhase === 'DisputeEscalated' ? 'active' : ''}">
          <span class="step-num">4</span><span class="step-name">Dispute Escalated</span>
        </div>
        <div class="step-connector"></div>
        <div class="step-node">
          <span class="step-num">5</span><span class="step-name">Case Dismissed</span>
        </div>
      </div>
    </div>
  `;
}

function renderInspectorDrawer(c) {
  return `
    <div class="expandable-card-body">
      <div class="card-in-place-inspector">
        <div class="card-inspector-header-strip">
          <div class="inspector-badge-lead">
            <span class="inspector-pulse-circle-sm">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#006948" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
            </span>
            <span class="label-caps-sm">ACTIVE DOSSIER INSPECTOR</span>
          </div>
          <div class="card-inspector-meta-tags">
            <span class="meta-tag">Jurisdiction: ${c.jurisdictionState || 'New York (CPLR § 214-i)'}</span>
            ${c.legalFramework ? `<span class="meta-tag alert-amber">${c.legalFramework}</span>` : ''}
            ${c.violationsCount > 0 ? `<span class="meta-tag alert-rose">■ ${c.violationsCount} Statutory Infraction(s) Flagged</span>` : ''}
          </div>
        </div>

        ${renderDisputeTimelineStepper(c.currentPhase)}

        <div class="card-inspector-action-bar">
          <span class="card-inspector-caption">
            ${c.notes || "Statutory debt validation demand in progress. Collectors must halt outreach until written verification is supplied."}
          </span>
          <div class="card-inspector-buttons">
            <button type="button" class="btn btn-pill-outline btn-sm quick-open-letter-btn" data-case-id="${c.id}" title="Draft Dispute Letter">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
              Draft Dispute Letter
            </button>
            <button type="button" class="btn btn-pill-outline btn-sm quick-open-calls-btn" data-case-id="${c.id}" title="Log Collector Call">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              Log Collector Call
            </button>
          </div>
        </div>
      </div>

      <div class="dossier-card-footer">
        <span class="docket-id-tag">${c.docketNumber}</span>
        <button type="button" class="btn btn-pill-primary btn-sm dispute-action-btn" data-case-id="${c.id}" data-action="letters">
          <span>Open in Letter Studio</span>
          <span style="font-size: 13px;">›</span>
        </button>
      </div>
    </div>
  `;
}

function renderDisputeCard(c, isExpanded) {
  const { iconSvg, iconClass, serviceBadge, badgeClass } = getCaseIconAndBadge(c);
  const { statusPillClass, statusDotClass, timelinePhrase, timelineColor } = getStatusPillAndTimeline(c);

  return `
    <div class="orderly-dispute-card expandable-card ${isExpanded ? 'is-expanded active-case' : 'is-collapsed'}" data-case-id="${c.id}">
      <div class="expandable-card-header" role="button" aria-expanded="${isExpanded}" tabindex="0" title="${isExpanded ? 'Click to collapse details' : 'Click to inspect dossier details'}">
        <div class="card-header-provider">
          <div class="dispute-card-icon-wrap ${iconClass}">${iconSvg}</div>
          <div class="provider-info-block">
            <h4 class="provider-title">${c.originalProvider}</h4>
            <span class="service-category-badge ${badgeClass}" title="${c.legalFramework || ''}">${serviceBadge}</span>
          </div>
        </div>

        <div class="card-header-financials">
          <div class="header-financial-val tabular-nums">$${c.disputedBalance.toFixed(2)}</div>
          <div class="dossier-timeline-tag" style="color: ${timelineColor};">
            <span class="timeline-dot" style="background-color: ${timelineColor};"></span>
            <span>${timelinePhrase}</span>
          </div>
        </div>

        <div class="card-header-collector">
          <div class="collector-agency-name" title="${c.collectionAgency}">${c.collectionAgency}</div>
          <div class="collector-account-num">
            <span>Account:</span>
            <span class="label-code" style="font-size: 11px;">${c.originalAccountNumber}</span>
          </div>
        </div>

        <div class="card-header-actions">
          <div class="card-header-tags">
            <span class="status-pill ${statusPillClass}">
              <span class="status-dot ${statusDotClass}"></span>
              ${c.statusBadge}
            </span>
            ${c.certifiedMailTracking ? `
              <span class="certified-tag" title="USPS Certified Tracking: ${c.certifiedMailTracking}">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                USPS Certified
              </span>
            ` : ''}
          </div>
          <button type="button" class="dossier-expand-toggle ${isExpanded ? 'is-open' : ''}" aria-label="${isExpanded ? 'Collapse card' : 'Expand card'}">
            <span class="expand-toggle-label">${isExpanded ? 'Collapse' : 'Inspect'}</span>
            <svg class="expand-chevron" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        </div>
      </div>

      ${isExpanded ? renderInspectorDrawer(c) : ''}
    </div>
  `;
}

function renderMetricsGrid(cases, totalBalance, earliestDeadlineDays, earliestAgency, totalViolations, totalDamages) {
  return `
    <section class="orderly-metrics-grid">
      <div class="orderly-metric-card">
        <div class="metric-card-header">
          <span class="metric-card-label">TOTAL UNDER DISPUTE</span>
          <div class="metric-card-icon mint">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="2" y="4" width="20" height="16" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
          </div>
        </div>
        <div class="metric-card-value tabular-nums">$${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        <div class="metric-card-sub">${cases.length} disputed consumer & medical claims</div>
        <div class="metric-card-footer">
          <span class="status-pill status-pill-mint"><span class="status-dot status-dot-mint"></span>Paused by Law</span>
          <span class="footer-legal-tag">15 U.S.C. § 1692g(b)</span>
        </div>
      </div>

      <div class="orderly-metric-card">
        <div class="metric-card-header">
          <span class="metric-card-label">EARLIEST DEADLINE</span>
          <div class="metric-card-icon amber">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
        </div>
        <div class="metric-card-value tabular-nums">${earliestDeadlineDays} Days Left</div>
        <div class="metric-card-sub">${escapeHtml(earliestAgency)} validation clock</div>
        <div class="metric-card-footer">
          <span class="status-pill status-pill-amber">Clock Active</span>
          <span class="footer-legal-tag">30-Day Window</span>
        </div>
      </div>

      <div class="orderly-metric-card">
        <div class="metric-card-header">
          <span class="metric-card-label">COLLECTOR INFRACTIONS</span>
          <div class="metric-card-icon rose">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m14 13-7.5 7.5a2.12 2.12 0 1 1-3-3L11 10"></path><path d="m16 16 6-6"></path><path d="m8 8 6-6"></path></svg>
          </div>
        </div>
        <div class="metric-card-value text-rose tabular-nums">${totalViolations} Infractions</div>
        <div class="metric-card-sub">Missing chain-of-title, late calls & threats</div>
        <div class="metric-card-footer">
          <span class="status-pill status-pill-rose" style="font-weight: 700;">Up to $${totalDamages.toLocaleString("en-US", { minimumFractionDigits: 0 })}</span>
          <span class="footer-legal-tag">15 U.S.C. § 1692k</span>
        </div>
      </div>
    </section>
  `;
}

function renderDashboardHeader(userName, casesCount) {
  return `
    <section class="orderly-welcome-banner">
      <div class="welcome-header-left">
        <div class="welcome-shield-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#006948" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
        </div>
        <div class="welcome-text-group">
          <div class="welcome-title-row">
            <h2 class="welcome-heading">Welcome back, ${escapeHtml(userName)}</h2>
            <span class="status-pill status-pill-mint"><span class="status-dot status-dot-mint"></span>FDCPA Active Shield</span>
          </div>
          <p class="welcome-description">
            Your <strong>${casesCount} consumer debt disputes</strong> (Credit Cards, Medical, Auto & Loans) are actively defended under 15 U.S.C. § 1692, CFPB Regulation F & the FCRA. All validation clocks are monitored automatically.
          </p>
        </div>
      </div>
    </section>
  `;
}

function renderAdvisoryStrip() {
  return `
    <section class="orderly-advisory-strip">
      <div class="advisory-strip-left">
        <div class="advisory-strip-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#006948" stroke-width="2.2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
        </div>
        <div class="advisory-strip-text">
          <h4 class="advisory-strip-title">Next Steps & FDCPA Consumer Shield Rules</h4>
          <div class="advisory-points-row">
            <div class="advisory-point-item"><span class="point-bullet">🛡</span><span><strong>Do not make token payments:</strong> In many states, any partial payment resets the statutory lawsuit clock on revolving credit and installment notes.</span></div>
            <div class="advisory-point-item"><span class="point-bullet">📜</span><span><strong>Demand chain of title:</strong> Junk debt buyers must prove legal assignment from the original card issuer or creditor under CFPB Reg F.</span></div>
            <div class="advisory-point-item"><span class="point-bullet">📞</span><span><strong>If a collector calls:</strong> Click <em>Quick Call Script</em> in the sidebar to read our 1-minute legal deflection phrase.</span></div>
          </div>
        </div>
      </div>
    </section>
  `;
}

export function renderDashboard(activeCase, allCases = [], expandedCaseIds = null, userProfile = null, isDemoMode = false) {
  const cases = allCases.length > 0 ? allCases : (activeCase ? [activeCase] : []);
  if (cases.length === 0) return renderFirstRunDashboard(userProfile);

  const totalBalance = cases.reduce((acc, c) => acc + (c.disputedBalance || 0), 0);
  const totalViolations = cases.reduce((acc, c) => acc + (c.violationsCount || 0), 0);
  const totalDamages = cases.reduce((acc, c) => acc + (c.potentialDamages || 0), 0);

  let earliestDeadlineDays = 30;
  let earliestAgency = "30-Day Window";
  if (cases.length > 0) {
    const sorted = [...cases].sort((a, b) => (a.statutoryDaysRemaining ?? 30) - (b.statutoryDaysRemaining ?? 30));
    earliestDeadlineDays = sorted[0].statutoryDaysRemaining ?? 30;
    earliestAgency = sorted[0].collectionAgency || sorted[0].originalProvider || "Active case";
  }

  const disputeCardsHtml = cases.map(c => {
    const isExpanded = expandedCaseIds 
      ? (expandedCaseIds instanceof Set ? expandedCaseIds.has(c.id) : expandedCaseIds.includes(c.id)) 
      : (c.id === activeCase?.id);
    return renderDisputeCard(c, isExpanded);
  }).join("");

  const demoBannerHtml = isDemoMode ? `
    <div class="demo-mode-banner" style="background: #fffbeb; border: 1px solid #fde68a; border-radius: var(--radius-lg); padding: 12px 18px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
      <div style="display: flex; align-items: center; gap: 10px;">
        <span class="status-pill status-pill-amber" style="font-weight: 700; font-size: 11px;">SAMPLE DEMO MODE</span>
        <span style="font-size: 13px; color: #92400e;">You are exploring sample educational dispute dossiers. Real data will be saved locally on your device.</span>
      </div>
      <div style="display: flex; gap: 8px;">
        <button type="button" class="btn btn-pill-primary btn-sm" id="demoBannerNewDisputeBtn">+ Add Real Dispute</button>
        <button type="button" class="btn btn-pill-outline btn-sm" id="demoBannerClearBtn" style="color: #b45309; border-color: #fcd34d;">Clear Demo Data & Start Fresh</button>
      </div>
    </div>
  ` : '';

  const userName = userProfile?.shortName || (userProfile?.name ? userProfile.name.split(' ')[0] : 'Advocate');

  return `
    ${demoBannerHtml}
    ${renderDashboardHeader(userName, cases.length)}
    ${renderMetricsGrid(cases, totalBalance, earliestDeadlineDays, earliestAgency, totalViolations, totalDamages)}
    <section class="orderly-disputes-section">
      <div class="disputes-section-header">
        <div class="disputes-header-titles">
          <div style="display: flex; align-items: center; gap: 10px;">
            <h3 class="disputes-title">Active Dispute Dossiers</h3>
            <span class="status-pill status-pill-mint" style="font-size: 11px; padding: 2px 8px;">${cases.length} Tracked</span>
          </div>
          <p class="disputes-subtitle">Expand any dossier to inspect validation status, statutory infractions, and generate certified dispute letters.</p>
        </div>
        <div class="disputes-controls">
          <button type="button" class="btn-toggle-all-dossiers" id="toggleAllDossiersBtn">
            ${(expandedCaseIds && (expandedCaseIds.size || expandedCaseIds.length) === cases.length) ? 'Collapse All' : 'Expand All'}
          </button>
          <select class="orderly-filter-select studio-select" id="disputeFilterSelect">
            <option value="all">All ${cases.length} Accounts (FDCPA Covered)</option>
            <option value="credit_card">Credit Card Debt (Revolving)</option>
            <option value="medical">Medical & Hospital Debts</option>
            <option value="auto_deficiency">Auto Loan Deficiencies</option>
            <option value="personal_loan">Personal & Installment Loans</option>
          </select>
        </div>
      </div>
      <div class="disputes-stack-container">${disputeCardsHtml}</div>
    </section>
    ${renderAdvisoryStrip()}
  `;
}
