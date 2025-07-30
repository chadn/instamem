#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

/**
 * Post-test script to organize results into passed/failed directories
 * Usage: node organize-results.js [exit-code]
 */

const exitCode = process.argv[2] || '0'
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
const hasFailures = exitCode !== '0'
const suffix = hasFailures ? 'failed' : 'passed'

const artifactsDir = path.join(__dirname, '../e2e/artifacts')

// Find the most recent timestamp-based directories
function findLatestDir(pattern) {
  const entries = fs.readdirSync(artifactsDir)
  const matchingDirs = entries
    .filter(name => name.match(pattern))
    .map(name => ({
      name,
      path: path.join(artifactsDir, name),
      stat: fs.statSync(path.join(artifactsDir, name))
    }))
    .sort((a, b) => b.stat.mtime.getTime() - a.stat.mtime.getTime())
  
  return matchingDirs.length > 0 ? matchingDirs[0].path : null
}

const tempOutputDir = findLatestDir(/^test-results-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}$/)
const tempReportDir = findLatestDir(/^playwright-report-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}$/)

const finalRunDir = path.join(artifactsDir, `test-run-${suffix}-${timestamp}`)
const finalOutputDir = path.join(finalRunDir, 'results')
const finalReportDir = path.join(finalRunDir, 'report')

function moveDirectory(src, dest) {
  if (fs.existsSync(dest)) {
    fs.rmSync(dest, { recursive: true, force: true })
  }
  
  if (fs.existsSync(src)) {
    fs.renameSync(src, dest)
    return true
  }
  return false
}

function main() {
  console.log(`\n📁 Organizing test results (exit code: ${exitCode})...`)
  
  let moved = false
  
  // Create the main run directory
  if (!fs.existsSync(finalRunDir)) {
    fs.mkdirSync(finalRunDir, { recursive: true })
  }
  
  if (moveDirectory(tempOutputDir, finalOutputDir)) {
    console.log(`📁 Raw test results moved to: ${path.relative(process.cwd(), finalOutputDir)}`)
    moved = true
  }
  
  if (moveDirectory(tempReportDir, finalReportDir)) {
    console.log(`📁 HTML report moved to: ${path.relative(process.cwd(), finalReportDir)}`)
    moved = true
  }
  
  if (moved) {
    console.log(`📁 Complete test run organized in: ${path.relative(process.cwd(), finalRunDir)}`)
    console.log(`\n⭐⭐⭐ View report (in final report directory): ⭐⭐⭐\n`)
    console.log(`npx playwright show-report ${path.relative(process.cwd(), finalReportDir)}\n`)
    
    if (hasFailures) {
      console.log(`❌ Tests failed - check "${suffix}" directory for details`)
    } else {
      console.log(`✅ All tests passed - results archived in "${suffix}" directory`)
    }
  } else {
    console.log(`ℹ️  No test artifacts found to organize`)
  }
  
  // Keep only the last 5 test runs to prevent disk bloat
  cleanupOldResults()
}

function cleanupOldResults() {
  try {
    const entries = fs.readdirSync(artifactsDir)
    const testRunDirs = entries
      .filter(name => name.startsWith('test-run-'))
      .map(name => ({
        name,
        path: path.join(artifactsDir, name),
        stat: fs.statSync(path.join(artifactsDir, name))
      }))
      .sort((a, b) => b.stat.mtime.getTime() - a.stat.mtime.getTime())
    
    // Keep only the 5 most recent test runs
    const toKeep = 5
    const toDelete = testRunDirs.slice(toKeep)
    
    if (toDelete.length > 0) {
      console.log(`🧹 Cleaning up ${toDelete.length} old test runs...`)
      toDelete.forEach(dir => {
        fs.rmSync(dir.path, { recursive: true, force: true })
      })
    }
  } catch (error) {
    console.warn('Warning: Could not cleanup old results:', error.message)
  }
}

if (require.main === module) {
  main()
}

module.exports = { main }