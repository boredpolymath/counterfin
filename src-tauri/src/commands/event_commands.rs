use crate::error::AppResult;
use crate::events::{EventBus, SystemEvent};
use tauri::{command, AppHandle};

#[command]
pub async fn emit_system_event(event: SystemEvent, app: AppHandle) -> AppResult<()> {
    EventBus::emit(&app, event)
}
