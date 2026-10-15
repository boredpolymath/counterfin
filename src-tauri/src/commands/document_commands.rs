use crate::engine::TemplateEngine;
use crate::error::AppResult;
use std::collections::HashMap;
use tauri::command;

#[command]
pub async fn generate_dispute_document(
    doc_type: String,
    tokens: HashMap<String, String>,
    escape_html: Option<bool>,
) -> AppResult<String> {
    let template = match doc_type.as_str() {
        "medical_dvl" => TemplateEngine::medical_dvl_template(),
        "credit_card_dvl" => TemplateEngine::credit_card_dvl_template(),
        "auto_dvl" | "auto_deficiency_dvl" => TemplateEngine::auto_deficiency_dvl_template(),
        "cease_desist" | "limited_cease_and_desist" => TemplateEngine::limited_cease_and_desist_template(),
        "cra_dispute" => TemplateEngine::cra_dispute_template(),
        "cfpb_complaint" => TemplateEngine::cfpb_complaint_template(),
        "pay_for_delete" => TemplateEngine::pay_for_delete_template(),
        _ => TemplateEngine::dvl_template(),
    };


    let token_refs: HashMap<&str, &str> = tokens
        .iter()
        .map(|(k, v)| (k.as_str(), v.as_str()))
        .collect();

    if escape_html.unwrap_or(false) {
        Ok(TemplateEngine::interpolate_escaped(
            template,
            &token_refs,
            Some("[NOT PROVIDED]"),
        ))
    } else {
        Ok(TemplateEngine::interpolate_with_fallback(
            template,
            &token_refs,
            "[NOT PROVIDED]",
        ))
    }
}

#[command]
pub async fn validate_template_tokens(
    doc_type: String,
    tokens: HashMap<String, String>,
) -> AppResult<Vec<String>> {
    let template = match doc_type.as_str() {
        "medical_dvl" => TemplateEngine::medical_dvl_template(),
        "credit_card_dvl" => TemplateEngine::credit_card_dvl_template(),
        "auto_dvl" | "auto_deficiency_dvl" => TemplateEngine::auto_deficiency_dvl_template(),
        "cease_desist" | "limited_cease_and_desist" => TemplateEngine::limited_cease_and_desist_template(),
        "cra_dispute" => TemplateEngine::cra_dispute_template(),
        "cfpb_complaint" => TemplateEngine::cfpb_complaint_template(),
        "pay_for_delete" => TemplateEngine::pay_for_delete_template(),
        _ => TemplateEngine::dvl_template(),
    };

    let token_refs: HashMap<&str, &str> = tokens
        .iter()
        .map(|(k, v)| (k.as_str(), v.as_str()))
        .collect();

    let required = TemplateEngine::extract_tokens(template);
    let mut missing = Vec::new();
    for key in required {
        match token_refs.get(key.as_str()) {
            Some(val) if !val.trim().is_empty() => {}
            _ => missing.push(key),
        }
    }
    Ok(missing)
}

#[command]
pub async fn export_document_file(
    docket_number: String,
    title: String,
    content: String,
    format: String,
) -> AppResult<String> {
    let base_dir = crate::engine::vault::EvidenceVault::resolve_os_sandbox_dir();
    let sandbox = crate::engine::vault::EvidenceVault::build_sandbox_paths(&base_dir);
    let export_format = match format.to_lowercase().as_str() {
        "pdf" => crate::engine::templates::ExportFormat::Pdf,
        "md" | "markdown" => crate::engine::templates::ExportFormat::Markdown,
        _ => crate::engine::templates::ExportFormat::Txt,
    };
    let path = crate::engine::templates::DocumentExporter::export_to_sandbox(
        &sandbox,
        &docket_number,
        &title,
        &content,
        export_format,
    )?;
    Ok(path.to_string_lossy().to_string())
}

