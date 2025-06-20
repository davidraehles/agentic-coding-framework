#!/bin/bash
# Test script for VKB refactoring

set -euo pipefail

echo "Testing VKB Refactoring"
echo "====================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test function
test_command() {
    local desc="$1"
    local cmd="$2"
    echo -n "Testing: $desc... "
    if eval "$cmd" >/dev/null 2>&1; then
        echo -e "${GREEN}✓${NC}"
        return 0
    else
        echo -e "${RED}✗${NC}"
        echo "  Command: $cmd"
        return 1
    fi
}

# Basic tests
echo "1. Testing vkb-cli availability"
test_command "vkb-cli exists" "[[ -f ../bin/vkb-cli.js ]]"
test_command "vkb-cli is executable" "[[ -x ../bin/vkb-cli.js ]]"

echo -e "\n2. Testing vkb-cli commands"
test_command "vkb-cli help" "../bin/vkb-cli.js --help"
test_command "vkb-cli server help" "../bin/vkb-cli.js server --help"

echo -e "\n3. Testing new vkb wrapper"
test_command "vkb-new exists" "[[ -f ./vkb-new ]]"
test_command "vkb-new is executable" "[[ -x ./vkb-new ]]"
test_command "vkb-new help" "./vkb-new help"

echo -e "\n4. Testing server status (should not be running)"
./vkb-new status || true

echo -e "\n5. Comparing output formats"
echo -e "${YELLOW}Old vkb help:${NC}"
./vkb help | head -20

echo -e "\n${YELLOW}New vkb help:${NC}"
./vkb-new help

echo -e "\n${GREEN}✓ Basic tests completed${NC}"
echo "Note: Server start/stop tests require manual verification"