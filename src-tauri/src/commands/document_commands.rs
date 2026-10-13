use crate::engine::TemplateEngine;
use std::collections::HashMap;
use tauri::command;

#[command]
pub async fn generate_dispute_document(
    doc_type: String,
    tokens: HashMap<String, String>,
) -> Result<String, String> {
    let template = match doc_type.as_str() {
        "dvl" => TemplateEngine::dvl_template(),
        _ => TemplateEngine::dvl_template(),
    };

    let token_refs: HashMap<&str, &str> = tokens
        .iter()
        .map(|(k, v)| (k.as_str(), v.as_str()))
        .collect();

    Ok(TemplateEngine::interpolate(template, &token_refs))
}
