# Team Knowledge Management Setup

## 🚀 Quick Start for Team Members

### 1. Clone Repository
```bash
git clone git@cc-github.bmwgroup.net:frankwoernle/claude.git ~/Claude
```

### 2. Run Team Setup
```bash
~/Claude/knowledge-management/setup-team-collaboration.sh --member "Your Name" "your.email@company.com"
```

### 3. Start Using
```bash
# Update knowledge graph (master command)
ukb

# Quick commands
ukb --capture     # Capture insights
ukb --view        # View knowledge base  
ukb --sync        # Sync with team
```

## 🎯 Master Command: "Update Knowledge Graph"

Just say **"update knowledge graph"** and run:
```bash
ukb
```

This gives you an interactive menu for all knowledge management operations.

## 📋 Team Workflow

### Daily Usage
1. **Morning**: `ukb --sync` to get latest team insights
2. **During Work**: `ukb --capture` to add discoveries  
3. **End of Day**: `ukb --sync` to share with team

### Knowledge Sharing
- All insights automatically shared via git repository
- Visual knowledge base shows team's collective knowledge
- Each team member contributes to shared understanding
- Cross-machine synchronization via shared Claude repo

### Best Practices
- Always sync before major work sessions
- Capture insights immediately when discovered
- Use descriptive problem/solution descriptions
- Tag insights with relevant project and technology keywords
- Connect new insights to existing entities using `--relates-to`

## 🛠️ Commands Reference

| Command | Description |
|---------|-------------|
| `ukb` | **Master command** - Interactive knowledge management menu |
| `ukb --capture` | Capture new coding insights with validation |
| `ukb --view` | Open visual knowledge base in browser |
| `ukb --sync` | Sync with team repository |
| `ukb --validate` | Validate knowledge graph connections |
| `ukb --fix` | Auto-fix graph issues and isolated entities |
| `ukb --status` | Show system status and health check |
| `ukb --session` | Summarize current coding session |
| `ukb --export` | Export knowledge graph data |
| `ukb --setup` | Setup/reinstall system components |

### Legacy Commands (still available)
| Command | Description |
|---------|-------------|
| `cci-enhanced` | Enhanced capture with relationship validation |
| `cciv` | Capture + immediate validation |
| `vkb` | View visual knowledge base |
| `scs` | Summarize coding session |
| `akf` | Auto-fix knowledge graph |

## 🏗️ System Architecture

### Repository Structure
```
~/Claude/
├── knowledge-management/
│   ├── update-knowledge-graph.sh      # Master command
│   ├── enhanced-capture-insight.sh    # Enhanced capture
│   ├── validate-knowledge-connections.sh
│   ├── auto-fix-knowledge-graph.sh
│   ├── setup-team-collaboration.sh
│   ├── vkb                           # Visual KB launcher
│   └── TEAM_SETUP.md                 # This file
├── .git/                             # Shared team repository
└── README.md
```

### Knowledge Storage
- **MCP Memory Graph**: Primary storage in Claude Code
- **Local Backup**: `~/coding-knowledge-base/`
- **Team Sync**: Via git repository
- **Visual Interface**: Browser-based at `localhost:8080`

### Data Flow
1. **Capture**: Insights → MCP Memory Graph
2. **Validate**: Check entity relationships
3. **Sync**: Share via git repository
4. **Visualize**: Browser interface for exploration

## 🔧 Troubleshooting

### MCP Not Available
If MCP memory system is not available, insights are stored locally and can be imported later when MCP is available.

### Sync Conflicts  
Knowledge management uses append-only operations, so conflicts are rare. If conflicts occur:
```bash
ukb --fix    # Auto-fix graph issues
ukb --sync   # Re-sync with team
```

### Missing Dependencies
```bash
ukb --setup  # Reinstall system components
```

### Aliases Not Working
```bash
source ~/.bash_profile  # Reload shell configuration
ukb --status           # Verify system health
```

### Knowledge Graph Issues
```bash
ukb --validate  # Check graph connectivity
ukb --fix      # Auto-fix isolated entities
```

## 👥 Team Collaboration Features

### Cross-Machine Setup
1. Clone Claude repository on any machine
2. Run setup script with team member details
3. System automatically syncs knowledge across machines
4. Visual knowledge base shows combined team insights

### Shared Knowledge Graph
- All team members contribute to single knowledge graph
- Insights are automatically connected to existing entities
- Visual interface shows relationships and dependencies
- Search and filter by team member, project, or technology

### Workflow Integration
- Git hooks for automatic insight capture
- Session summaries for daily standups
- Export capabilities for documentation
- Integration with development workflow

## 📊 Usage Analytics

The system tracks:
- Knowledge capture frequency
- Graph connectivity health
- Team contribution metrics
- Most valuable insights
- Technology trend analysis

## 🆘 Support

For issues or questions:
1. Check system status: `ukb --status`
2. Run auto-fix: `ukb --fix`
3. Consult this documentation
4. Contact system administrator

## 🔄 Updates

The knowledge management system is continuously improved:
- New features added via repository updates
- Automatic script updates when pulling latest changes
- Backward compatibility maintained
- Team notifications for major updates

---

**💡 Remember**: Just say "update knowledge graph" and run `ukb` for all your knowledge management needs!