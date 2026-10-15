#!/usr/bin/env bash
# ==============================================================================
# SettleMint: Automated GitHub Actions Code Signing Secrets Setup
# Automatically base64-encodes certificates and uploads all required secrets
# to your GitHub repository using the GitHub CLI (`gh`).
# ==============================================================================

set -euo pipefail

REPO="boredpolymath/settlemint"

echo "=================================================================="
echo "  SettleMint: Automated Code Signing Secrets Setup for GitHub CI"
echo "  Target Repository: $REPO"
echo "=================================================================="

# 1. Verify GitHub CLI
if ! command -v gh &> /dev/null; then
  echo "Error: GitHub CLI ('gh') is not installed. Please install it with: brew install gh"
  exit 1
fi

if ! gh auth status &> /dev/null; then
  echo "Error: You are not logged in to GitHub CLI. Please run: gh auth login"
  exit 1
fi

echo "✓ GitHub CLI authenticated."
echo ""

# 2. macOS Code Signing Setup
read -r -p "Do you want to configure macOS Signing & Notarization secrets? (y/N): " SETUP_MAC
if [[ "$SETUP_MAC" =~ ^[Yy]$ ]]; then
  echo ""
  echo "--- macOS Signing Configuration ---"

  # Path to .p12 certificate
  read -r -p "Enter path to your exported Apple .p12 certificate file: " P12_PATH
  P12_PATH="${P12_PATH/#\~/$HOME}" # Expand tilde if present

  if [[ ! -f "$P12_PATH" ]]; then
    echo "Error: File '$P12_PATH' not found."
    exit 1
  fi

  # Base64 encode and upload APPLE_CERTIFICATE
  echo "-> Encoding and uploading APPLE_CERTIFICATE..."
  base64 -i "$P12_PATH" | tr -d '\n' | gh secret set APPLE_CERTIFICATE -R "$REPO"
  echo "✓ APPLE_CERTIFICATE uploaded."

  # Password for .p12
  read -r -s -p "Enter password for the .p12 certificate: " P12_PASS
  echo ""
  echo "$P12_PASS" | gh secret set APPLE_CERTIFICATE_PASSWORD -R "$REPO"
  echo "✓ APPLE_CERTIFICATE_PASSWORD uploaded."

  # Signing Identity
  echo ""
  echo "Example identity: Developer ID Application: John Doe (ABC123XYZ0)"
  read -r -p "Enter your APPLE_SIGNING_IDENTITY: " SIGNING_IDENTITY
  echo "$SIGNING_IDENTITY" | gh secret set APPLE_SIGNING_IDENTITY -R "$REPO"
  echo "✓ APPLE_SIGNING_IDENTITY uploaded."

  # Apple ID email
  read -r -p "Enter your Apple ID email (APPLE_ID): " APPLE_ID
  echo "$APPLE_ID" | gh secret set APPLE_ID -R "$REPO"
  echo "✓ APPLE_ID uploaded."

  # App-Specific Password
  echo "Generate this at: https://appleid.apple.com (Sign-in and Security > App-Specific Passwords)"
  read -r -s -p "Enter your App-Specific Password (APPLE_PASSWORD): " APPLE_PASS
  echo ""
  echo "$APPLE_PASS" | gh secret set APPLE_PASSWORD -R "$REPO"
  echo "✓ APPLE_PASSWORD uploaded."

  # Apple Team ID
  echo "Found in Apple Developer Center (top right under your name / 10 alphanumeric characters)"
  read -r -p "Enter your 10-character Apple Team ID (APPLE_TEAM_ID): " TEAM_ID
  echo "$TEAM_ID" | gh secret set APPLE_TEAM_ID -R "$REPO"
  echo "✓ APPLE_TEAM_ID uploaded."
fi

# 3. Windows Code Signing Setup
echo ""
read -r -p "Do you want to configure Windows Authenticode Signing secrets? (y/N): " SETUP_WIN
if [[ "$SETUP_WIN" =~ ^[Yy]$ ]]; then
  echo ""
  echo "--- Windows Signing Configuration ---"

  read -r -p "Enter path to your Windows Authenticode .pfx certificate file: " PFX_PATH
  PFX_PATH="${PFX_PATH/#\~/$HOME}"

  if [[ ! -f "$PFX_PATH" ]]; then
    echo "Error: File '$PFX_PATH' not found."
    exit 1
  fi

  echo "-> Encoding and uploading WINDOWS_CERTIFICATE..."
  base64 -i "$PFX_PATH" | tr -d '\n' | gh secret set WINDOWS_CERTIFICATE -R "$REPO"
  echo "✓ WINDOWS_CERTIFICATE uploaded."

  read -r -s -p "Enter password for the .pfx certificate: " PFX_PASS
  echo ""
  echo "$PFX_PASS" | gh secret set WINDOWS_CERTIFICATE_PASSWORD -R "$REPO"
  echo "✓ WINDOWS_CERTIFICATE_PASSWORD uploaded."
fi

echo ""
echo "=================================================================="
echo "  Active Secrets for $REPO:"
echo "=================================================================="
gh secret list -R "$REPO"

echo ""
echo "🎉 Secrets configuration complete! Next release build will automatically sign and notarize."
