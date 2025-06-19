#!/bin/bash
# Quick UKB CLI Test
set -euo pipefail

cd "/Users/q284340/Agentic/coding"

echo "=== Testing UKB CLI Basic Functionality ==="

# Test 1: Help command
echo "1. Testing help command..."
if node ./bin/ukb-cli.js --help > /dev/null 2>&1; then
    echo "✅ Help command works"
else
    echo "❌ Help command failed"
    exit 1
fi

# Test 2: Status command
echo "2. Testing status command..."
if node ./bin/ukb-cli.js status > /dev/null 2>&1; then
    echo "✅ Status command works"
else
    echo "❌ Status command failed"
    exit 1
fi

# Test 3: List entities
echo "3. Testing entity list..."
if node ./bin/ukb-cli.js entity list > /dev/null 2>&1; then
    echo "✅ Entity list works"
else
    echo "❌ Entity list failed"
    exit 1
fi

# Test 4: Original UKB list entities
echo "4. Testing original UKB list entities..."
if ./knowledge-management/ukb --list-entities > /dev/null 2>&1; then
    echo "✅ Original UKB list entities works"
else
    echo "❌ Original UKB list entities failed"
    exit 1
fi

echo ""
echo "🎉 All basic tests passed! UKB CLI is working correctly."
echo "Ready to proceed with migration."