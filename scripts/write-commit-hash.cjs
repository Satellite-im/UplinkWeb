const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// Function to get the latest Git commit hash
function getCommitHash() {
    try {
        return execSync('git rev-parse HEAD').toString().trim()
    } catch (error) {
        console.error('Error fetching commit hash:', error)
        return 'unknown'
    }
}

// Path to the TypeScript file where the hash will be written
const filePath = path.resolve(__dirname, '../src/commit-hash.ts')

// Write the commit hash to a TypeScript file
const commitHash = getCommitHash()
const content = `export const COMMIT_HASH = '${commitHash}';\n`

fs.writeFileSync(filePath, content)
console.log(`Commit hash written to ${filePath}`)

