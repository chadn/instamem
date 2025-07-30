import { Reporter, TestCase, TestResult, FullResult } from '@playwright/test/reporter'
import * as fs from 'fs'
import * as path from 'path'

class DynamicFolderReporter implements Reporter {
  private hasFailures = false
  private outputDir = ''
  private reportDir = ''

  onBegin() {
    this.hasFailures = false
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    
    // Set base directories
    this.outputDir = path.join(__dirname, '../e2e/artifacts/test-results')
    this.reportDir = path.join(__dirname, '../e2e/artifacts/playwright-report')
  }

  onTestEnd(test: TestCase, result: TestResult) {
    if (result.status === 'failed' || result.status === 'timedOut') {
      this.hasFailures = true
    }
  }

  async onEnd(result: FullResult) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const suffix = this.hasFailures ? 'failed' : 'passed'
    
    const finalOutputDir = `${this.outputDir}-${suffix}-${timestamp}`
    const finalReportDir = `${this.reportDir}-${suffix}-${timestamp}`

    // Move/copy results to final directories
    try {
      if (fs.existsSync(this.outputDir)) {
        await this.moveDirectory(this.outputDir, finalOutputDir)
      }
      
      if (fs.existsSync(this.reportDir)) {
        await this.moveDirectory(this.reportDir, finalReportDir)
      }

      console.log(`\n📁 Test results saved to: ${finalOutputDir}`)
      console.log(`📁 HTML report saved to: ${finalReportDir}`)
      
      if (this.hasFailures) {
        console.log(`❌ Tests failed - results in "failed" directory`)
      } else {
        console.log(`✅ All tests passed - results in "passed" directory`)
      }
    } catch (error) {
      console.error('Error organizing test results:', error)
    }
  }

  private async moveDirectory(src: string, dest: string): Promise<void> {
    if (fs.existsSync(dest)) {
      fs.rmSync(dest, { recursive: true, force: true })
    }
    fs.renameSync(src, dest)
  }
}

export default DynamicFolderReporter