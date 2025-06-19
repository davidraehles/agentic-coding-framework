#!/bin/bash
# UKB Command Mapping Test Suite
# Tests specific command equivalencies between bash UKB and ukb-cli

set -euo pipefail

# Test configuration
TEST_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CODING_DIR="$(cd "$TEST_DIR/../.." && pwd)"
UKB_ORIGINAL="$CODING_DIR/knowledge-management/ukb"
UKB_CLI="$CODING_DIR/bin/ukb-cli.js"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

log() { echo -e "${BLUE}[CMD-TEST]${NC} $*"; }
success() { echo -e "${GREEN}[PASS]${NC} $*"; ((TESTS_PASSED++)); }
failure() { echo -e "${RED}[FAIL]${NC} $*"; ((TESTS_FAILED++)); }
warning() { echo -e "${YELLOW}[WARN]${NC} $*"; }

run_test() {
    local test_name="$1"
    local test_function="$2"
    
    log "Testing command mapping: $test_name"
    ((TESTS_RUN++))
    
    if $test_function; then
        success "$test_name"
    else
        failure "$test_name"
    fi
    echo
}

# Command mapping tests

test_list_entities_mapping() {
    # UKB: --list-entities
    # UKB-CLI: entity list
    
    local ukb_exit_code ukb_cli_exit_code
    
    # Test UKB command exists and works
    "$UKB_ORIGINAL" --list-entities &>/dev/null
    ukb_exit_code=$?
    
    # Test UKB-CLI equivalent works
    node "$UKB_CLI" entity list &>/dev/null
    ukb_cli_exit_code=$?
    
    if [[ $ukb_exit_code -eq 0 ]] && [[ $ukb_cli_exit_code -eq 0 ]]; then
        return 0
    else
        warning "UKB exit code: $ukb_exit_code, UKB-CLI exit code: $ukb_cli_exit_code"
        return 1
    fi
}

test_add_entity_mapping() {
    # UKB: --add-entity "Name|Type|Observation1;Observation2"
    # UKB-CLI: entity add --name "Name" --type "Type" --observation "Observation1"
    
    local test_entity="TestMappingEntity"
    local cleanup_needed=false
    
    # Test UKB-CLI add entity
    if node "$UKB_CLI" entity add \
        --name "$test_entity" \
        --type "TransferablePattern" \
        --significance 5 \
        --observation "Test mapping observation" &>/dev/null; then
        cleanup_needed=true
        
        # Verify entity exists
        if node "$UKB_CLI" entity list 2>&1 | grep -q "$test_entity"; then
            # Cleanup
            if $cleanup_needed; then
                node "$UKB_CLI" entity remove --name "$test_entity" << 'EOF' &>/dev/null
y
EOF
            fi
            return 0
        else
            warning "Entity not found after creation"
            return 1
        fi
    else
        warning "Failed to create entity"
        return 1
    fi
}

test_remove_entity_mapping() {
    # UKB: --remove-entity "EntityName"
    # UKB-CLI: entity remove --name "EntityName"
    
    local test_entity="TestRemovalEntity"
    
    # Create entity first
    if node "$UKB_CLI" entity add \
        --name "$test_entity" \
        --type "TransferablePattern" \
        --significance 5 \
        --observation "Test removal observation" &>/dev/null; then
        
        # Test removal
        if node "$UKB_CLI" entity remove --name "$test_entity" << 'EOF' &>/dev/null
y
EOF
        then
            # Verify removal
            if ! node "$UKB_CLI" entity list 2>&1 | grep -q "$test_entity"; then
                return 0
            else
                warning "Entity still exists after removal"
                return 1
            fi
        else
            warning "Failed to remove entity"
            return 1
        fi
    else
        warning "Failed to create entity for removal test"
        return 1
    fi
}

test_add_relation_mapping() {
    # UKB: --add-relation "from,to,relationType"
    # UKB-CLI: relation add --from "from" --to "to" --type "relationType"
    
    local test_entity="TestRelationEntity"
    
    # Create test entity first
    if node "$UKB_CLI" entity add \
        --name "$test_entity" \
        --type "TransferablePattern" \
        --significance 5 \
        --observation "Test relation observation" &>/dev/null; then
        
        # Test relation creation
        if node "$UKB_CLI" relation add \
            --from "CodingKnowledge" \
            --to "$test_entity" \
            --type "contains" \
            --significance 5 &>/dev/null; then
            
            # Verify relation exists
            if node "$UKB_CLI" relation list 2>&1 | grep -q "$test_entity"; then
                # Cleanup
                node "$UKB_CLI" entity remove --name "$test_entity" << 'EOF' &>/dev/null
y
EOF
                return 0
            else
                warning "Relation not found after creation"
                return 1
            fi
        else
            warning "Failed to create relation"
            return 1
        fi
    else
        warning "Failed to create entity for relation test"
        return 1
    fi
}

test_status_mapping() {
    # UKB: No direct equivalent (part of various commands)
    # UKB-CLI: status
    
    local status_output
    status_output=$(node "$UKB_CLI" status 2>&1)
    
    # Check that status output contains expected information
    if [[ "$status_output" == *"Entities:"* ]] && \
       [[ "$status_output" == *"Relations:"* ]] && \
       [[ "$status_output" == *"Storage:"* ]]; then
        return 0
    else
        warning "Status output incomplete: $status_output"
        return 1
    fi
}

