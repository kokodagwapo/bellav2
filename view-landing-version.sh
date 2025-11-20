#!/bin/bash

# View Landing Page Version
# Usage: ./view-landing-version.sh <commit-hash>

if [ -z "$1" ]; then
    echo "❌ Error: Please provide a commit hash"
    echo ""
    echo "Usage: ./view-landing-version.sh <commit-hash>"
    echo ""
    echo "Example: ./view-landing-version.sh 2dafd4f"
    exit 1
fi

COMMIT_HASH=$1

# Check if commit exists
if ! git cat-file -e "$COMMIT_HASH" 2>/dev/null; then
    echo "❌ Error: Commit $COMMIT_HASH not found"
    exit 1
fi

# Check if file exists in that commit
if ! git show "$COMMIT_HASH":components/LandingPage.tsx > /dev/null 2>&1; then
    echo "❌ Error: LandingPage.tsx not found in commit $COMMIT_HASH"
    exit 1
fi

# Show the file
echo "📄 Showing LandingPage.tsx from commit $COMMIT_HASH"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
git show "$COMMIT_HASH":components/LandingPage.tsx



