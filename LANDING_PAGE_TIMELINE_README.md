# Landing Page Version Timeline

This directory contains tools to view and restore previous versions of the LandingPage.tsx file using **local git history** (no GitHub required).

## Files

- **`landing-page-timeline.html`** - Interactive timeline viewer (open in browser)
- **`restore-landing-page.js`** - Node.js script to restore a specific version (creates backup)
- **`view-landing-version.sh`** - Shell script to preview a version

## How to Use

### Option 1: View Timeline in Browser (Recommended)

1. Open `landing-page-timeline.html` in your web browser
2. Browse through the version history
3. Click "Preview" to see the file content (command copied to clipboard)
4. Click "Restore" on any version to get the restore command
5. The command will be copied to your clipboard automatically
6. Run the command in your terminal

### Option 2: Use the Restore Script (Creates Backup)

```bash
# Restore a specific version (creates backup automatically)
node restore-landing-page.js <commit-hash>

# Example: Restore the version with sun and clouds (Hero component)
node restore-landing-page.js 2dafd4f
```

### Option 3: Preview a Version

```bash
# View file content from a specific commit
./view-landing-version.sh <commit-hash>

# Or use git directly
git show <commit-hash>:components/LandingPage.tsx
```

### Option 4: Use Git Directly (No Backup)

```bash
# Restore from a specific commit (no backup created)
git checkout <commit-hash> -- components/LandingPage.tsx

# Example
git checkout 2dafd4f -- components/LandingPage.tsx
```

## Key Versions

- **`2dafd4f`** (20 minutes ago) - Hero component with sun and clouds ⭐
- **`814640d`** (14 minutes ago) - Flock of birds and plane animation
- **`2437d14`** (19 minutes ago) - Modern hero section with typewriter
- **`d716070`** (5 hours ago) - HeroHighlight component version

## Notes

- The script creates a backup before restoring (`.backup.<timestamp>`)
- Always review changes after restoring
- Test the application before committing restored versions

