# InstaMem Testing Strategy

**Quick Summary:** Multi-layered testing with E2E (implemented), unit tests (planned), and integration tests (planned). Commands, structure, and development workflow.

Also see

-   [test-coverage-summary.md](./test-coverage-summary.md): Detailed breakdown of E2E test coverage, categories, and implementation notes.
-   [tests-history.md](./tests-history.md): Chronological history of testing implementation, breakthroughs, and technical challenges.
-   [test-output-organization.md](./test-output-organization.md): How test results and artifacts are organized, including folder structure and cleanup.
-   [../tests/README.md](../tests/README.md): Entry point for test runner and infrastructure documentation.
-   [../tests/unit/README.md](../tests/unit/README.md): Plans and structure for unit tests (Jest), including setup and test targets.
-   [../tests/shared/README.md](../tests/shared/README.md): Shared test utilities, fixtures, and helpers to avoid duplication across test types.

## Test Types

| Type            | Purpose                   | Tools      | Status     |
| --------------- | ------------------------- | ---------- | ---------- |
| **E2E**         | Full user journeys        | Playwright | ✅ Ready   |
| **Unit**        | Business logic            | Jest + RTL | 📋 Planned |
| **Integration** | Component + service flows | Jest + MSW | 📋 Planned |
| **Visual**      | UI consistency            | Playwright | 🔮 Future  |
| **Performance** | Speed & bundles           | Lighthouse | 🔮 Future  |

## Commands

### ✅ Available Now

```bash
npm run test              # Full E2E suite
npm run test:ui           # Interactive mode
npm run test:debug        # Debug mode
npm run test:basic        # Simple output

# Target specific areas
npm run test -- --grep "auth"      # Authentication flows
npm run test -- --grep "search"    # Search functionality
npm run test -- --grep "memory"    # Memory management
```

### 📋 Planned (Not Yet Available)

```bash
npm run test:unit         # Unit tests (Jest + RTL)
npm run test:integration  # Integration tests
npm run test:quick        # Fast pre-commit tests
```

### 🔮 Future

```bash
npm run test:visual       # Visual regression
npm run test:perf         # Performance testing
npm run test:a11y         # Accessibility testing
```

## Test Structure

```
tests/
├── e2e/                    # ✅ Playwright tests
│   ├── tests/auth/
│   ├── tests/search/
│   ├── tests/memory/
│   └── helpers/
│
├── unit/                   # 📋 Jest tests (planned)
│   ├── lib/
│   ├── utils/
│   └── hooks/
│
├── integration/            # 📋 Integration tests (planned)
└── shared/                 # 📋 Test utilities (planned)
```

## Development Workflow

### Daily Development

```bash
# Fast feedback loop (when available)
npm run test:unit:watch     # 📋 Not yet implemented

# Full validation
npm run test:ui             # ✅ Available now
```

### Pre-Commit

```bash
npm run test:quick          # 📋 Not yet implemented
npm run lint               # ✅ Available now
npm run build              # ✅ Available now (includes type checking)
```

## Test Areas

### Authentication

-   **E2E**: Login flows, session management ✅
-   **Unit**: Auth utilities, token validation 📋
-   **Integration**: Auth provider + components 📋

### Search

-   **E2E**: Search UI, online/offline modes ✅
-   **Unit**: Search algorithms, filtering 📋
-   **Integration**: Search service + UI 📋

### Memory Management

-   **E2E**: CRUD operations, sync status ✅
-   **Unit**: Storage utilities, sync logic 📋
-   **Integration**: Memory service + sync provider 📋

## Quality Standards

-   **Coverage**: 80% minimum for unit tests
-   **Performance**: E2E tests under 5 minutes
-   **Reliability**: <5% flaky test rate

## Next Steps

**Short Term**: Unit test foundation for core business logic
**Medium Term**: Integration tests for critical flows
**Long Term**: Visual regression and performance testing

---

**Current Status**: E2E foundation complete  
**History**: See [tests-history.md](./tests-history.md) for implementation details
