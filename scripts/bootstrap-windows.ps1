#Requires -Version 5.1
<#
  Install Git + Node.js LTS (via winget) when missing, then clone the repository.
  Run in PowerShell (Windows 10/11 with winget — "App Installer" from the Microsoft Store if needed).

  Example:
    Set-Location $HOME\Projects
    powershell -ExecutionPolicy Bypass -File .\scripts\bootstrap-windows.ps1 -RepoUrl "https://github.com/freepeace13/yelp-restaurants-lookup.git"
#>

param(
  [Parameter(Mandatory = $true)]
  [string] $RepoUrl,

  [Parameter(Mandatory = $false)]
  [string] $FolderName = ""
)

$ErrorActionPreference = "Stop"

function Refresh-Path {
  $machine = [System.Environment]::GetEnvironmentVariable("Path", "Machine")
  $user = [System.Environment]::GetEnvironmentVariable("Path", "User")
  $env:Path = "$machine;$user"
}

function Test-Node20 {
  try {
    $v = node -v 2>$null
    if (-not $v) { return $false }
    $major = [int]($v.TrimStart("v").Split(".")[0])
    return $major -ge 20
  } catch {
    return $false
  }
}

if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
  Write-Error "winget was not found. Install 'App Installer' from the Microsoft Store, or install Git and Node from https://git-scm.com and https://nodejs.org , then clone the repo manually."
  exit 1
}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Host "Installing Git (winget)…"
  winget install -e --id Git.Git --accept-package-agreements --accept-source-agreements
  Refresh-Path
}

if (-not (Test-Node20)) {
  Write-Host "Installing Node.js LTS (winget)…"
  winget install -e --id OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
  Refresh-Path
}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Error "Git is still not on PATH. Close this window, open a new PowerShell, and run the script again."
  exit 1
}

if (-not (Test-Node20)) {
  Write-Error "Node.js 20+ is still not on PATH. Close this window, open a new PowerShell, and run the script again."
  exit 1
}

$RepoUrl = $RepoUrl.TrimEnd("/")
if (-not $FolderName) {
  $tail = $RepoUrl.Split("/")[-1]
  $FolderName = $tail -replace "\.git$", ""
}

if (Test-Path -LiteralPath $FolderName) {
  Write-Error "Folder already exists: $FolderName — remove it or use -FolderName for a different name."
  exit 1
}

Write-Host "Cloning into $FolderName …"
git clone $RepoUrl $FolderName

Write-Host ""
Write-Host "Done. Next:"
Write-Host "  cd $FolderName"
Write-Host "  npm run setup"
Write-Host "  (edit server\.env with your Yelp API key)"
Write-Host "  npm run dev"
Write-Host "Then open http://localhost:5173"
