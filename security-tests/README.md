# Wotmed-Net Security Testing

## Overview

The `security-tests/` module provides an automated security testing framework for validating the application-layer active defense mechanisms of Wotmed-Net.

The framework sends controlled security test requests to the application and evaluates:

* Attack detection
* Threat response
* Defense action
* Blocking or containment
* Request reliability
* Response time
* Expected versus observed behavior

The current automated test suite covers SQL Injection, Cross-Site Scripting, Path Traversal, and controlled Brute-Force scenarios.

---

## Testing Objectives

The security testing module is designed to:

1. Validate application-layer attack detection.
2. Verify that the expected defense mechanism is triggered.
3. Validate blocking and containment behavior.
4. Verify brute-force threshold detection.
5. Measure request and response behavior.
6. Generate machine-readable security test reports.
7. Provide evidence for security validation and final project presentation.

---

## Current Test Coverage

The current automated framework covers four major categories:

| Category             | Test Cases | Purpose                                   |
| -------------------- | ---------: | ----------------------------------------- |
| SQL Injection        |          2 | Validate SQLi detection and blocking      |
| Cross-Site Scripting |          2 | Validate XSS detection and containment    |
| Path Traversal       |          2 | Validate traversal detection and blocking |
| Brute Force          |          5 | Validate threshold-based detection        |

**Total: 11 controlled test cases**

---

## Testing Workflow

The testing process follows this workflow:

```text
Security Test Case
       ↓
Controlled Payload
       ↓
HTTP Request
       ↓
Wotmed-Net Inspection
       ↓
Threat Detection
       ↓
Defense Decision
       ↓
Block / Tarpit / Allow
       ↓
Result Evaluation
       ↓
JSON + CSV Report
```

---

## Test Environment

Current test configuration:

```text
Target   : http://localhost:3000
Endpoint : /api/v1/auth/login
Timeout  : 5 seconds
Runner   : Python + uv
```

The tests are executed against a locally running Wotmed-Net instance.

---

## Running the Tests

Navigate to the security testing scripts directory:

```powershell
cd C:\Users\hp\Desktop\INSA\wotmed-net\security-tests\scripts
```

Run the automated test suite:

```powershell
uv run python security_test.py
```

The framework executes all configured test cases and prints the results to the console.

---

## Current Test Results

The latest completed execution produced:

| Metric                 |         Result |
| ---------------------- | -------------: |
| Total Tests            |             11 |
| Passed                 |             11 |
| Failed                 |              0 |
| Detected               |              7 |
| Request Failures       |              0 |
| Request Success Rate   |           100% |
| Overall Detection Rate |         63.64% |
| Average Response Time  | 0.6768 seconds |

### Category Results

| Category             |  Tests | Detected | Passed | Failed |
| -------------------- | -----: | -------: | -----: | -----: |
| SQL Injection        |      2 |        2 |      2 |      0 |
| Cross-Site Scripting |      2 |        2 |      2 |      0 |
| Path Traversal       |      2 |        2 |      2 |      0 |
| Brute Force          |      5 |        1 |      5 |      0 |
| **Total**            | **11** |    **7** | **11** |  **0** |

### Result

**Overall Test Suite: PASSED**

The 63.64% detection figure represents the percentage of requests detected within this specific test suite. It is not a general security-effectiveness score.

---

## Defense Validation

The tests demonstrated multiple Wotmed-Net defense responses.

### SQL Injection

```text
Detection: DETECTED
Defense:   BLOCK_AND_REDIRECT_HONEYPOT
Blocking:  BLOCKED
```

Both SQL Injection scenarios were detected and blocked.

### Cross-Site Scripting

```text
Detection: DETECTED
Defense:   AUTONOMOUS_DYNAMIC_TARPIT
Blocking:  TARPITTED
```

Both XSS scenarios were detected and contained using the dynamic tarpit mechanism.

### Path Traversal

