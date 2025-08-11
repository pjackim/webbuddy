$ErrorActionPreference = 'Stop'
$LogFile = Join-Path $PSScriptRoot 'dev_live_output.log'
$MaxLines = 250

# Add common bun install dirs to PATH if present
$candidates = @(
    "$env:LOCALAPPDATA\\bun\\bin",
    "$env:USERPROFILE\\.bun\\bin"
) | Where-Object { Test-Path $_ }
foreach ($c in $candidates) {
    if (-not (($env:PATH -split ';') -contains $c)) { $env:PATH = "$c;$env:PATH" }
}

if (-not (Get-Command bun -ErrorAction SilentlyContinue)) {
    Write-Error 'bun command not found. Install from https://bun.sh'
    exit 127
}

if (Test-Path $LogFile) { Remove-Item $LogFile -Force }

Write-Host 'Starting bun dev...'

& bun run dev 2>&1 | ForEach-Object {
    $line = $_
    Write-Host $line
    Add-Content -Path $LogFile -Value $line
    # Trim to last $MaxLines efficiently
    $temp = Get-Content -Path $LogFile -Tail $MaxLines
    Set-Content -Path $LogFile -Value $temp
}

$exit = $LASTEXITCODE
Write-Host "bun dev exited with code $exit"
exit $exit
