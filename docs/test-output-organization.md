# Test Output Organization

**Quick Summary:** Test results are automatically organized into timestamped folders (`test-run-passed-*` or `test-run-failed-*`) with automatic cleanup and clean exit behavior.

## Available Test Commands

### 1. Standard Test (organized structure)
```bash
npm run test
```
- **New default behavior**: Automatically organizes results into single folders: `test-run-passed-TIMESTAMP/` or `test-run-failed-TIMESTAMP/`
- Each folder contains both raw results and HTML report as subfolders
- Includes timestamp for historical tracking
- Cleans up old test runs (keeps last 5 runs)
- Clean exit without serving HTML report

### 2. Basic Test (simple folders)
```bash
npm run test:basic
```
- Uses timestamped folders: `test-results-latest` and `playwright-report-latest`
- Always overwrites the "latest" directories  
- For quick development testing when you don't need organized results

### 3. Other Test Commands (unchanged)
```bash
npm run test:ui          # Interactive UI mode
npm run test:debug       # Debug mode
npm run test:all-browsers # Cross-browser testing
```

## Folder Structure Examples

### Successful Test Run
```
tests/e2e/artifacts/
└── test-run-passed-2025-07-30T20-46-04/
    ├── results/          # Raw test artifacts (screenshots, traces, etc.)
    └── report/           # HTML dashboard
        └── index.html
```

### Failed Test Run
```
tests/e2e/artifacts/
└── test-run-failed-2025-07-30T20-46-25/
    ├── results/          # Raw test artifacts with failure details
    │   └── search-search-edge-cases-S-060c5-tizes-HTML-and-XSS-attempts-chromium/
    │       ├── error-context.md
    │       └── test-failed-1.png
    └── report/           # HTML dashboard showing failures
        └── index.html
```

## Benefits

### 1. Clear Result Organization
- **Passed tests**: Easy to identify successful runs
- **Failed tests**: Failed runs are clearly marked and separated
- **Timestamps**: Each run is uniquely identified with ISO timestamp

### 2. Historical Tracking
- Keep track of test run history
- Compare results across different runs
- Automatic cleanup prevents disk space issues

### 3. Clean Exit Behavior
- `npm run test` now exits cleanly without serving HTML report
- Manual report viewing: `npx playwright show-report path/to/report`
- No more hanging processes or "Press Ctrl+C to quit" messages

### 4. Automatic Cleanup
- Keeps only the last 5 test runs of each type
- Prevents disk space accumulation
- Configurable retention policy

## Implementation Details

### Files Modified/Created
- `tests/config/playwright.config.ts` - Updated reporter configuration and dynamic folders
- `tests/scripts/organize-results.js` - Post-test organization script
- `tests/scripts/test-with-organization.sh` - Wrapper script for organized testing
- `package.json` - Added new test commands

### Key Features
- **Exit code preservation**: Original test exit codes are maintained
- **Error handling**: Organization runs even when tests fail
- **Cross-platform**: Works on macOS, Linux, and Windows
- **Timestamp format**: ISO format compatible with filesystem naming

## Usage Recommendations

### For Development
Use `npm run test` for quick feedback during development.

### For CI/CD
Use `npm run test:organized` to maintain historical records and easier debugging of failed builds.

### For Debugging
Use `npm run test:debug` or examine specific failed test artifacts in the organized directories.

## Future Enhancements
- Integration with CI/CD systems for artifact archival
- Custom retention policies per environment
- Automated report distribution for failed tests
- Performance metrics tracking across runs