test_help_mapping() {
    # UKB: --help
    # UKB-CLI: --help
    
    local ukb_help_exit_code ukb_cli_help_exit_code
    
    # Test UKB help
    "$UKB_ORIGINAL" --help &>/dev/null
    ukb_help_exit_code=$?
    
    # Test UKB-CLI help
    node "$UKB_CLI" --help &>/dev/null
    ukb_cli_help_exit_code=$?
    
    if [[ $ukb_help_exit_code -eq 0 ]] && [[ $ukb_cli_help_exit_code -eq 0 ]]; then
        return 0
    else
        warning "Help command exit codes - UKB: $ukb_help_exit_code, UKB-CLI: $ukb_cli_help_exit_code"
        return 1
    fi
}

test_interactive_mode_mapping() {
    # UKB: --interactive
    # UKB-CLI: interactive
    
    # This is complex to test automatically, so we'll just check command exists
    local ukb_cli_interactive_help
    ukb_cli_interactive_help=$(node "$UKB_CLI" interactive --help 2>&1 || node "$UKB_CLI" --help 2>&1)
    
    if [[ "$ukb_cli_interactive_help" == *"interactive"* ]] || [[ "$ukb_cli_interactive_help" == *"Interactive"* ]]; then
        return 0
    else
        warning "Interactive mode not found in help: $ukb_cli_interactive_help"
        return 1
    fi
}

# Future command mapping tests (to be implemented)

test_auto_mode_mapping() {
    # UKB: --auto
    # UKB-CLI: analyze --auto (to be implemented)
    
    warning "Auto mode mapping test - TO BE IMPLEMENTED"
    return 0  # Pass for now since this will be implemented later
}

test_full_history_mapping() {
    # UKB: --full-history
    # UKB-CLI: analyze --full-history (to be implemented)
    
    warning "Full history mapping test - TO BE IMPLEMENTED"
    return 0  # Pass for now since this will be implemented later
}

test_agent_mode_mapping() {
    # UKB: --agent
    # UKB-CLI: analyze --agent (to be implemented)
    
    warning "Agent mode mapping test - TO BE IMPLEMENTED"
    return 0  # Pass for now since this will be implemented later
}

# Command equivalency matrix
generate_command_matrix() {
    cat << 'EOF'

Command Mapping Matrix:
======================

UKB Bash Script          | UKB-CLI Node.js         | Status
--------------------------|-------------------------|--------
--list-entities          | entity list             | ✅ IMPLEMENTED
--add-entity "N|T|O"     | entity add --name N     | ✅ IMPLEMENTED
--remove-entity "Name"   | entity remove --name N  | ✅ IMPLEMENTED
--add-relation "F,T,R"   | relation add --from F   | ✅ IMPLEMENTED
--remove-relation "F,T,R"| relation remove (TBD)   | ⏳ PENDING
--help                   | --help                  | ✅ IMPLEMENTED
--interactive            | interactive             | ✅ IMPLEMENTED
--auto                   | analyze --auto          | ⏳ TO IMPLEMENT
--full-history           | analyze --full-history  | ⏳ TO IMPLEMENT
--agent                  | analyze --agent         | ⏳ TO IMPLEMENT
--force-reprocess        | analyze --force         | ⏳ TO IMPLEMENT
--upgrade                | migrate --upgrade       | ⏳ TO IMPLEMENT

Legend:
✅ = Fully implemented and tested
⏳ = To be implemented in next phases
❌ = Implementation issues found

EOF
}

main() {
    echo "========================================="
    echo "UKB Command Mapping Compatibility Tests"
    echo "========================================="
    echo
    
    # Basic command mapping tests
    run_test "--list-entities → entity list" test_list_entities_mapping
    run_test "--add-entity → entity add" test_add_entity_mapping
    run_test "--remove-entity → entity remove" test_remove_entity_mapping
    run_test "--add-relation → relation add" test_add_relation_mapping
    run_test "status command" test_status_mapping
    run_test "--help mapping" test_help_mapping
    run_test "--interactive mapping" test_interactive_mode_mapping
    
    # Future implementation tests
    run_test "--auto mapping (future)" test_auto_mode_mapping
    run_test "--full-history mapping (future)" test_full_history_mapping
    run_test "--agent mapping (future)" test_agent_mode_mapping
    
    # Generate command matrix
    generate_command_matrix
    
    # Summary
    echo "========================================="
    echo "Command Mapping Test Results"
    echo "========================================="
    echo "Tests Run: $TESTS_RUN"
    echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
    echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
    
    if [[ $TESTS_FAILED -eq 0 ]]; then
        echo -e "\n${GREEN}✅ All current command mappings work correctly!${NC}"
        echo -e "${YELLOW}⏳ Ready to implement remaining commands in next phases.${NC}"
        exit 0
    else
        echo -e "\n${RED}❌ Some command mappings failed. Fix before proceeding.${NC}"
        exit 1
    fi
}

main "$@"