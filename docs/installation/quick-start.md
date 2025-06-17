# Quick Start Installation Guide

## Prerequisites

- Git, Node.js, npm, Python 3, and jq installed
- macOS, Linux, or Windows (via WSL/Git Bash)
- Network access for repository cloning

## 30-Second Installation

```bash
# Clone the repository to your preferred location
git clone <repository-url> ~/coding
cd ~/coding

# Run the installer
./install.sh

# Reload your shell
source ~/.bashrc  # or ~/.zshrc on macOS
```

## What Gets Installed

The installation script sets up:

1. **Knowledge Management Tools**
   - `ukb` - Update Knowledge Base command
   - `vkb` - View Knowledge Base command

2. **Memory Visualizer**
   - Web-based knowledge graph visualization
   - Automatically cloned and built

3. **MCP Servers** (optional)
   - Browser automation (Stagehand)
   - Conversation logger

4. **Shell Integration**
   - Global command access from any directory
   - Environment variables

## Platform-Specific Setup

### macOS
```bash
# Install prerequisites (if needed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install git node python3 jq

# Clone and install
git clone <repository-url> ~/coding
cd ~/coding
./install.sh
```

### Linux (Ubuntu/Debian)
```bash
# Install prerequisites
sudo apt update
sudo apt install git nodejs npm python3 jq

# Clone and install
git clone <repository-url> ~/coding
cd ~/coding
./install.sh
```

### Windows (Git Bash/WSL)
```bash
# Using Git Bash or WSL Ubuntu
# Install Node.js from nodejs.org
# Install jq from github.com/stedolan/jq/releases

# Clone and install
git clone <repository-url> ~/coding
cd ~/coding
./install.sh
```

## Team Setup

### First-time Team Setup
```bash
# Team lead sets up the repository
git clone <repository-url> ~/coding
cd ~/coding
./install.sh

# Initialize shared knowledge base
ukb --init

# Commit initial setup
git add shared-memory.json
git commit -m "Initialize team knowledge base"
git push
```

### Team Member Setup
```bash
# Clone existing team repository
git clone <repository-url> ~/coding
cd ~/coding
./install.sh

# Knowledge base is automatically available
vkb  # View existing team knowledge
```

## Verification

Test your installation:

```bash
# Test commands are available
ukb --version
vkb --version

# Test knowledge base
ukb "Problem: Testing installation, Solution: Installation successful"
vkb  # Should open browser to localhost:8080

# Test git integration
git status  # Should show shared-memory.json changes
```

## Next Steps

- **[Network Setup](network-setup.md)** - Configure for corporate networks
- **[MCP Configuration](mcp-configuration.md)** - Set up Claude Code integration
- **[UKB User Guide](../ukb/user-guide.md)** - Learn knowledge management
- **[VSCode Integration](../integrations/vscode-extension.md)** - IDE integration

## Common Issues

### Command not found
```bash
# Reload shell
source ~/.bashrc  # or ~/.zshrc
# Or start new terminal
```

### Permission errors
```bash
# Make scripts executable
chmod +x *.sh
./install.sh
```

### Network issues
See [Network Setup](network-setup.md) for proxy and firewall configuration.