#!/bin/bash
# Test script for enhanced knowledge base system

set -euo pipefail

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}🧪 Testing Enhanced Knowledge Base System${NC}"
echo -e "${CYAN}=========================================${NC}"
echo ""

# Test 1: Migration
echo -e "${YELLOW}Test 1: Entity Migration${NC}"
echo "Running migration on existing entities..."
node knowledge-management/scripts/migrate-entities.js
echo -e "${GREEN}✅ Migration test complete${NC}"
echo ""

# Test 2: Pattern Verification
echo -e "${YELLOW}Test 2: Pattern Verification${NC}"
echo "Checking pattern compliance..."
./knowledge-management/scripts/verify-patterns.sh
echo -e "${GREEN}✅ Pattern verification test complete${NC}"
echo ""

# Test 3: Enhanced Sync
echo -e "${YELLOW}Test 3: Enhanced Knowledge Sync${NC}"
echo "Running enhanced sync preparation..."
./scripts/sync-shared-knowledge-enhanced.sh
echo -e "${GREEN}✅ Enhanced sync test complete${NC}"
echo ""

# Test 4: Check generated files
echo -e "${YELLOW}Test 4: Verify Generated Files${NC}"
echo "Checking .mcp-sync directory contents..."
ls -la .mcp-sync/
echo ""

if [[ -f ".mcp-sync/sync-required.json" ]]; then
    echo "sync-required.json contents:"
    jq '.' .mcp-sync/sync-required.json
fi
echo ""

if [[ -f ".mcp-sync/pattern-check.json" ]]; then
    echo "pattern-check.json contents:"
    jq '.' .mcp-sync/pattern-check.json
fi
echo ""

echo -e "${GREEN}✅ All tests complete!${NC}"
echo ""
echo -e "${BLUE}📊 Summary:${NC}"
echo "  • Entity migration script created"
echo "  • Pattern verification tool ready"
echo "  • Enhanced sync with pattern checking"
echo "  • Structured observation support"
echo "  • Code snippet extraction in ukb"
echo ""
echo -e "${CYAN}🚀 The enhanced knowledge base system is ready to use!${NC}"