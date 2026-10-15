use chrono::{Datelike, Duration, NaiveDate, Timelike, Utc, Weekday};
use serde::{Deserialize, Serialize};

/// Comprehensive breakdown of the 30-day debt validation window under 15 U.S.C. § 1692g
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ValidationWindow {
    pub initial_notice_date: String,
    pub raw_30_day_deadline: String,
    pub adjusted_deadline: String,
    pub is_extended: bool,
    pub extension_reason: Option<String>,
    pub days_remaining: i64,
    pub is_expired: bool,
    pub business_days_remaining: i64,
}

/// FDCPA Statutory Engine pursuant to 15 U.S.C. § 1692 et seq.
pub struct FdcpaEngine;

impl FdcpaEngine {
    /// Calculate the mandatory 30-day validation expiration date pursuant to 15 U.S.C. § 1692g
    /// Rolls forward over weekends and legal federal holidays under FRCP Rule 6(a)
    pub fn calculate_validation_deadline(initial_notice_date: NaiveDate) -> NaiveDate {
        let raw_deadline = initial_notice_date + Duration::days(30);
        let (adjusted, _, _) = Self::adjust_for_weekends_and_holidays(raw_deadline);
        adjusted
    }

    /// Calculate raw unadjusted 30 calendar days
    pub fn calculate_raw_30_day_deadline(initial_notice_date: NaiveDate) -> NaiveDate {
        initial_notice_date + Duration::days(30)
    }

    /// Complete 30-day validation window analysis with holiday rollover, days remaining,
    /// and business day counts
    pub fn calculate_validation_window(
        initial_notice_date: NaiveDate,
        reference_today: Option<NaiveDate>,
    ) -> ValidationWindow {
        let raw_deadline = Self::calculate_raw_30_day_deadline(initial_notice_date);
        let (adjusted_deadline, is_extended, extension_reason) =
            Self::adjust_for_weekends_and_holidays(raw_deadline);

        let today = reference_today.unwrap_or_else(|| Utc::now().date_naive());
        let days_remaining = (adjusted_deadline - today).num_days();
        let is_expired = days_remaining < 0;
        let business_days_remaining = if is_expired {
            0
        } else {
            Self::count_business_days(today, adjusted_deadline)
        };

        ValidationWindow {
            initial_notice_date: initial_notice_date.format("%Y-%m-%d").to_string(),
            raw_30_day_deadline: raw_deadline.format("%Y-%m-%d").to_string(),
            adjusted_deadline: adjusted_deadline.format("%Y-%m-%d").to_string(),
            is_extended,
            extension_reason,
            days_remaining,
            is_expired,
            business_days_remaining,
        }
    }

    /// Determine if a given calendar date is an observed United States Federal Holiday (5 U.S.C. § 6103)
    pub fn is_federal_holiday(date: NaiveDate) -> Option<&'static str> {
        let year = date.year();
        let month = date.month();
        let day = date.day();
        let weekday = date.weekday();

        // 1. New Year's Day (Jan 1, observed)
        if Self::is_observed_fixed_holiday(date, year, 1, 1) {
            return Some("New Year's Day");
        }

        // 2. Martin Luther King, Jr. Day (Third Monday in January)
        if month == 1 && weekday == Weekday::Mon && (15..=21).contains(&day) {
            return Some("Martin Luther King Jr. Day");
        }

        // 3. Washington's Birthday / Presidents' Day (Third Monday in February)
        if month == 2 && weekday == Weekday::Mon && (15..=21).contains(&day) {
            return Some("Washington's Birthday");
        }

        // 4. Memorial Day (Last Monday in May)
        if month == 5 && weekday == Weekday::Mon && day >= 25 {
            return Some("Memorial Day");
        }

        // 5. Juneteenth National Independence Day (June 19, observed)
        if Self::is_observed_fixed_holiday(date, year, 6, 19) {
            return Some("Juneteenth National Independence Day");
        }

        // 6. Independence Day (July 4, observed)
        if Self::is_observed_fixed_holiday(date, year, 7, 4) {
            return Some("Independence Day");
        }

