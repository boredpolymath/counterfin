use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum Channel {
    Phone,
    Mail,
    Email,
    Sms,
    InPerson,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum Direction {
    Incoming,
    Outgoing,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Interaction {
    pub id: Uuid,
    pub case_id: Uuid,
    pub creditor_id: Option<Uuid>,
    pub timestamp: DateTime<Utc>,
    pub channel: Channel,
    pub direction: Direction,
    pub contact_name: String,
    pub contact_phone: Option<String>,
    pub duration_seconds: u32,
    pub summary_notes: String,
    pub audio_recording_path: Option<String>,
    pub recorded_flag: bool,
}
