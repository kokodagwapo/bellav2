#!/usr/bin/env node

/**
 * Landing Page Version Restorer
 * 
 * Usage:
 *   node restore-landing-page.js <commit-hash>
 * 
 * Example:
 *   node restore-landing-page.js 814640d
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const commitHash = process.argv[2];

if (!commitHash) {
    console.error('❌ Error: Please provide a commit hash');
    console.log('\nUsage: node restore-landing-page.js <commit-hash>');
    console.log('\nExample: node restore-landing-page.js 814640d');
    process.exit(1);
}

const landingPagePath = path.join(__dirname, 'components', 'LandingPage.tsx');

try {
    // Check if the commit exists
    try {
        execSync(`git cat-file -e ${commitHash}`, { stdio: 'ignore' });
    } catch (e) {
        console.error(`❌ Error: Commit ${commitHash} not found`);
        process.exit(1);
    }
    
    // Check if the file exists in that commit
    try {
        execSync(`git show ${commitHash}:components/LandingPage.tsx > /dev/null 2>&1`, { stdio: 'ignore' });
    } catch (e) {
        console.error(`❌ Error: LandingPage.tsx not found in commit ${commitHash}`);
        process.exit(1);
    }
    
    // Backup current file
    if (fs.existsSync(landingPagePath)) {
        const backupPath = `${landingPagePath}.backup.${Date.now()}`;
        fs.copyFileSync(landingPagePath, backupPath);
        console.log(`✅ Backup created: ${backupPath}`);
    }
    
    // Restore from commit
    console.log(`🔄 Restoring LandingPage.tsx from commit ${commitHash}...`);
    execSync(`git checkout ${commitHash} -- components/LandingPage.tsx`, { stdio: 'inherit' });
    
    console.log(`\n✅ Successfully restored LandingPage.tsx from commit ${commitHash}`);
    console.log(`\n📝 Next steps:`);
    console.log(`   1. Review the changes`);
    console.log(`   2. Test the application`);
    console.log(`   3. Commit if satisfied: git add components/LandingPage.tsx && git commit -m "Restore landing page from ${commitHash}"`);
    
} catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
}