```text
Detection: DETECTED
Defense:   BLOCK_AND_REDIRECT_HONEYPOT
Blocking:  BLOCKED
```

Both Path Traversal scenarios were detected and blocked.

### Brute Force

The controlled brute-force test verified threshold behavior.

```text
Attempts 1-4 : NOT_DETECTED → ALLOW
Attempt 5    : DETECTED → AUTONOMOUS_DYNAMIC_TARPIT
```

All five brute-force test steps passed because the expected threshold behavior was observed.

---

## Test Reports

The framework generates machine-readable results in:

```text
security-tests/results/security_test_results.json
security-tests/results/security_test_results.csv
```

### JSON

The JSON report is intended for structured programmatic analysis and future automation.

### CSV

The CSV report provides tabular results suitable for spreadsheet analysis, filtering, and presentation preparation.

---

## Documentation

The security testing module contains the following documentation:

```text
security-tests/
│
├── README.md
├── testing-strategy.md
├── attack-scenarios.md
├── automated-testing.md
├── defense-validation.md
└── test-results.md
```

### Document Responsibilities

| Document                | Purpose                                  |
| ----------------------- | ---------------------------------------- |
| `README.md`             | Module overview and execution guide      |
| `testing-strategy.md`   | Overall testing methodology              |
| `attack-scenarios.md`   | Attack scenario definitions              |
| `automated-testing.md`  | Automated framework design and execution |
| `defense-validation.md` | Defense behavior validation              |
| `test-results.md`       | Detailed execution results               |

---

## Testing Principles

All security testing follows these principles:

### Controlled Testing

Only predefined and controlled security payloads are used.

### Non-Destructive Testing

Testing is performed against the local development environment and is designed to avoid destructive actions.

### Reproducibility

Test cases are automated so that the same scenarios can be executed repeatedly.

### Evidence-Based Validation

A test result is evaluated using observed detection, defense, and blocking behavior rather than relying only on HTTP status codes.

### Separation of Detection and Defense

Detection and defense are recorded as separate results.

For example:

```text
Detection → DETECTED
Defense   → AUTONOMOUS_DYNAMIC_TARPIT
Blocking  → TARPITTED
```

This provides a clearer representation of how Wotmed-Net responds to suspicious activity.

---

## Current Limitations

The current test suite is intentionally limited to four attack categories.

It does not yet provide complete coverage for:

* Command Injection
* CSRF
* Authentication bypass variations
* Authorization vulnerabilities
* Session security
* API abuse
* Large-scale rate-limit testing
* Comprehensive legitimate-traffic testing
* Formal false-positive measurement
* Production-scale load testing
* Independent telemetry persistence validation
* External IP reputation validation

These areas can be added in future iterations.

---

## Future Improvements

Planned improvements include:

1. Expand attack payload coverage.
2. Add legitimate traffic baseline tests.
3. Add false-positive and false-negative measurements.
4. Add API security test cases.
5. Add authentication and authorization testing.
6. Add session security testing.
7. Add rate-limit and abuse testing.
8. Integrate security tests into CI/CD.
9. Expand machine-readable reporting.
10. Add historical test-result comparison.
11. Validate telemetry persistence independently.
12. Add controlled performance and load testing.

---

## Security Testing Status

```text
==================================================
WOTMED-NET SECURITY TESTING
==================================================

Automated Framework       : IMPLEMENTED
SQL Injection Tests       : PASS
XSS Tests                 : PASS
Path Traversal Tests      : PASS
Brute Force Tests         : PASS

Total Tests               : 11
Passed                    : 11
Failed                    : 0
Detection                : 7 / 11
Request Success           : 100%

Overall Test Status       : PASSED
==================================================
```

---

## Related Documentation

For detailed information, see:

* `testing-strategy.md`
* `attack-scenarios.md`
* `automated-testing.md`
* `defense-validation.md`
* `test-results.md`

The security testing module provides the evidence and validation layer for the Wotmed-Net active defense system.
