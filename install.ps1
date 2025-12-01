<#
.SYNOPSIS
    Antigravity Coding Tools - Universal Windows Installer
    
.DESCRIPTION
    Installs and configures the Antigravity Coding Tools environment on Windows.
    Handles dependencies, submodules, and environment configuration.

.NOTES
    Version: 2.0.0
    Author: Antigravity
#>

$ErrorActionPreference = "Stop"
$Script:CodingRepo = Split-Path -Parent $MyInvocation.MyCommand.Path
$Script:InstallLog = Join-Path $Script:CodingRepo "install.log"

# --- Logging Functions ---
function Log-Message {
    param([string]$Message, [string]$Level="INFO", [string]$Color="Cyan")
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogEntry = "[$Timestamp] [$Level] $Message"
    Add-Content -Path $Script:InstallLog -Value $LogEntry
    Write-Host "[$Level] $Message" -ForegroundColor $Color
}

function Log-Success { param([string]$Message) Log-Message $Message "SUCCESS" "Green" }
function Log-Warning { param([string]$Message) Log-Message $Message "WARNING" "Yellow" }
function Log-Error { param([string]$Message) Log-Message $Message "ERROR" "Red"; exit 1 }

# --- Dependency Checks ---
function Check-Command {
    param([string]$Name, [string]$InstallHint)
    Write-Host -NoNewline "Checking for $Name... "
    if (Get-Command $Name -ErrorAction SilentlyContinue) {
        Write-Host "Found" -ForegroundColor Green
        return $true
    } else {
        Write-Host "Missing" -ForegroundColor Red
        Log-Warning "$Name is missing. $InstallHint"
        return $false
    }
}

# --- Main Installation Logic ---
Log-Message "Starting Antigravity Coding Tools Installation..."

# 1. Check Dependencies
$MissingDeps = @()
if (-not (Check-Command "git" "Install Git for Windows: https://git-scm.com/download/win")) { $MissingDeps += "git" }
if (-not (Check-Command "node" "Install Node.js: https://nodejs.org/")) { $MissingDeps += "node" }
if (-not (Check-Command "python" "Install Python: https://www.python.org/downloads/")) { $MissingDeps += "python" }
if (-not (Check-Command "uv" "Install uv: 'irm https://astral.sh/uv/install.ps1 | iex'")) { 
    Log-Message "Attempting to auto-install uv..."
    try {
        irm https://astral.sh/uv/install.ps1 | iex
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","User") + ";" + [System.Environment]::GetEnvironmentVariable("Path","Machine")
        if (Get-Command "uv" -ErrorAction SilentlyContinue) { Log-Success "uv installed successfully" }
        else { $MissingDeps += "uv" }
    } catch {
        Log-Warning "Failed to auto-install uv."
        $MissingDeps += "uv"
    }
}

if ($MissingDeps.Count -gt 0) {
    Log-Error "Missing required dependencies: $($MissingDeps -join ', '). Please install them and retry."
}

# 2. Submodule Initialization
Log-Message "Initializing submodules..."
Set-Location $Script:CodingRepo
try {
    git submodule update --init --recursive
    Log-Success "Submodules initialized."
} catch {
    Log-Warning "Failed to initialize submodules. You may need to run 'git submodule update --init --recursive' manually."
}

# 3. Install NPM Dependencies
Log-Message "Installing core NPM dependencies..."
try {
    npm install
    Log-Success "Core dependencies installed."
} catch {
    Log-Error "Failed to install core dependencies."
}

# 4. Install Integration Dependencies
$Integrations = @(
    @{ Path = "integrations/mcp-constraint-monitor"; Name = "Constraint Monitor" },
    @{ Path = "integrations/system-health-dashboard"; Name = "Health Dashboard" }
)

foreach ($Int in $Integrations) {
    $IntPath = Join-Path $Script:CodingRepo $Int.Path
    if (Test-Path $IntPath) {
        Log-Message "Installing dependencies for $($Int.Name)..."
        Push-Location $IntPath
        try {
            npm install
            Log-Success "$($Int.Name) dependencies installed."
        } catch {
            Log-Warning "Failed to install dependencies for $($Int.Name)."
        }
        Pop-Location
    }
}

# 5. Environment Setup
Log-Message "Configuring environment..."
$BinPath = Join-Path $Script:CodingRepo "bin"
$UserPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($UserPath -notlike "*$BinPath*") {
    Log-Message "Adding $BinPath to User Path..."
    [Environment]::SetEnvironmentVariable("Path", "$UserPath;$BinPath", "User")
    Log-Success "Added bin to Path. Please restart your terminal."
} else {
    Log-Message "bin already in Path."
}

Log-Success "Installation Complete! Welcome to Antigravity."
Log-Message "Run 'coding' to start the environment."
