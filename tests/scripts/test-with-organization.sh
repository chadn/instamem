#!/bin/bash

# Wrapper script to run tests and organize results based on success/failure

# Run the tests and capture exit code (don't exit on failure yet)
set +e
playwright test --config=tests/config/playwright.config.ts "$@"
TEST_EXIT_CODE=$?
set -e

# Organize results based on test outcome
node tests/scripts/organize-results.js $TEST_EXIT_CODE

# Exit with the original test exit code
exit $TEST_EXIT_CODE