use serde::{Serialize, Serializer};
use thiserror::Error;

/// Structured error propagation pattern avoiding panic crashes across IPC boundaries
#[derive(Error, Debug, Clone, PartialEq, Eq)]
pub enum AppError {
    #[error("Database error: {0}")]
    Database(String),

    #[error("Entity not found: {0}")]
    NotFound(String),

    #[error("Validation error: {0}")]
    Validation(String),

    #[error("Invalid state transition: from {current} to {attempted}")]
    InvalidStateTransition { current: String, attempted: String },

    #[error("Cryptographic or I/O error: {0}")]
    Io(String),

    #[error("Statutory calculation error: {0}")]
    Calculation(String),

    #[error("Internal system error: {0}")]
    Internal(String),

    #[error("Security or cryptographic verification error: {0}")]
    Security(String),

    #[error("Serialization error: {0}")]
    Serialization(String),
}

impl From<rusqlite::Error> for AppError {
    fn from(err: rusqlite::Error) -> Self {
        AppError::Database(err.to_string())
    }
}

impl From<std::io::Error> for AppError {
    fn from(err: std::io::Error) -> Self {
        AppError::Io(err.to_string())
    }
}

impl Serialize for AppError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        use serde::ser::SerializeStruct;
        let mut state = serializer.serialize_struct("AppError", 3)?;
        let code = match self {
            AppError::Database(_) => "DATABASE_ERROR",
            AppError::NotFound(_) => "NOT_FOUND",
            AppError::Validation(_) => "VALIDATION_ERROR",
            AppError::InvalidStateTransition { .. } => "INVALID_STATE_TRANSITION",
            AppError::Io(_) => "IO_ERROR",
            AppError::Calculation(_) => "CALCULATION_ERROR",
            AppError::Internal(_) => "INTERNAL_ERROR",
            AppError::Security(_) => "SECURITY_ERROR",
            AppError::Serialization(_) => "SERIALIZATION_ERROR",
        };
        state.serialize_field("code", code)?;
        state.serialize_field("message", &self.to_string())?;
        state.serialize_field("details", &format!("{:?}", self))?;
        state.end()
    }
}

pub type AppResult<T> = Result<T, AppError>;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_error_serialization() {
        let err = AppError::NotFound("Case SM-2026-0001 not found".to_string());
        let json = serde_json::to_string(&err).expect("Failed to serialize AppError");
        assert!(json.contains("NOT_FOUND"));
        assert!(json.contains("SM-2026-0001"));
    }

    #[test]
    fn test_invalid_state_transition_serialization() {
        let err = AppError::InvalidStateTransition {
            current: "InitialNotice".to_string(),
            attempted: "DebtSettled".to_string(),
        };
        let json = serde_json::to_string(&err).expect("Failed to serialize");
        assert!(json.contains("INVALID_STATE_TRANSITION"));
    }
}
