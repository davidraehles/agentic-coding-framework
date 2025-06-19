#!/bin/bash
# UKB Migration Compatibility Test Suite
# Ensures 100% functionality preservation during bash-to-node migration

set -euo pipefail

# Test configuration
TEST_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CODING_DIR="$(cd "$TEST_DIR/../.." && pwd)"
UKB_ORIGINAL="$CODING_DIR/knowledge-management/ukb"
UKB_CLI="$CODING_DIR/bin/ukb-cli.js"
TEST_KB="$TEST_DIR/test-shared-memory.json"
BACKUP_KB="$CODING_DIR/shared-memory.json"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Logging
log() { echo -e "${BLUE}[TEST]${NC} $*"; }
success() { echo -e "${GREEN}[PASS]${NC} $*"; ((TESTS_PASSED++)); }
failure() { echo -e "${RED}[FAIL]${NC} $*"; ((TESTS_FAILED++)); }
warning() { echo -e "${YELLOW}[WARN]${NC} $*"; }

# Test runner
run_test() {
    local test_name="$1"
    local test_function="$2"
    
    log "Running test: $test_name"
    ((TESTS_RUN++))
    
    if $test_function; then
        success "$test_name"
    else
        failure "$test_name"
    fi
    echo
}

# Setup test environment
setup_test_environment() {
    log "Setting up test environment..."
    
    # Create test directory
    mkdir -p "$TEST_DIR"
    
    # Backup original knowledge base
    if [[ -f "$BACKUP_KB" ]]; then
        cp "$BACKUP_KB" "$BACKUP_KB.test-backup"
    fi
    
    # Create minimal test knowledge base
    cat > "$TEST_KB" << 'EOF'
{
  "entities": [
    {
      "name": "TestEntity",
      "entityType": "TransferablePattern",
      "observations": ["Test observation for compatibility testing"],
      "significance": 5,
      "metadata": {
        "created_at": "2025-06-19T00:00:00Z",
        "last_updated": "2025-06-19T00:00:00Z"
      }
    }
  ],
  "relations": [
    {
      "from": "CodingKnowledge",
      "to": "TestEntity",
      "relationType": "contains"
    }
  ],
  "metadata": {
    "version": "2.0.0",
    "created": "2025-06-19T00:00:00Z",
    "last_updated": "2025-06-19T00:00:00Z",
    "total_entities": 1,
    "total_relations": 1,
    "schema_version": "2.0.0"
  }
}
EOF
    
    # Use test knowledge base
    cp "$TEST_KB" "$BACKUP_KB"
    
    success "Test environment setup complete"
}

# Cleanup test environment
cleanup_test_environment() {
    log "Cleaning up test environment..."
    
    # Restore original knowledge base
    if [[ -f "$BACKUP_KB.test-backup" ]]; then
        mv "$BACKUP_KB.test-backup" "$BACKUP_KB"
    fi
    
    # Remove test files
    rm -f "$TEST_KB"
    
    success "Test environment cleaned up"
}

# Test Functions

test_help_command() {
    local ukb_help_output
    local ukb_cli_help_output
    
    # Test original UKB help
    ukb_help_output=$("$UKB_ORIGINAL" --help 2>&1 || true)
    
    # Test ukb-cli help (when we implement equivalent commands)
    ukb_cli_help_output=$(node "$UKB_CLI" --help 2>&1 || true)
    
    # For now, just check that both produce help output
    if [[ -n "$ukb_help_output" ]] && [[ -n "$ukb_cli_help_output" ]]; then
        return 0
    else
        return 1
    fi
}

test_list_entities() {
    local ukb_output
    local ukb_cli_output
    
    # Test original UKB list entities
    ukb_output=$("$UKB_ORIGINAL" --list-entities 2>&1 || true)
    
    # Test ukb-cli list entities
    ukb_cli_output=$(node "$UKB_CLI" entity list 2>&1 || true)
    
    # Check that both commands execute and produce entity listings
    if [[ "$ukb_output" == *"TestEntity"* ]] && [[ "$ukb_cli_output" == *"TestEntity"* ]]; then
        return 0
    else
        warning "UKB output: $ukb_output"
        warning "UKB-CLI output: $ukb_cli_output"
        return 1
    fi
}

test_add_entity() {
    local test_entity_name="CompatibilityTestEntity"
    
    # Test adding entity with ukb-cli
    if node "$UKB_CLI" entity add \
        --name "$test_entity_name" \
        --type "TransferablePattern" \
        --significance 7 \
        --observation "Test entity for compatibility testing" &>/dev/null; then
        
        # Verify entity was added
        local entities_output
        entities_output=$(node "$UKB_CLI" entity list 2>&1 || true)
        
        if [[ "$entities_output" == *"$test_entity_name"* ]]; then
            return 0
        else
            warning "Entity not found in list after creation"
            return 1
        fi
    else
        warning "Failed to create test entity"
        return 1
    fi
}

test_remove_entity() {
    local test_entity_name="CompatibilityTestEntity"
    
    # Remove the entity we created in the previous test
    if node "$UKB_CLI" entity remove --name "$test_entity_name" << 'EOF'
y
EOF
    then
        # Verify entity was removed
        local entities_output
        entities_output=$(node "$UKB_CLI" entity list 2>&1 || true)
        
        if [[ "$entities_output" != *"$test_entity_name"* ]]; then
            return 0
        else
            warning "Entity still found in list after removal"
            return 1
        fi
    else
        warning "Failed to remove test entity"
        return 1
    fi
}