        // 7. Labor Day (First Monday in September)
        if month == 9 && weekday == Weekday::Mon && (1..=7).contains(&day) {
            return Some("Labor Day");
        }

        // 8. Columbus Day (Second Monday in October)
        if month == 10 && weekday == Weekday::Mon && (8..=14).contains(&day) {
            return Some("Columbus Day");
        }

        // 9. Veterans Day (November 11, observed)
        if Self::is_observed_fixed_holiday(date, year, 11, 11) {
            return Some("Veterans Day");
        }

        // 10. Thanksgiving Day (Fourth Thursday in November)
        if month == 11 && weekday == Weekday::Thu && (22..=28).contains(&day) {
            return Some("Thanksgiving Day");
        }

        // 11. Christmas Day (December 25, observed)
        if Self::is_observed_fixed_holiday(date, year, 12, 25) {
            return Some("Christmas Day");
        }

        None
    }

    /// Evaluates if a fixed-date holiday or its observed shift falls on the given date
    fn is_observed_fixed_holiday(date: NaiveDate, year: i32, month: u32, day: u32) -> bool {
        if let Some(target) = NaiveDate::from_ymd_opt(year, month, day) {
            let observed = match target.weekday() {
                Weekday::Sat => target.pred_opt().unwrap_or(target), // Observed Friday
                Weekday::Sun => target.succ_opt().unwrap_or(target), // Observed Monday
                _ => target,
            };
            if date == observed {
                return true;
            }
        }
        // Handle Dec 31 observed for New Year's Day when Jan 1 is Saturday
        if month == 1 && day == 1 {
            let next_year_jan1 = NaiveDate::from_ymd_opt(year + 1, 1, 1);
            if matches!(next_year_jan1, Some(ny) if ny.weekday() == Weekday::Sat && date == ny.pred_opt().unwrap_or(ny)) {
                return true;
            }
        }
        false
    }

    /// Roll deadline forward if it falls on Saturday, Sunday, or a legal federal holiday
    pub fn adjust_for_weekends_and_holidays(date: NaiveDate) -> (NaiveDate, bool, Option<String>) {
        let mut current = date;
        let mut was_extended = false;
        let mut reasons = Vec::new();

        loop {
            let is_weekend = current.weekday() == Weekday::Sat || current.weekday() == Weekday::Sun;
            let holiday = Self::is_federal_holiday(current);

            if is_weekend || holiday.is_some() {
                was_extended = true;
                if is_weekend {
                    reasons.push(format!("Weekend ({:?})", current.weekday()));
                }
                if let Some(h) = holiday {
                    reasons.push(format!("Federal Holiday ({})", h));
                }
                current = current.succ_opt().unwrap_or(current);
            } else {
                break;
            }
        }

        let reason_str = if was_extended {
            Some(reasons.join(", "))
        } else {
            None
        };

        (current, was_extended, reason_str)
    }

    /// Count business days (excluding weekends and federal holidays) between two dates
    pub fn count_business_days(start: NaiveDate, end: NaiveDate) -> i64 {
        if start >= end {
            return 0;
        }
        let mut count = 0;
        let mut curr = start;
        while curr < end {
            curr = curr.succ_opt().unwrap_or(curr);
            if curr.weekday() != Weekday::Sat
                && curr.weekday() != Weekday::Sun
                && Self::is_federal_holiday(curr).is_none()
            {
                count += 1;
            }
        }
        count
    }

    /// Check if a contact timestamp violates the convenient hours requirement (8:00 AM to 9:00 PM local time)
    /// 15 U.S.C. § 1692c(a)(1)
    pub fn is_inconvenient_hour(hour_local: u32) -> bool {
        !(8..21).contains(&hour_local)
    }

    /// Evaluate an incoming interaction timestamp against local debtor timezone
    /// Violation if contact is placed before 08:00 or after 21:00 local debtor time
    pub fn check_inconvenient_time_violation(
        target_interaction: &crate::models::interaction::Interaction,
        debtor_tz_offset_hours: i32,
    ) -> Option<crate::models::violation::Violation> {
        if target_interaction.direction != crate::models::interaction::Direction::Incoming {
            return None;
        }

        let utc_hour = target_interaction.timestamp.hour() as i32;
        let local_hour = (utc_hour + debtor_tz_offset_hours).rem_euclid(24) as u32;

        if Self::is_inconvenient_hour(local_hour) {
            Some(crate::models::violation::Violation {
                id: uuid::Uuid::new_v4(),
                interaction_id: target_interaction.id,
                case_id: target_interaction.case_id,
                violation_type: crate::models::violation::FdcpaViolationType::InconvenientTime,
                statutory_citation: "15 U.S.C. § 1692c(a)(1)".to_string(),
                statutory_penalty_cap: 1000.0,
                actual_damages: 0.0,
                factual_summary: format!(
                    "Inconvenient hour outreach: collection communication placed at {:02}:00 local debtor time (prohibited before 08:00 and after 21:00).",
                    local_hour
                ),
                evidence_references: vec![format!("Timestamp: {:02}:00 local", local_hour)],
            })
        } else {
            None
        }
    }

    /// CFPB Regulation F Call Frequency Rule (12 C.F.R. § 1006.14(b) & 15 U.S.C. § 1692d(5)):
    /// Presumption of harassment if collector places more than 7 telephone calls within any rolling 7-day window.
    pub fn check_call_frequency_violation(
        target_interaction: &crate::models::interaction::Interaction,
        history: &[crate::models::interaction::Interaction],
    ) -> Option<crate::models::violation::Violation> {
        if target_interaction.channel != crate::models::interaction::Channel::Phone {
            return None;
        }

        let target_time = target_interaction.timestamp;
        let window_start = target_time - Duration::days(7);

        // Count all phone calls in the 7-day rolling window
        let mut count = history
            .iter()
            .filter(|i| {
                i.case_id == target_interaction.case_id
                    && i.channel == crate::models::interaction::Channel::Phone
                    && i.timestamp >= window_start
                    && i.timestamp <= target_time
                    && i.id != target_interaction.id
            })
            .count();

        // Include the target call
        count += 1;

        if count > 7 {
            Some(crate::models::violation::Violation {
                id: uuid::Uuid::new_v4(),
                interaction_id: target_interaction.id,
                case_id: target_interaction.case_id,
                violation_type: crate::models::violation::FdcpaViolationType::ContinuousHarassment,
                statutory_citation: "15 U.S.C. § 1692d(5) & 12 C.F.R. § 1006.14(b)".to_string(),
                statutory_penalty_cap: 1000.0,
                actual_damages: 0.0,
                factual_summary: format!(
                    "Excessive call frequency: collector placed {} calls within a 7-day rolling window, exceeding CFPB Regulation F 7-in-7 cap.",
                    count
                ),
                evidence_references: vec![format!("Total phone calls in 7-day window: {}", count)],
            })
        } else {
            None
        }
    }

    /// Validation Stay Rule (15 U.S.C. § 1692g(b)):
    /// All collection activities must cease until the collector obtains and mails written verification of the debt.
    pub fn check_validation_stay_violation(
        target_interaction: &crate::models::interaction::Interaction,
        dvl_delivered_date: Option<chrono::DateTime<Utc>>,
        verification_provided_date: Option<chrono::DateTime<Utc>>,
    ) -> Option<crate::models::violation::Violation> {
        let dvl_date = dvl_delivered_date?;
        if target_interaction.timestamp > dvl_date
            && target_interaction.direction == crate::models::interaction::Direction::Incoming
        {
            let is_unverified = match verification_provided_date {
                Some(v_date) => target_interaction.timestamp < v_date,
                None => true,
            };

            if is_unverified {
                return Some(crate::models::violation::Violation {
                    id: uuid::Uuid::new_v4(),
                    interaction_id: target_interaction.id,
                    case_id: target_interaction.case_id,
                    violation_type: crate::models::violation::FdcpaViolationType::CollectionDuringValidation,
                    statutory_citation: "15 U.S.C. § 1692g(b)".to_string(),
                    statutory_penalty_cap: 1000.0,
                    actual_damages: 0.0,
                    factual_summary: format!(
                        "Unlawful collection outreach during statutory validation stay: contact on {} after timely DVL delivered on {} before verification was mailed.",
                        target_interaction.timestamp.format("%Y-%m-%d"),
                        dvl_date.format("%Y-%m-%d")
                    ),
                    evidence_references: vec!["USPS Certified Mail Delivery Confirmation".to_string()],
                });
            }
        }
        None
    }

    /// Cease and Desist Breach Rule (15 U.S.C. § 1692c(c)):
    /// If consumer notifies collector in writing that they refuse to pay or wish collector to cease communication,
    /// collector shall not communicate further with consumer except to advise remedy invocation or termination.
    pub fn check_cease_and_desist_violation(
        target_interaction: &crate::models::interaction::Interaction,
        cease_desist_delivered_date: Option<chrono::DateTime<Utc>>,
    ) -> Option<crate::models::violation::Violation> {
        let cd_date = cease_desist_delivered_date?;
        if target_interaction.timestamp > cd_date
            && target_interaction.direction == crate::models::interaction::Direction::Incoming
        {
            return Some(crate::models::violation::Violation {
                id: uuid::Uuid::new_v4(),
                interaction_id: target_interaction.id,
                case_id: target_interaction.case_id,
                violation_type: crate::models::violation::FdcpaViolationType::PostCeaseContact,
                statutory_citation: "15 U.S.C. § 1692c(c)".to_string(),
                statutory_penalty_cap: 1000.0,
                actual_damages: 0.0,
                factual_summary: format!(
                    "Post-Cease and Desist collection outreach: incoming communication on {} following verified delivery of formal Cease and Desist notice on {}.",
                    target_interaction.timestamp.format("%Y-%m-%d"),
                    cd_date.format("%Y-%m-%d")
                ),
                evidence_references: vec!["Cease and Desist Mail Confirmation".to_string()],
            });
        }
        None
    }

    /// Composite violation evaluation evaluating an interaction across all statutory rules
    pub fn evaluate_all_violations(
        target_interaction: &crate::models::interaction::Interaction,
        history: &[crate::models::interaction::Interaction],
        dvl_delivered_date: Option<chrono::DateTime<Utc>>,
        verification_provided_date: Option<chrono::DateTime<Utc>>,
        cease_desist_delivered_date: Option<chrono::DateTime<Utc>>,
        debtor_tz_offset_hours: i32,
    ) -> Vec<crate::models::violation::Violation> {
        let mut violations = Vec::new();

        if let Some(v) = Self::check_inconvenient_time_violation(target_interaction, debtor_tz_offset_hours) {
            violations.push(v);
        }
        if let Some(v) = Self::check_call_frequency_violation(target_interaction, history) {
            violations.push(v);
        }
        if let Some(v) = Self::check_validation_stay_violation(
            target_interaction,
            dvl_delivered_date,
            verification_provided_date,
        ) {
            violations.push(v);
        }
        if let Some(v) = Self::check_cease_and_desist_violation(
            target_interaction,
            cease_desist_delivered_date,
        ) {
            violations.push(v);
        }

        violations
    }

    /// Calculate aggregate potential statutory damages under 15 U.S.C. § 1692k
    /// Up to $1,000 per proceeding for statutory damages, plus accumulated actual damages
    pub fn calculate_potential_damages(violation_count: usize, actual_damages: f64) -> f64 {
        if violation_count == 0 {
            actual_damages
        } else {
            let statutory_base = violation_count as f64 * 1000.0;
            statutory_base + actual_damages
        }
    }

    /// Summarize reactive statutory damages ledger for a case from SQLite records
    pub fn summarize_damages(
        case_id: &str,
        violations: &[crate::models::violation::Violation],
    ) -> StatutoryDamagesSummary {
        let violation_count = violations.len();
        let total_statutory_damages: f64 = violations.iter().map(|v| v.statutory_penalty_cap).sum();
        let total_actual_damages: f64 = violations.iter().map(|v| v.actual_damages).sum();
        let grand_total_damages = total_statutory_damages + total_actual_damages;

        StatutoryDamagesSummary {
            case_id: case_id.to_string(),
            violation_count,
            total_statutory_damages,
            total_actual_damages,
            grand_total_damages,
            violations: violations.to_vec(),
        }
    }
}

