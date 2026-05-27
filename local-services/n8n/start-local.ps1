$ErrorActionPreference = "Stop"

$serviceRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$runtimeRoot = Join-Path (Split-Path $serviceRoot -Parent) "runtime\node-v20.20.1-win-x64"
$n8nBin = Join-Path $serviceRoot "node_modules\.bin\n8n.cmd"

if (-not (Test-Path $n8nBin)) {
  throw "n8n is not installed yet. Run 'npm install' in local-services\\n8n first."
}

if (Test-Path $runtimeRoot) {
  $env:PATH = "$runtimeRoot;$env:PATH"
}

$env:N8N_USER_FOLDER = Join-Path $serviceRoot ".n8n"
$env:N8N_HOST = "localhost"
$env:N8N_PORT = "5678"
$env:N8N_PROTOCOL = "http"
$env:N8N_EDITOR_BASE_URL = "http://localhost:5678"
$env:N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS = "false"
$env:N8N_DIAGNOSTICS_ENABLED = "false"
$env:N8N_PERSONALIZATION_ENABLED = "false"
$env:N8N_CONTENT_SECURITY_POLICY = '{"frame-ancestors":["http://localhost:3000","http://127.0.0.1:3000","http://localhost:3001","http://127.0.0.1:3001"]}'

Write-Host ""
Write-Host "Starting local n8n on http://localhost:5678" -ForegroundColor Cyan
Write-Host "Data folder: $env:N8N_USER_FOLDER" -ForegroundColor DarkGray
Write-Host ""

& $n8nBin start
