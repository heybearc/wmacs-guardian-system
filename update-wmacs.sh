#!/bin/bash

# WMACS Guardian Update & Synchronization Workflow
# Handles updates from any source and propagates to all repositories

set -e

MASTER_DIR="/Users/cory/Documents/Cloudy-Work/shared/wmacs-guardian-system"
SCRIPTS_DIR="/Users/cory/Documents/Cloudy-Work/scripts"
PROJECTS=(
    "/Users/cory/Documents/Cloudy-Work/applications/jw-attendant-scheduler"
    "/Users/cory/Documents/Cloudy-Work/applications/ldc-construction-tools"
)

echo "🔄 WMACS Guardian Update & Synchronization Workflow"
echo "=================================================="

# Function to show usage
show_usage() {
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  import-from-scripts    Import new WMACS files from scripts directory"
    echo "  import-from-project    Import updates from a specific project"
    echo "  sync-to-all           Synchronize master to all projects"
    echo "  update-version        Update version and create git tag"
    echo "  full-update           Complete update workflow (import + sync + version)"
    echo ""
    echo "Options:"
    echo "  --project-path PATH   Specify project path for import-from-project"
    echo "  --version VERSION     Specify version for update-version"
    echo "  --message MESSAGE     Commit message for updates"
    echo ""
    echo "Examples:"
    echo "  $0 import-from-scripts"
    echo "  $0 sync-to-all"
    echo "  $0 full-update --version v1.2.0 --message 'Add port guardian functionality'"
}

# Function to import from scripts directory
import_from_scripts() {
    echo "📥 Importing WMACS files from scripts directory..."
    
    if [ ! -d "$SCRIPTS_DIR" ]; then
        echo "❌ Scripts directory not found: $SCRIPTS_DIR"
        return 1
    fi
    
    # Find all WMACS-related files in scripts
    wmacs_files=$(find "$SCRIPTS_DIR" -name "*wmacs*" -type f)
    
    if [ -z "$wmacs_files" ]; then
        echo "ℹ️  No WMACS files found in scripts directory"
        return 0
    fi
    
    echo "Found WMACS files:"
    echo "$wmacs_files"
    echo ""
    
    # Copy each file to master repository
    while IFS= read -r file; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            echo "📋 Processing: $filename"
            
            # Determine destination based on file type
            if [[ "$filename" == *"guardian"* ]]; then
                dest="$MASTER_DIR/$filename"
            elif [[ "$filename" == *"config"* ]]; then
                dest="$MASTER_DIR/config/$filename"
            else
                dest="$MASTER_DIR/$filename"
            fi
            
            # Create directory if needed
            mkdir -p "$(dirname "$dest")"
            
            # Copy file
            cp "$file" "$dest"
            echo "  ✅ Copied to: $(basename "$dest")"
        fi
    done <<< "$wmacs_files"
    
    echo "📥 Import from scripts completed"
}

# Function to import from specific project
import_from_project() {
    local project_path="$1"
    
    if [ -z "$project_path" ]; then
        echo "❌ Project path required for import-from-project"
        return 1
    fi
    
    echo "📥 Importing WMACS updates from: $(basename "$project_path")"
    
    if [ ! -d "$project_path" ]; then
        echo "❌ Project directory not found: $project_path"
        return 1
    fi
    
    # Import from wmacs directory
    if [ -d "$project_path/wmacs" ]; then
        echo "📋 Importing from wmacs directory..."
        rsync -av --exclude='.git' "$project_path/wmacs/" "$MASTER_DIR/"
    fi
    
    # Import project-specific WMACS files
    wmacs_files=$(find "$project_path" -maxdepth 1 -name "*wmacs*" -type f)
    if [ -n "$wmacs_files" ]; then
        echo "📋 Importing project-level WMACS files..."
        while IFS= read -r file; do
            filename=$(basename "$file")
            cp "$file" "$MASTER_DIR/$filename"
            echo "  ✅ Imported: $filename"
        done <<< "$wmacs_files"
    fi
    
    echo "📥 Import from project completed"
}

