#!/bin/bash
# Clean up duplicate PATH entries in shell config files

echo "🧹 Cleaning up duplicate PATH entries..."

# Backup configs
cp ~/.zshrc ~/.zshrc.path-cleanup-backup
if [[ -f ~/.bash_profile ]]; then
    cp ~/.bash_profile ~/.bash_profile.path-cleanup-backup
fi

# Remove all existing Claude/coding PATH entries
sed -i.tmp '/# Claude Knowledge Management System/,/^$/d' ~/.zshrc 2>/dev/null || true
if [[ -f ~/.bash_profile ]]; then
    sed -i.tmp '/# Claude Knowledge Management System/,/^$/d' ~/.bash_profile 2>/dev/null || true
fi

# Add clean configuration to .zshrc
cat >> ~/.zshrc << 'EOF'

# Claude Knowledge Management System
export CODING_REPO="/Users/q284340/Agentic/coding"
export PATH="/Users/q284340/Agentic/coding/bin:$PATH"
EOF

echo "✅ PATH cleanup complete!"
echo "📝 Restart your shell or run: source ~/.zshrc"
echo "🔍 Check with: echo \$PATH | tr ':' '\\n' | grep -c '/Users/q284340/Agentic/coding/bin'"