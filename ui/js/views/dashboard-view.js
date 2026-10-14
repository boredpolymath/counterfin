/**
 * SettleMint Dashboard View: Orderly Consumer Advocacy Dashboard
 * Clean, structured, anxiety-reducing information hierarchy
 */

import { USER_PROFILE } from '../data/mock-dossiers.js';

export function renderDashboard(activeCase, allCases = [], expandedCaseId = null) {
  if (!activeCase) {
    return `<div class="empty-state">No active dispute dossier selected.</div>`;
  }

  const cases = allCases.length > 0 ? allCases : [activeCase];

  // 1. Calculate Summary Metrics
  const totalBalance = cases.reduce((acc, c) => acc + (c.disputedBalance || 0), 0);
  const totalViolations = cases.reduce((acc, c) => acc + (c.violationsCount || 0), 0);
  const totalDamages = cases.reduce((acc, c) => acc + (c.potentialDamages || 0), 0);

  // 2. Render Structured Dispute Items
  const disputeCardsHtml = cases.map(c => {
    const isSelected = c.id === activeCase.id;
    const isExpanded = c.id === (expandedCaseId || activeCase.id);

    // Icon SVGs
    let iconSvg = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#006948" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    `;
    let iconClass = "mint";
    let serviceBadge = "Emergency Care";

    if (c.iconType === "cardiology") {
      iconSvg = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#006948" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      `;
      iconClass = "mint";
      serviceBadge = "Cardiology Specialist";
    } else if (c.iconType === "imaging") {
      iconSvg = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
          <line x1="8" y1="21" x2="16" y2="21"></line>
          <line x1="12" y1="17" x2="12" y2="21"></line>
        </svg>
      `;
      iconClass = "slate";
      serviceBadge = "MRI / Diagnostics";
    }

    // Status pill
    let statusPillClass = "status-pill-neutral";
    let statusDotClass = "status-dot-amber";
    if (c.statusBadge.includes("Waiting")) {
      statusPillClass = "status-pill-amber";
      statusDotClass = "status-dot-amber";
    } else if (c.statusBadge.includes("Stop-Contact")) {
      statusPillClass = "status-pill-mint";
      statusDotClass = "status-dot-mint";
    }

    // Status phrase and timeline
    let timelinePhrase = c.collectionStatus;
    let timelineColor = "#64748b";
    if (c.statutoryDaysRemaining > 0) {
      timelinePhrase = `${c.statutoryDaysRemaining} days to validate`;
      timelineColor = "var(--color-amber)";
    } else if (c.collectionStatus.includes("Paused")) {
      timelineColor = "var(--color-primary)";
    }

    return `
      <div class="orderly-dispute-card ${isSelected ? 'active-case' : ''}" data-case-id="${c.id}">
        <!-- Card Header -->
        <div class="dossier-card-top">
          <div class="dossier-card-provider">
            <div class="dispute-card-icon-wrap ${iconClass}">
              ${iconSvg}
            </div>
            <div class="provider-info-block">
              <h4 class="provider-title">${c.originalProvider}</h4>
              <span class="service-category-badge">${serviceBadge}</span>
            </div>
          </div>
          <div class="dossier-card-top-right">
            ${isSelected ? `
              <span class="status-pill status-pill-mint selected-badge">
                <span class="status-dot status-dot-mint"></span>
                Inspecting
              </span>
            ` : `
              <span class="status-pill status-pill-neutral">
                Select
              </span>
            `}
          </div>
        </div>

        <!-- Disputed Financials & Statutory Timeline -->
        <div class="dossier-card-financials">
          <div class="dossier-balance-group">
            <span class="dossier-balance-label">DISPUTED BALANCE</span>
            <div class="balance-display tabular-nums">$${c.disputedBalance.toFixed(2)}</div>
          </div>
          <div class="dossier-timeline-tag" style="color: ${timelineColor};">
            <span class="timeline-dot" style="background-color: ${timelineColor};"></span>
            <span>${timelinePhrase}</span>
          </div>
        </div>

        <!-- Account & Collector Meta -->
        <div class="dossier-card-meta">
          <div class="dossier-meta-item">
            <span class="meta-label">Agency:</span>
            <span class="meta-val">${c.collectionAgency}</span>
          </div>
          <div class="dossier-meta-item">
            <span class="meta-label">Account:</span>
            <span class="meta-val">${c.originalAccountNumber}</span>
          </div>
        </div>

        <!-- Legal Status & USPS Tracking -->
        <div class="dossier-card-status-bar">
          <span class="status-pill ${statusPillClass}">
            <span class="status-dot ${statusDotClass}"></span>
            ${c.statusBadge}
          </span>
          ${c.certifiedMailTracking ? `
            <span class="certified-tag" title="Tracking: ${c.certifiedMailTracking}">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              USPS Certified
            </span>
          ` : ''}
        </div>

        <!-- Footer Actions -->
        <div class="dossier-card-footer">
          <span class="docket-id-tag">${c.docketNumber}</span>
          <button class="btn btn-pill-primary btn-sm dispute-action-btn" data-case-id="${c.id}" data-action="${c.actionLabel === 'Review Letter' ? 'letters' : 'details'}">
            <span>${c.actionLabel}</span>
            <span style="font-size: 13px;">›</span>
          </button>
        </div>
      </div>
    `;
  }).join("");

  return `
    <!-- 1. Header Overview & Protection State Banner -->
    <section class="orderly-welcome-banner">
      <div class="welcome-header-left">
        <div class="welcome-shield-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#006948" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            <path d="m9 12 2 2 4-4"></path>
          </svg>
        </div>
        <div class="welcome-text-group">
          <div class="welcome-title-row">
            <h2 class="welcome-heading">Welcome back, ${USER_PROFILE.shortName}</h2>
            <span class="status-pill status-pill-mint">
              <span class="status-dot status-dot-mint"></span>
              Under Active Protection
            </span>
          </div>
          <p class="welcome-description">
            Your <strong>${cases.length} medical disputes</strong> are actively defended under 15 U.S.C. § 1692 & the No Surprises Act. All validation clocks are monitored automatically.
          </p>
        </div>
      </div>
    </section>

    <!-- 2. Balanced Metric Triad Cards -->
    <section class="orderly-metrics-grid">
      <!-- Metric 1: Total Under Dispute -->
      <div class="orderly-metric-card">
        <div class="metric-card-header">
          <span class="metric-card-label">TOTAL UNDER DISPUTE</span>
          <div class="metric-card-icon mint">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <rect x="2" y="4" width="20" height="16" rx="2"></rect>
              <line x1="2" y1="10" x2="22" y2="10"></line>
            </svg>
          </div>
        </div>
        <div class="metric-card-value tabular-nums">$${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        <div class="metric-card-sub">${cases.length} disputed healthcare claims</div>
        <div class="metric-card-footer">
          <span class="status-pill status-pill-mint">
            <span class="status-dot status-dot-mint"></span>
            Paused by Law
          </span>
          <span class="footer-legal-tag">15 U.S.C. § 1692g(b)</span>
        </div>
      </div>

      <!-- Metric 2: Earliest Deadline -->
      <div class="orderly-metric-card">
        <div class="metric-card-header">
          <span class="metric-card-label">EARLIEST DEADLINE</span>
          <div class="metric-card-icon amber">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
        </div>
        <div class="metric-card-value tabular-nums">${USER_PROFILE.nextDeadlineDays} Days Left</div>
        <div class="metric-card-sub">${USER_PROFILE.nextDeadlineAgency} verification clock</div>
        <div class="metric-card-footer">
          <span class="status-pill status-pill-amber">
            Clock Active
          </span>
          <span class="footer-legal-tag">30-Day Window</span>
        </div>
      </div>

      <!-- Metric 3: Collector Violations -->
      <div class="orderly-metric-card">
        <div class="metric-card-header">
          <span class="metric-card-label">COLLECTOR INFRACTIONS</span>
          <div class="metric-card-icon rose">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="m14 13-7.5 7.5a2.12 2.12 0 1 1-3-3L11 10"></path>
              <path d="m16 16 6-6"></path>
              <path d="m8 8 6-6"></path>
            </svg>
          </div>
        </div>
        <div class="metric-card-value text-rose tabular-nums">${totalViolations} Infractions</div>
        <div class="metric-card-sub">Late-night calls & unverified claims</div>
        <div class="metric-card-footer">
          <span class="status-pill status-pill-rose" style="font-weight: 700;">
            Up to $${totalDamages.toLocaleString("en-US", { minimumFractionDigits: 0 })}
          </span>
          <span class="footer-legal-tag">15 U.S.C. § 1692k</span>
        </div>
      </div>
    </section>

    <!-- 3. Active Disputes Section (Structured Docket List) -->
    <section class="orderly-disputes-section">
      <div class="disputes-section-header">
        <div class="disputes-header-titles">
          <h3 class="disputes-title">Active Dispute Dossiers</h3>
          <p class="disputes-subtitle">Collectors are legally barred from reporting unverified claims to credit bureaus.</p>
        </div>
        <div class="disputes-controls">
          <select class="orderly-filter-select" id="disputeFilterSelect">
            <option value="all">All ${cases.length} Accounts</option>
            <option value="er">Emergency Room (ER)</option>
            <option value="specialist">Specialist / Cardiology</option>
            <option value="imaging">Imaging / Radiology</option>
          </select>
        </div>
      </div>

      <div class="disputes-grid-container">
        ${disputeCardsHtml}
      </div>

      <!-- Active Dossier Inspection Panel -->
      ${activeCase ? `
        <div class="dossier-inspector-panel">
          <div class="dossier-tray-header">
            <div class="tray-title-block">
              <div class="inspector-pulse-circle">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#006948" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  <path d="m9 12 2 2 4-4"></path>
                </svg>
              </div>
              <div>
                <span class="label-caps">ACTIVE DOSSIER INSPECTOR</span>
                <h4 class="inspector-provider-name">${activeCase.originalProvider} <span class="docket-id-tag">${activeCase.docketNumber}</span></h4>
              </div>
            </div>
            <div class="tray-meta-pills">
              <span class="meta-tag">Date of Service: ${activeCase.dateOfService}</span>
              <span class="meta-tag">Jurisdiction: New York (CPLR § 214-i)</span>
              ${activeCase.violationsCount > 0 ? `
                <span class="meta-tag alert-rose">■ ${activeCase.violationsCount} FDCPA Infraction(s) Flagged</span>
              ` : ''}
            </div>
          </div>

          <!-- 5-Phase Dispute Timeline Bar -->
          <div class="timeline-stepper">
            <div class="step-node ${activeCase.currentPhase === 'InitialNotice' ? 'active' : 'done'}">
              <span class="step-num">1</span>
              <span class="step-name">Notice Received</span>
            </div>
            <div class="step-connector ${activeCase.currentPhase !== 'InitialNotice' ? 'active' : ''}"></div>
            <div class="step-node ${activeCase.currentPhase === 'ValidationPending' ? 'active' : activeCase.currentPhase !== 'InitialNotice' ? 'done' : ''}">
              <span class="step-num">2</span>
              <span class="step-name">DVL Demanded</span>
            </div>
            <div class="step-connector ${activeCase.currentPhase === 'DisputeEscalated' || activeCase.currentPhase === 'CollectorResponded' ? 'active' : ''}"></div>
            <div class="step-node ${activeCase.currentPhase === 'CollectorResponded' ? 'active' : ''}">
              <span class="step-num">3</span>
              <span class="step-name">Collector Review</span>
            </div>
            <div class="step-connector ${activeCase.currentPhase === 'DisputeEscalated' ? 'active' : ''}"></div>
            <div class="step-node ${activeCase.currentPhase === 'DisputeEscalated' ? 'active' : ''}">
              <span class="step-num">4</span>
              <span class="step-name">Dispute Escalated</span>
            </div>
            <div class="step-connector"></div>
            <div class="step-node">
              <span class="step-num">5</span>
              <span class="step-name">Case Dismissed</span>
            </div>
          </div>

          <div class="tray-action-bar">
            <span class="tray-caption">
              ${activeCase.notes || "Statutory debt validation demand in progress. Collectors must halt outreach until written verification is supplied."}
            </span>
            <div class="tray-buttons">
              <button class="btn btn-pill-outline btn-sm quick-open-letter-btn" data-case-id="${activeCase.id}">
                Draft Dispute Letter
              </button>
              <button class="btn btn-pill-outline btn-sm quick-open-calls-btn" data-case-id="${activeCase.id}">
                Log Collector Call
              </button>
            </div>
          </div>
        </div>
      ` : ''}
    </section>

    <!-- 4. Peaceful Reassurance & Next Steps Advisory Strip -->
    <section class="orderly-advisory-strip">
      <div class="advisory-strip-left">
        <div class="advisory-strip-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#006948" stroke-width="2.2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </div>
        <div class="advisory-strip-text">
          <h4 class="advisory-strip-title">Next Steps & Patient Protection Rules</h4>
          <div class="advisory-points-row">
            <div class="advisory-point-item">
              <span class="point-bullet">🛡</span>
              <span><strong>Do not make token payments:</strong> In many states, any partial payment resets the statutory lawsuit clock.</span>
            </div>
            <div class="advisory-point-item">
              <span class="point-bullet">📞</span>
              <span><strong>If a collector calls:</strong> Click <em>Quick Call Script</em> in the sidebar to read our 1-minute legal deflection phrase.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}
