# Unit Tests

This directory contains unit tests for the InstaMem application using Vitest.

## Table of Contents

- [Running Tests](#running-tests)
- [Current Unit Tests](#current-unit-tests)
- [E2E Tests That Could Be Unit Tests](#e2e-tests-that-could-be-unit-tests)
- [Benefits of Unit Tests](#benefits-of-unit-tests)
- [Current Status](#current-status)

## Running Tests

```bash
# Run unit tests once
npm run test:unit:run

# Run unit tests in watch mode
npm run test:unit:watch

# Run unit tests with coverage
npm run test:unit

# Run all tests (E2E + Unit)
npm test
```

## Current Unit Tests

- **`/lib/memory-queries.test.ts`** - Tests for database operations including delete functionality
- **`/lib/memory-operations.test.ts`** - Tests for memory CRUD operations (fetch, update) ✅ **NEW**
- **`/lib/validation.test.ts`** - Tests for all form validation functions ✅ **NEW**
- **`/components/memory-search.test.ts`** - Tests for utility functions like date/URL formatting

## E2E Tests That Could Be Unit Tests

Based on analysis of the existing E2E test suite, these areas would benefit from faster unit tests:

### 🔧 **Utility Functions (High Priority)**
- `formatDate()` - Date formatting logic ✅ **Done**
- `formatUrl()` - URL truncation and formatting ✅ **Done** 
- Form validation functions ✅ **Done**
- `highlightPartialMatches()` - Search result highlighting
- Search query sanitization

### 🗄️ **Database Operations (High Priority)**
- `deleteMemory()` - Memory deletion ✅ **Done**
- `fetchMemoryById()` - Single memory fetching ✅ **Done**
- `updateMemoryFields()` - Memory updates ✅ **Done**
- `createMemory()` - Memory creation logic
- `updateMemoryTags()` - Tag management

### 🔍 **Search Logic (Medium Priority)**
- Offline search functionality
- Search query processing
- Result filtering and sorting
- Network status detection

### 🎨 **Component Logic (Medium Priority)**
- Form validation states
- Error message generation
- UI state calculations
- Mobile vs desktop logic

### 📡 **Network & Auth (Low Priority)**
Keep as E2E - these require full integration:
- Authentication flows
- Database connectivity
- Real network error handling
- Full user workflows

## Benefits of Unit Tests

- **Speed**: ~700ms vs ~90s for full E2E suite
- **Isolation**: Test individual functions without browser overhead
- **Debugging**: Easier to identify specific failures
- **Coverage**: Test edge cases and error conditions more thoroughly
- **CI/CD**: Faster feedback in development workflow

## Current Status

- ✅ Unit testing framework (Vitest) set up
- ✅ Basic utility function tests implemented
- ✅ Delete memory functionality tested
- 🔄 Additional utility functions can be extracted and tested
- 🔄 Database operations can be expanded with more comprehensive tests