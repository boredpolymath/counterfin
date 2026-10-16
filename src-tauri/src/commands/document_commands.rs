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
        "cease_desist" | "limited_cease_and_desist" => {
            TemplateEngine::limited_cease_and_desist_template()
        }
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
        "cease_desist" | "limited_cease_and_desist" => {
            TemplateEngine::limited_cease_and_desist_template()
        }
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

fn resolve_downloads_dir() -> Option<std::path::PathBuf> {
    #[cfg(target_os = "windows")]
    {
        if let Ok(profile) = std::env::var("USERPROFILE") {
            let p = std::path::PathBuf::from(profile).join("Downloads");
            if p.exists() {
                return Some(p);
            }
        }
    }
    #[cfg(not(target_os = "windows"))]
    {
        if let Ok(home) = std::env::var("HOME") {
            let p = std::path::PathBuf::from(home).join("Downloads");
            if p.exists() {
                return Some(p);
            }
        }
    }
    None
}

fn open_in_system_viewer(path: &std::path::Path) {
    #[cfg(target_os = "macos")]
    {
        let _ = std::process::Command::new("open").arg(path).spawn();
    }
    #[cfg(target_os = "windows")]
    {
        let _ = std::process::Command::new("cmd")
            .args(["/C", "start", "", path.to_str().unwrap_or("")])
            .spawn();
    }
    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    {
        let _ = std::process::Command::new("xdg-open").arg(path).spawn();
    }
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

    // Deliver directly to the user's Downloads directory for immediate visibility
    let final_path = if let Some(downloads_dir) = resolve_downloads_dir() {
        if let Some(file_name) = path.file_name() {
            let dest = downloads_dir.join(file_name);
            if std::fs::copy(&path, &dest).is_ok() {
                dest
            } else {
                path
            }
        } else {
            path
        }
    } else {
        path
    };

    // Open file in default system application (Preview, Adobe Reader, TextEdit, Notepad)
    open_in_system_viewer(&final_path);

    Ok(final_path.to_string_lossy().to_string())
}

