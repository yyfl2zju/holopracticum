$ErrorActionPreference = "Stop"

$serviceRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$runtimeRoot = Join-Path (Split-Path $serviceRoot -Parent) "runtime\node-v20.20.1-win-x64"
$npmCmd = Join-Path $runtimeRoot "npm.cmd"

if (-not (Test-Path $npmCmd)) {
  throw "Portable Node runtime is missing. Download and extract Node 20.20.1 to local-services\\runtime first."
}

Push-Location $serviceRoot

try {
  $env:PATH = "$runtimeRoot;$env:PATH"
  & $npmCmd install
}
finally {
  Pop-Location
}
