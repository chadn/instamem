# InstaMem Testing

**Quick Start:** Fast unit tests for development + comprehensive E2E tests for validation.

## Table of Contents

- [🚀 Quick Commands](#-quick-commands)
- [📊 Current Status](#-current-status)
- [📁 Structure](#-structure)
- [🔧 Configuration](#-configuration)
- [📚 Documentation](#-documentation)
- [🗂️ Test Output Organization](#️-test-output-organization)

## 🚀 Quick Commands

```bash
# Development (fast feedback)
npm run test:unit:watch     # Watch mode (~1s per run)

# Validation (before commit)  
npm run test:unit           # Fast business logic tests (~1s)
npm run lint               # Code quality
npm run build              # Type checking

# Full validation (CI/CD)
npm test                   # Unit + E2E tests (~90s total)
```

## 📊 Current Status

- **✅ Unit Tests**: 109 tests covering business logic
- **✅ E2E Tests**: 36 tests covering user workflows  
- **✅ Coverage**: 60% thresholds (ramping to 80%)
- **✅ Performance**: Unit tests ~1s, E2E tests ~90s

## 📁 Structure

```
tests/
├── unit/                   # Fast business logic tests (Vitest)
│   ├── lib/                # Core functions (validation, memory ops)
│   ├── components/         # Component logic
│   └── __mocks__/          # Test utilities
│
├── e2e/                    # User workflow tests (Playwright) 
│   ├── tests/auth/         # Authentication flows
│   ├── tests/search/       # Search functionality
│   ├── tests/memory/       # Memory management
│   └── config/             # Test configuration
│
└── scripts/                # Test organization and utilities
```

## 🔧 Configuration

- **Unit Tests**: Vitest with jsdom, 60% coverage thresholds
- **E2E Tests**: Playwright, Chromium-first with optional cross-browser
- **Mocking**: Simple manual mocks following maintenance-first approach

## 📚 Documentation

- **[docs/tests.md](../docs/tests.md)**: Complete testing strategy, coverage breakdown, and detailed test information
- **[unit/README.md](unit/README.md)**: Unit test details and planning
- **[docs/tests-history.md](../docs/tests-history.md)**: Implementation history and technical challenges overcome

## 🗂️ Test Output Organization

### E2E Test Results
E2E test results are automatically organized into timestamped folders with clear success/failure indicators:

```
tests/e2e/artifacts/
├── test-run-passed-2025-08-12T16-45-23/
│   ├── results/          # Test artifacts (screenshots, traces)
│   └── report/           # HTML dashboard
└── test-run-failed-2025-08-12T17-23-45/
    ├── results/          # Failure details and screenshots  
    └── report/           # HTML report with failure analysis
```

**Features:**
- ✅ **Clear organization**: Passed/failed runs clearly separated
- ✅ **Historical tracking**: Timestamped for comparison across runs
- ✅ **Automatic cleanup**: Keeps last 5 runs, prevents disk space issues
- ✅ **Clean exit**: No hanging processes after test completion

### Unit Test Coverage
Unit test coverage reports are generated in `tests/unit/coverage/`:
- **HTML Report**: `tests/unit/coverage/index.html`
- **LCOV Report**: For CI/CD integration
- **Text Summary**: Console output during test runs

---

**Philosophy**: Maintenance-first testing with simple, focused tests that provide fast feedback during development and comprehensive validation for deployment.
