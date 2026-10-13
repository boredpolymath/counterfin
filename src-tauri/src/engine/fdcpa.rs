use chrono::{Duration, NaiveDate};

/// FDCPA Statutory Engine pursuant to 15 U.S.C. § 1692 et seq.
pub struct FdcpaEngine;

impl FdcpaEngine {
    /// Calculate the mandatory 30-day validation expiration date pursuant to 15 U.S.C. § 1692g
    pub fn calculate_validation_deadline(initial_notice_date: NaiveDate) -> NaiveDate {
        initial_notice_date + Duration::days(30)
    }

    /// Check if a contact timestamp violates the convenient hours requirement (8:00 AM to 9:00 PM local time)
    /// 15 U.S.C. § 1692c(a)(1)
    pub fn is_inconvenient_hour(hour_local: u32) -> bool {
        hour_local < 8 || hour_local >= 21
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
}
