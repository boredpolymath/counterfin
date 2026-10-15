use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum DeadlineType {
    /// 30-day statutory window under 15 U.S.C. 1692g
    Fdcpa30DayValidation,
    /// Response window for Credit Bureau dispute (30 days under FCRA § 611)
    Fcra30DayCraResponse,
    /// State-specific debt collection Statute of Limitations
    StatuteOfLimitations,
    /// Collector response deadline specified in Demand Letter
    DemandLetterExpiration,
    /// Custom follow-up task
    CustomTask,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Deadline {
    pub id: Uuid,
    pub case_id: Uuid,
    pub deadline_type: DeadlineType,
    pub title: String,
    pub target_date: DateTime<Utc>,
    pub completed: bool,
    pub reminder_days_prior: Vec<u32>, // e.g. [7, 3, 1]
    pub notes: String,
}