# Function to sync to all projects
sync_to_all() {
    echo "🔄 Synchronizing master to all projects..."
    
    # Use existing sync script
    if [ -f "$MASTER_DIR/sync-wmacs.sh" ]; then
        cd "$MASTER_DIR"
        ./sync-wmacs.sh
    else
        echo "❌ sync-wmacs.sh not found"
        return 1
    fi
    
    echo "🔄 Synchronization completed"
}

# Function to update version
update_version() {
    local version="$1"
    local message="$2"
    
    if [ -z "$version" ]; then
        # Auto-generate version based on current tags
        cd "$MASTER_DIR"
        last_tag=$(git describe --tags --abbrev=0 2>/dev/null || echo "v1.0.0")
        
        # Extract version numbers
        if [[ $last_tag =~ v([0-9]+)\.([0-9]+)\.([0-9]+) ]]; then
            major=${BASH_REMATCH[1]}
            minor=${BASH_REMATCH[2]}
            patch=${BASH_REMATCH[3]}
            
            # Increment patch version
            patch=$((patch + 1))
            version="v$major.$minor.$patch"
        else
            version="v1.1.1"
        fi
    fi
    
    if [ -z "$message" ]; then
        message="Update WMACS Guardian system to $version"
    fi
    
    echo "📝 Updating version to: $version"
    
    cd "$MASTER_DIR"
    
    # Add all changes
    git add .
    
    # Check if there are changes to commit
    if git diff --staged --quiet; then
        echo "ℹ️  No changes to commit"
    else
        # Commit changes
        git commit -m "$message"
        echo "✅ Changes committed"
    fi
    
    # Create tag
    git tag "$version"
    echo "🏷️  Tagged as: $version"
    
    echo "📝 Version update completed"
}

# Function to run health check
run_health_check() {
    echo "🏥 Running health check..."
    
    if [ -f "$MASTER_DIR/health-check.sh" ]; then
        cd "$MASTER_DIR"
        ./health-check.sh
    else
        echo "❌ health-check.sh not found"
        return 1
    fi
}

# Function for full update workflow
full_update() {
    local version="$1"
    local message="$2"
    
    echo "🚀 Starting full WMACS update workflow..."
    echo ""
    
    # Step 1: Import from scripts
    import_from_scripts
    echo ""
    
    # Step 2: Sync to all projects
    sync_to_all
    echo ""
    
    # Step 3: Update version
    update_version "$version" "$message"
    echo ""
    
    # Step 4: Health check
    run_health_check
    echo ""
    
    echo "🎯 Full update workflow completed!"
    echo ""
    echo "Summary:"
    echo "- Imported latest WMACS files from scripts"
    echo "- Synchronized to all projects"
    echo "- Updated version and created git tag"
    echo "- Validated system health"
    echo ""
    echo "Next steps:"
    echo "1. Test WMACS functionality in each project"
    echo "2. Commit synchronized files in project repositories"
    echo "3. Deploy updated systems to staging/production"
}

# Parse command line arguments
COMMAND=""
PROJECT_PATH=""
VERSION=""
MESSAGE=""

while [[ $# -gt 0 ]]; do
    case $1 in
        import-from-scripts|import-from-project|sync-to-all|update-version|full-update|health-check)
            COMMAND="$1"
            shift
            ;;
        --project-path)
            PROJECT_PATH="$2"
            shift 2
            ;;
        --version)
            VERSION="$2"
            shift 2
            ;;
        --message)
            MESSAGE="$2"
            shift 2
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            echo "❌ Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Execute command
case $COMMAND in
    import-from-scripts)
        import_from_scripts
        ;;
    import-from-project)
        import_from_project "$PROJECT_PATH"
        ;;
    sync-to-all)
        sync_to_all
        ;;
    update-version)
        update_version "$VERSION" "$MESSAGE"
        ;;
    full-update)
        full_update "$VERSION" "$MESSAGE"
        ;;
    health-check)
        run_health_check
        ;;
    "")
        echo "❌ No command specified"
        show_usage
        exit 1
        ;;
    *)
        echo "❌ Unknown command: $COMMAND"
        show_usage
        exit 1
        ;;
esac
