#!/bin/bash

# WMACS Guardian Synchronization Script
# Syncs the master WMACS implementation to all project repositories

set -e

MASTER_DIR="/Users/cory/Documents/Cloudy-Work/shared/wmacs-guardian-system"
PROJECTS=(
    "/Users/cory/Documents/Cloudy-Work/applications/jw-attendant-scheduler"
    "/Users/cory/Documents/Cloudy-Work/applications/ldc-construction-tools"
)

echo "🔄 WMACS Guardian Synchronization Starting..."
echo "Master Directory: $MASTER_DIR"

# Verify master directory exists
if [ ! -d "$MASTER_DIR" ]; then
    echo "❌ Master WMACS directory not found: $MASTER_DIR"
    exit 1
fi

# Sync to each project
for project in "${PROJECTS[@]}"; do
    if [ -d "$project" ]; then
        echo ""
        echo "📦 Syncing to: $(basename "$project")"
        
        # Create wmacs directory if it doesn't exist
        mkdir -p "$project/wmacs"
        
        # Sync all WMACS files
        echo "   Copying all WMACS files..."
        find "$MASTER_DIR" -name "wmacs-*.js" -exec cp {} "$project/wmacs/" \;
        find "$MASTER_DIR" -name "wmacs-*.sh" -exec cp {} "$project/wmacs/" \;
        
        # Copy documentation
        echo "   Copying documentation..."
        cp "$MASTER_DIR/README.md" "$project/wmacs/"
        cp "$MASTER_DIR/WINDSURF_OPERATIONAL_GUIDELINES.md" "$project/wmacs/"
        
        # Copy templates
        echo "   Copying configuration templates..."
        mkdir -p "$project/wmacs/templates"
        cp -r "$MASTER_DIR/templates/"* "$project/wmacs/templates/"
        
        # Create project-specific config if it doesn't exist
        if [ ! -f "$project/wmacs-config.js" ]; then
            echo "   Creating project-specific configuration..."
            cp "$MASTER_DIR/templates/wmacs-config-template.js" "$project/wmacs-config.js"
            
            # Customize for project
            project_name=$(basename "$project")
            sed -i '' "s/your-project-name/$project_name/g" "$project/wmacs-config.js"
            
            if [[ "$project_name" == *"jw-attendant"* ]]; then
                sed -i '' 's/your-project-name/jw-attendant-scheduler/g' "$project/wmacs-config.js"
                sed -i '' 's/nextjs|django|fastapi|other/django/g' "$project/wmacs-config.js"
                sed -i '' 's/10.92.3.23/10.92.3.22/g' "$project/wmacs-config.js"
                sed -i '' 's/10.92.3.25/10.92.3.24/g' "$project/wmacs-config.js"
                sed -i '' 's/"133"/"132"/g' "$project/wmacs-config.js"
            elif [[ "$project_name" == *"ldc"* ]]; then
                sed -i '' 's/your-project-name/ldc-construction-tools/g' "$project/wmacs-config.js"
                sed -i '' 's/nextjs|django|fastapi|other/nextjs/g' "$project/wmacs-config.js"
            fi
        fi
        
        echo "   ✅ Sync completed for $(basename "$project")"
    else
        echo "   ⚠️  Project directory not found: $project"
    fi
done

echo ""
echo "🎯 WMACS Guardian Synchronization Complete!"
echo ""
echo "Next steps:"
echo "1. Review project-specific configurations in each project's wmacs-config.js"
echo "2. Test WMACS Guardian in each environment"
echo "3. Commit the synchronized files to each project repository"
echo ""
echo "Usage in projects:"
echo "  node wmacs/wmacs-guardian.js start [container]"
echo "  node wmacs/wmacs-research-advisor.js analyze \"suggestion\""
echo "  node wmacs/wmacs-auto-advisor.js monitor \"text\""