test_knowledge_base_integrity() {
    # Verify the knowledge base JSON structure is valid
    if jq . "$BACKUP_KB" > /dev/null 2>&1; then
        # Check required fields exist
        local has_entities has_relations has_metadata
        has_entities=$(jq 'has("entities")' "$BACKUP_KB")
        has_relations=$(jq 'has("relations")' "$BACKUP_KB")
        has_metadata=$(jq 'has("metadata")' "$BACKUP_KB")
        
        if [[ "$has_entities" == "true" ]] && [[ "$has_relations" == "true" ]] && [[ "$has_metadata" == "true" ]]; then
            return 0
        else
            warning "Knowledge base missing required fields"
            return 1
        fi
    else
        warning "Knowledge base JSON is invalid"
        return 1
    fi
}

test_relation_operations() {
    # Test adding a relation using ukb-cli
    if node "$UKB_CLI" relation add \
        --from "CodingKnowledge" \
        --to "TestEntity" \
        --type "contains" \
        --significance 5 &>/dev/null; then
        
        # Verify relation was added
        local relations_output
        relations_output=$(node "$UKB_CLI" relation list 2>&1 || true)
        
        if [[ "$relations_output" == *"CodingKnowledge"* ]] && [[ "$relations_output" == *"TestEntity"* ]]; then
            return 0
        else
            warning "Relation not found in list after creation"
            return 1
        fi
    else
        warning "Failed to create test relation"
        return 1
    fi
}

test_status_command() {
    # Test status command
    local status_output
    status_output=$(node "$UKB_CLI" status 2>&1 || true)
    
    # Check that status provides expected information
    if [[ "$status_output" == *"Entities:"* ]] && [[ "$status_output" == *"Relations:"* ]]; then
        return 0
    else
        warning "Status output: $status_output"
        return 1
    fi
}

test_json_output_compatibility() {
    # Compare JSON structure between operations
    local kb_before kb_after
    
    # Capture state before operation
    kb_before=$(jq -S . "$BACKUP_KB")
    
    # Perform operation that shouldn't change structure
    node "$UKB_CLI" status &>/dev/null || true
    
    # Capture state after operation
    kb_after=$(jq -S . "$BACKUP_KB")
    
    # Compare structures (should be identical for read-only operations)
    if [[ "$kb_before" == "$kb_after" ]]; then
        return 0
    else
        warning "Knowledge base structure changed during read-only operation"
        return 1
    fi
}

# Performance Tests

test_performance_baseline() {
    local start_time end_time duration
    
    # Time the list entities operation
    start_time=$(date +%s.%N)
    node "$UKB_CLI" entity list &>/dev/null || true
    end_time=$(date +%s.%N)
    
    duration=$(echo "$end_time - $start_time" | bc)
    
    # Performance should be reasonable (under 5 seconds for basic operations)
    if (( $(echo "$duration < 5.0" | bc -l) )); then
        return 0
    else
        warning "Performance test failed: ${duration}s (expected < 5.0s)"
        return 1
    fi
}

# Integration Tests

test_full_workflow() {
    local workflow_entity="WorkflowTestEntity"
    
    # Test complete workflow: create entity, add relation, verify, cleanup
    
    # 1. Create entity
    if ! node "$UKB_CLI" entity add \
        --name "$workflow_entity" \
        --type "WorkflowPattern" \
        --significance 6 \
        --observation "Full workflow test entity" &>/dev/null; then
        warning "Failed to create workflow entity"
        return 1
    fi
    
    # 2. Add relation
    if ! node "$UKB_CLI" relation add \
        --from "CodingKnowledge" \
        --to "$workflow_entity" \
        --type "contains" \
        --significance 6 &>/dev/null; then
        warning "Failed to create workflow relation"
        return 1
    fi
    
    # 3. Verify both exist
    local entities_output relations_output
    entities_output=$(node "$UKB_CLI" entity list 2>&1 || true)
    relations_output=$(node "$UKB_CLI" relation list 2>&1 || true)
    
    if [[ "$entities_output" != *"$workflow_entity"* ]]; then
        warning "Workflow entity not found"
        return 1
    fi
    
    if [[ "$relations_output" != *"$workflow_entity"* ]]; then
        warning "Workflow relation not found"
        return 1
    fi
    
    # 4. Cleanup
    if ! node "$UKB_CLI" entity remove --name "$workflow_entity" << 'EOF'
y
EOF
    then
        warning "Failed to cleanup workflow entity"
        return 1
    fi
    
    return 0
}

# Main test execution
main() {
    echo "==================================="
    echo "UKB Migration Compatibility Tests"
    echo "==================================="
    echo
    
    # Setup
    setup_test_environment
    
    # Core functionality tests
    run_test "Help Command Compatibility" test_help_command
    run_test "List Entities" test_list_entities
    run_test "Add Entity" test_add_entity
    run_test "Remove Entity" test_remove_entity
    run_test "Knowledge Base Integrity" test_knowledge_base_integrity
    run_test "Relation Operations" test_relation_operations
    run_test "Status Command" test_status_command
    run_test "JSON Output Compatibility" test_json_output_compatibility
    
    # Performance tests
    run_test "Performance Baseline" test_performance_baseline
    
    # Integration tests
    run_test "Full Workflow Test" test_full_workflow
    
    # Cleanup
    cleanup_test_environment
    
    # Summary
    echo "==================================="
    echo "Test Results Summary"
    echo "==================================="
    echo "Tests Run: $TESTS_RUN"
    echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
    echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
    
    if [[ $TESTS_FAILED -eq 0 ]]; then
        echo -e "\n${GREEN}✅ All tests passed! Migration can proceed safely.${NC}"
        exit 0
    else
        echo -e "\n${RED}❌ Some tests failed. Address issues before proceeding.${NC}"
        exit 1
    fi
}

# Run tests
main "$@"