/// Reactive summary ledger of statutory damages under 15 U.S.C. § 1692k
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct StatutoryDamagesSummary {
    pub case_id: String,
    pub violation_count: usize,
    pub total_statutory_damages: f64,
    pub total_actual_damages: f64,
    pub grand_total_damages: f64,
    pub violations: Vec<crate::models::violation::Violation>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_standard_validation_deadline() {
        // Notice on Wednesday, May 6, 2026 -> +30 days = Friday, June 5, 2026 (Business Day)
        let notice = NaiveDate::from_ymd_opt(2026, 5, 6).unwrap();
        let window = FdcpaEngine::calculate_validation_window(notice, Some(notice));

        assert_eq!(window.raw_30_day_deadline, "2026-06-05");
        assert_eq!(window.adjusted_deadline, "2026-06-05");
        assert!(!window.is_extended);
        assert_eq!(window.days_remaining, 30);
        assert!(!window.is_expired);
    }

    #[test]
    fn test_weekend_rollover() {
        // Notice on Thursday, May 7, 2026 -> +30 days = Saturday, June 6, 2026 (Weekend)
        // Must roll to Monday, June 8, 2026
        let notice = NaiveDate::from_ymd_opt(2026, 5, 7).unwrap();
        let window = FdcpaEngine::calculate_validation_window(notice, Some(notice));

        assert_eq!(window.raw_30_day_deadline, "2026-06-06");
        assert_eq!(window.adjusted_deadline, "2026-06-08");
        assert!(window.is_extended);
        assert!(window.extension_reason.unwrap().contains("Weekend"));
        assert_eq!(window.days_remaining, 32);
    }

    #[test]
    fn test_federal_holiday_rollover_memorial_day() {
        // Notice on Friday, April 24, 2026 -> +30 days = Sunday, May 24, 2026 (Weekend)
        // Monday, May 25, 2026 is Memorial Day (Federal Holiday)
        // Must roll through Sunday AND Monday to Tuesday, May 26, 2026
        let notice = NaiveDate::from_ymd_opt(2026, 4, 24).unwrap();
        let window = FdcpaEngine::calculate_validation_window(notice, Some(notice));

        assert_eq!(window.raw_30_day_deadline, "2026-05-24");
        assert_eq!(window.adjusted_deadline, "2026-05-26");
        assert!(window.is_extended);
        let reason = window.extension_reason.unwrap();
        assert!(reason.contains("Memorial Day"));
        assert_eq!(window.days_remaining, 32);
    }

    #[test]
    fn test_leap_year_february_calculation() {
        // 2024 is a leap year (Feb 29 exists)
        // Notice on Feb 1, 2024 -> +30 days = Saturday, March 2, 2024 -> rolls to Monday, March 4, 2024
        let notice_leap = NaiveDate::from_ymd_opt(2024, 2, 1).unwrap();
        let window_leap = FdcpaEngine::calculate_validation_window(notice_leap, Some(notice_leap));
        assert_eq!(window_leap.raw_30_day_deadline, "2024-03-02");
        assert_eq!(window_leap.adjusted_deadline, "2024-03-04");

        // 2025 is NOT a leap year (Feb 28 days)
        // Notice on Feb 1, 2025 -> +30 days = Monday, March 3, 2025
        let notice_non_leap = NaiveDate::from_ymd_opt(2025, 2, 1).unwrap();
        let window_non_leap = FdcpaEngine::calculate_validation_window(notice_non_leap, Some(notice_non_leap));
        assert_eq!(window_non_leap.raw_30_day_deadline, "2025-03-03");
        assert_eq!(window_non_leap.adjusted_deadline, "2025-03-03");
    }

    #[test]
    fn test_expired_window_flagging() {
        // Notice on Jan 1, 2026. Evaluating from March 1, 2026 -> Expired
        let notice = NaiveDate::from_ymd_opt(2026, 1, 1).unwrap();
        let eval_date = NaiveDate::from_ymd_opt(2026, 3, 1).unwrap();
        let window = FdcpaEngine::calculate_validation_window(notice, Some(eval_date));

        assert!(window.is_expired);
        assert!(window.days_remaining < 0);
        assert_eq!(window.business_days_remaining, 0);
    }

    #[test]
    fn test_inconvenient_hours() {
        assert!(FdcpaEngine::is_inconvenient_hour(7));  // 7 AM is prohibited
        assert!(!FdcpaEngine::is_inconvenient_hour(8)); // 8 AM is allowed
        assert!(!FdcpaEngine::is_inconvenient_hour(20)); // 8 PM is allowed
        assert!(FdcpaEngine::is_inconvenient_hour(21)); // 9 PM is prohibited
        assert!(FdcpaEngine::is_inconvenient_hour(23)); // 11 PM is prohibited
    }

    #[test]
    fn test_inconvenient_time_rule_violation() {
        let case_id = uuid::Uuid::new_v4();
        // 02:00 UTC with -5 timezone offset (EST) -> 21:00 (9:00 PM) -> Inconvenient!
        let interaction = crate::models::interaction::Interaction {
            id: uuid::Uuid::new_v4(),
            case_id,
            creditor_id: None,
            timestamp: chrono::DateTime::parse_from_rfc3339("2026-05-10T02:30:00Z").unwrap().with_timezone(&Utc),
            channel: crate::models::interaction::Channel::Phone,
            direction: crate::models::interaction::Direction::Incoming,
            contact_name: "Apex Coll".to_string(),
            contact_phone: None,
            duration_seconds: 60,
            summary_notes: "Late night collection call".to_string(),
            audio_recording_path: None,
            recorded_flag: false,
        };

        let violation = FdcpaEngine::check_inconvenient_time_violation(&interaction, -5);
        assert!(violation.is_some());
        let v = violation.unwrap();
        assert_eq!(v.violation_type, crate::models::violation::FdcpaViolationType::InconvenientTime);
        assert_eq!(v.statutory_citation, "15 U.S.C. § 1692c(a)(1)");
    }

    #[test]
    fn test_call_frequency_rule_7_in_7() {
        let case_id = uuid::Uuid::new_v4();
        let base_time = chrono::DateTime::parse_from_rfc3339("2026-05-10T14:00:00Z").unwrap().with_timezone(&Utc);

        let mut history = Vec::new();
        // Create 7 prior phone calls within 5 days
        for day in 1..=7 {
            history.push(crate::models::interaction::Interaction {
                id: uuid::Uuid::new_v4(),
                case_id,
                creditor_id: None,
                timestamp: base_time - Duration::days(day),
                channel: crate::models::interaction::Channel::Phone,
                direction: crate::models::interaction::Direction::Incoming,
                contact_name: "Collector".to_string(),
                contact_phone: None,
                duration_seconds: 45,
                summary_notes: format!("Prior call day {}", day),
                audio_recording_path: None,
                recorded_flag: false,
            });
        }

        // 8th call on base_time -> Exceeds CFPB 7-in-7 threshold!
        let eighth_call = crate::models::interaction::Interaction {
            id: uuid::Uuid::new_v4(),
            case_id,
            creditor_id: None,
            timestamp: base_time,
            channel: crate::models::interaction::Channel::Phone,
            direction: crate::models::interaction::Direction::Incoming,
            contact_name: "Collector".to_string(),
            contact_phone: None,
            duration_seconds: 45,
            summary_notes: "8th call within 7 days".to_string(),
            audio_recording_path: None,
            recorded_flag: false,
        };

        let violation = FdcpaEngine::check_call_frequency_violation(&eighth_call, &history);
        assert!(violation.is_some());
        let v = violation.unwrap();
        assert_eq!(v.violation_type, crate::models::violation::FdcpaViolationType::ContinuousHarassment);
        assert!(v.statutory_citation.contains("12 C.F.R. § 1006.14(b)"));
    }

    #[test]
    fn test_validation_stay_rule() {
        let case_id = uuid::Uuid::new_v4();
        let dvl_delivered = chrono::DateTime::parse_from_rfc3339("2026-05-01T10:00:00Z").unwrap().with_timezone(&Utc);

        // Incoming call 5 days after DVL delivered, no verification provided
        let call_during_stay = crate::models::interaction::Interaction {
            id: uuid::Uuid::new_v4(),
            case_id,
            creditor_id: None,
            timestamp: dvl_delivered + Duration::days(5),
            channel: crate::models::interaction::Channel::Phone,
            direction: crate::models::interaction::Direction::Incoming,
            contact_name: "Collector".to_string(),
            contact_phone: None,
            duration_seconds: 120,
            summary_notes: "Demand during validation stay".to_string(),
            audio_recording_path: None,
            recorded_flag: false,
        };

        let violation = FdcpaEngine::check_validation_stay_violation(&call_during_stay, Some(dvl_delivered), None);
        assert!(violation.is_some());
        let v = violation.unwrap();
        assert_eq!(v.violation_type, crate::models::violation::FdcpaViolationType::CollectionDuringValidation);
        assert_eq!(v.statutory_citation, "15 U.S.C. § 1692g(b)");
    }

    #[test]
    fn test_cease_and_desist_rule() {
        let case_id = uuid::Uuid::new_v4();
        let cd_delivered = chrono::DateTime::parse_from_rfc3339("2026-05-01T10:00:00Z").unwrap().with_timezone(&Utc);

        let call_after_cd = crate::models::interaction::Interaction {
            id: uuid::Uuid::new_v4(),
            case_id,
            creditor_id: None,
            timestamp: cd_delivered + Duration::days(2),
            channel: crate::models::interaction::Channel::Phone,
            direction: crate::models::interaction::Direction::Incoming,
            contact_name: "Collector".to_string(),
            contact_phone: None,
            duration_seconds: 30,
            summary_notes: "Call after formal C&D".to_string(),
            audio_recording_path: None,
            recorded_flag: false,
        };

        let violation = FdcpaEngine::check_cease_and_desist_violation(&call_after_cd, Some(cd_delivered));
        assert!(violation.is_some());
        let v = violation.unwrap();
        assert_eq!(v.violation_type, crate::models::violation::FdcpaViolationType::PostCeaseContact);
        assert_eq!(v.statutory_citation, "15 U.S.C. § 1692c(c)");
    }

    #[test]
    fn test_statutory_damages_ledger_aggregation() {
        let case_id = uuid::Uuid::new_v4();
        let violations = vec![
            crate::models::violation::Violation {
                id: uuid::Uuid::new_v4(),
                interaction_id: uuid::Uuid::new_v4(),
                case_id,
                violation_type: crate::models::violation::FdcpaViolationType::InconvenientTime,
                statutory_citation: "15 U.S.C. § 1692c(a)(1)".to_string(),
                statutory_penalty_cap: 1000.0,
                actual_damages: 250.0,
                factual_summary: "Call at 22:00".to_string(),
                evidence_references: vec![],
            },
            crate::models::violation::Violation {
                id: uuid::Uuid::new_v4(),
                interaction_id: uuid::Uuid::new_v4(),
                case_id,
                violation_type: crate::models::violation::FdcpaViolationType::ContinuousHarassment,
                statutory_citation: "15 U.S.C. § 1692d(5)".to_string(),
                statutory_penalty_cap: 1000.0,
                actual_damages: 100.0,
                factual_summary: "9 calls in 7 days".to_string(),
                evidence_references: vec![],
            },
        ];

        let summary = FdcpaEngine::summarize_damages(&case_id.to_string(), &violations);
        assert_eq!(summary.violation_count, 2);
        assert_eq!(summary.total_statutory_damages, 2000.0);
        assert_eq!(summary.total_actual_damages, 350.0);
        assert_eq!(summary.grand_total_damages, 2350.0);
    }
}

