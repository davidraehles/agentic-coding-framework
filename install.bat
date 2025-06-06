@echo off
REM Claude Knowledge Management System - Windows Installation Script
REM For use with Command Prompt or PowerShell on Windows

setlocal enabledelayedexpansion

echo ========================================================
echo Claude Knowledge Management System - Windows Installer
echo ========================================================
echo.

REM Check for Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please download and install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Check for Git
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Git is not installed!
    echo Please download and install Git from https://git-scm.com/downloads
    echo.
    pause
    exit /b 1
)

REM Check for Python
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed!
    echo Please download and install Python from https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation
    echo.
    pause
    exit /b 1
)

echo [OK] All prerequisites found
echo.

REM Set paths
set CLAUDE_REPO=%~dp0
set CLAUDE_REPO=%CLAUDE_REPO:~0,-1%

echo Installing in: %CLAUDE_REPO%
echo.

REM Install memory-visualizer
echo Installing memory-visualizer...
if not exist "%CLAUDE_REPO%\memory-visualizer" (
    git clone https://github.com/modelcontextprotocol/memory-visualizer.git "%CLAUDE_REPO%\memory-visualizer"
    if %errorlevel% neq 0 (
        echo ERROR: Failed to clone memory-visualizer
        pause
        exit /b 1
    )
)

cd /d "%CLAUDE_REPO%\memory-visualizer"
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install memory-visualizer dependencies
    pause
    exit /b 1
)

call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Failed to build memory-visualizer
    pause
    exit /b 1
)

echo [OK] Memory visualizer installed
echo.

REM Install browser-access MCP server
if exist "%CLAUDE_REPO%\browser-access" (
    echo Installing browser-access MCP server...
    cd /d "%CLAUDE_REPO%\browser-access"
    call npm install
    call npm run build
    echo [OK] Browser-access MCP server installed
    echo.
)

REM Install claude-logger MCP server
if exist "%CLAUDE_REPO%\claude-logger-mcp" (
    echo Installing claude-logger MCP server...
    cd /d "%CLAUDE_REPO%\claude-logger-mcp"
    call npm install
    call npm run build
    echo [OK] Claude-logger MCP server installed
    echo.
)

REM Create batch file wrappers
echo Creating command wrappers...
mkdir "%CLAUDE_REPO%\bin" 2>nul

REM Create ukb.bat
echo @echo off > "%CLAUDE_REPO%\bin\ukb.bat"
echo bash "%CLAUDE_REPO%\knowledge-management\ukb" %%* >> "%CLAUDE_REPO%\bin\ukb.bat"

REM Create vkb.bat
echo @echo off > "%CLAUDE_REPO%\bin\vkb.bat"
echo bash "%CLAUDE_REPO%\knowledge-management\vkb" %%* >> "%CLAUDE_REPO%\bin\vkb.bat"

echo [OK] Command wrappers created
echo.

REM Initialize shared memory if needed
if not exist "%CLAUDE_REPO%\shared-memory.json" (
    echo Creating initial shared-memory.json...
    echo { > "%CLAUDE_REPO%\shared-memory.json"
    echo   "entities": [], >> "%CLAUDE_REPO%\shared-memory.json"
    echo   "relations": [], >> "%CLAUDE_REPO%\shared-memory.json"
    echo   "metadata": { >> "%CLAUDE_REPO%\shared-memory.json"
    echo     "version": "1.0.0", >> "%CLAUDE_REPO%\shared-memory.json"
    echo     "created": "%date% %time%", >> "%CLAUDE_REPO%\shared-memory.json"
    echo     "contributors": [], >> "%CLAUDE_REPO%\shared-memory.json"
    echo     "total_entities": 0, >> "%CLAUDE_REPO%\shared-memory.json"
    echo     "total_relations": 0 >> "%CLAUDE_REPO%\shared-memory.json"
    echo   } >> "%CLAUDE_REPO%\shared-memory.json"
    echo } >> "%CLAUDE_REPO%\shared-memory.json"
)

echo.
echo ========================================================
echo Installation completed successfully!
echo ========================================================
echo.
echo IMPORTANT: Add the following to your PATH environment variable:
echo.
echo   %CLAUDE_REPO%\bin
echo.
echo To add to PATH:
echo   1. Press Win+X and select "System"
echo   2. Click "Advanced system settings"
echo   3. Click "Environment Variables"
echo   4. Under "User variables", select "Path" and click "Edit"
echo   5. Click "New" and add: %CLAUDE_REPO%\bin
echo   6. Click "OK" to save
echo.
echo After adding to PATH, you can use:
echo   - ukb (Update Knowledge Base)
echo   - vkb (View Knowledge Base)
echo.
echo For Git Bash users, run: ./install.sh
echo.
pause