<#
.SYNOPSIS
    Antigravity Coding CLI
#>

param(
    [string]$Command,
    [string[]]$Args
)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir

function Show-Help {
    Write-Host "Antigravity Coding CLI"
    Write-Host "Usage: coding <command> [args]"
    Write-Host ""
    Write-Host "Commands:"
    Write-Host "  task       View task.md"
    Write-Host "  plan       View implementation_plan.md"
    Write-Host "  dashboard  Launch Health Dashboard"
    Write-Host "  claude     Launch Claude"
    Write-Host "  copilot    Launch Copilot"
}

if ($Command -eq "task") {
    $TaskFile = Get-ChildItem -Path "$env:USERPROFILE\.gemini\antigravity\brain\*\task.md" | Select-Object -First 1
    if ($TaskFile) { Get-Content $TaskFile.FullName }
    else { Write-Warning "No task.md found." }
    exit
}

if ($Command -eq "plan") {
    $PlanFile = Get-ChildItem -Path "$env:USERPROFILE\.gemini\antigravity\brain\*\implementation_plan.md" | Select-Object -First 1
    if ($PlanFile) { Get-Content $PlanFile.FullName }
    else { Write-Warning "No implementation_plan.md found." }
    exit
}

if ($Command -eq "dashboard") {
    Start-Process "http://localhost:3032"
    exit
}

# Default: Detect Agent and Launch
$Agent = node "$RootDir\lib\agent-detector.js" --best
if ($Agent -eq "antigravity") {
    Write-Host "🌌 Antigravity Agent Active" -ForegroundColor Cyan
    # In a real scenario, this would launch the Antigravity shell or loop
    Write-Host "Use 'coding task' or 'coding plan' to interact."
}
elseif ($Agent -eq "claude") {
    Write-Host "Launching Claude..."
    # Call launch-claude script (port to PS1 if needed)
}
else {
    Write-Host "Agent: $Agent"
}
