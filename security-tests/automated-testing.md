# Wotmed-Net Automated Security Testing

## 1. Overview

The Wotmed-Net automated security testing component provides a repeatable mechanism for executing controlled security test cases against the authorized Wotmed-Net test environment.

The automation layer reduces manual testing effort and provides consistent measurement of:

* Attack detection
* Threat classification
* Defense response
* HTTP response status
* Response latency
* Threat score changes
* Blocking behavior
* Telemetry generation

The initial implementation will use Python because it provides a simple and flexible environment for HTTP request generation, result collection, timing measurement, and structured reporting.

---

# 2. Objectives

The automated testing framework has the following objectives:

1. Execute predefined security test cases automatically.
2. Send controlled requests to the Wotmed-Net test environment.
3. Capture HTTP responses.
4. Measure response latency.
5. Determine whether a security event was generated.
6. Record threat and defense information.
7. Compare observed behavior against expected behavior.
8. Produce structured test results.
9. Make testing reproducible.
10. Reduce manual testing errors.

---

# 3. Proposed Directory Structure

The security testing directory will contain the documentation and automation components:

```text
security-tests/
│
├── README.md
├── testing-strategy.md
├── attack-scenarios.md
├── automated-testing.md
├── defense-validation.md
├── test-results.md
│
└── scripts/
    ├── security_test.py
    ├── config.py
    ├── test_cases.py
    ├── reporter.py
    └── requirements.txt
```

The `scripts/` directory contains the implementation of the automated testing framework.

---

# 4. Testing Architecture

The automated tester follows this architecture:

```text
                    Test Configuration
                           |
                           v
                    Test Case Loader
                           |
                           v
                    Security Test Runner
                           |
             +-------------+-------------+
             |             |             |
             v             v             v
           SQLi           XSS       Path Traversal
             |             |             |
             +-------------+-------------+
                           |
                           v
                    HTTP Request Layer
                           |
                           v
                      Wotmed-Net
                           |
             +-------------+-------------+
             |                           |
             v                           v
       HTTP Response              Telemetry System
             |                           |
             +-------------+-------------+
                           |
                           v
                    Result Collector
                           |
                           v
                       Reporter
```

---

# 5. Test Configuration

The test framework should avoid hard-coding environment-specific values.

Configuration should be supplied through environment variables or a dedicated configuration file.

Example:

```text
WOTMED_TEST_BASE_URL=http://localhost:3000
WOTMED_TEST_TIMEOUT=10
WOTMED_TEST_RUN_ID=local
```

Sensitive credentials, tokens, or production configuration must not be committed to source control.

A `.env.example` file may be provided for development configuration.

---

# 6. Dependencies

The initial Python implementation may use the following packages:

```text
requests
python-dotenv
```

`requests` is used for HTTP communication.

`python-dotenv` may be used to load local environment configuration during development.

The dependency list will be maintained in:

```text
security-tests/scripts/requirements.txt
```

Example:

```text
requests
python-dotenv
```

---

# 7. Test Case Definition

Security test cases should be represented as structured data rather than being hard-coded directly into the request execution logic.

Example conceptual structure:

```python
{
    "id": "ATK-001",
    "name": "SQL Injection Detection",
    "method": "GET",
    "endpoint": "/api/test",
    "parameter": "search",
    "payload": "<controlled-test-input>",
    "expected_detection": True
}
```

This separation makes it easier to add new test scenarios without changing the core test runner.

---

# 8. Test Execution Process

The automated test runner follows these steps:

```text
1. Load configuration
        ↓
2. Validate target
        ↓
3. Load test cases
        ↓
4. Execute test request
        ↓
5. Start response timer
        ↓
6. Capture HTTP response
        ↓
7. Measure latency
        ↓
8. Evaluate response
        ↓
9. Verify security telemetry
        ↓
10. Store test result
        ↓
11. Generate report
```

---

# 9. Request Generation

The automated framework will generate controlled HTTP requests based on the test case definition.

For example:

```text
Test Case
   |
   +-- Method: GET
   +-- Endpoint: /api/test
   +-- Parameter: search
   +-- Controlled Payload
             |
             v
       HTTP Request
             |
             v
         Wotmed-Net
```

The request generator must ensure that test traffic remains within the authorized test environment.

---

# 10. Response Measurement

For every request, the tester should record:

* Request timestamp
* Response timestamp
* HTTP status code
* Response latency
* Response body size where useful
* Connection or timeout errors

Response latency can be measured as:

```text
Response Latency =
Response Completion Time - Request Start Time
```

Latency should be measured consistently for comparable test cases.

---

# 11. Detection Evaluation

The automated framework should determine whether the security event was detected.

Detection evidence may come from:

* HTTP response behavior
* Wotmed-Net API response
* Telemetry endpoint
* Database record
* Threat score update
* Blocking state

The exact verification mechanism must follow the actual Wotmed-Net implementation.

The test runner must not assume that an HTTP `403` response alone proves that a threat was detected.

Detection should preferably be verified through the application's security telemetry or threat state.

---

# 12. Defense Evaluation

The tester should record the actual defense response.

Possible outcomes include:

```text
ALLOW
DETECT
MONITOR
TARPIT
BLOCK
ERROR
TIMEOUT
```

The final list should be synchronized with the actual Wotmed-Net implementation.

Expected and actual defense actions should be stored separately.

Example:

```text
Expected Defense: BLOCK
Actual Defense:   BLOCK
Result:           PASS
```

or:

```text
Expected Defense: BLOCK
Actual Defense:   ALLOW
Result:           FAIL
```

---

# 13. Threat Score Verification

Where the Wotmed-Net telemetry system exposes threat scores, the automated tester should capture the relevant score before and after testing.

Example:

```text
Initial Score: 0
       ↓
Security Request
       ↓
Final Score: 20
```

The tester should record the observed values.

It should not assume a particular score unless that value is explicitly defined by the active configuration.

---

# 14. Blocking Verification

Blocking behavior should be tested separately from detection.

Example:

```text
Malicious Request
       ↓
Detection
       ↓
Threat Score
       ↓
Configured Threshold
       ↓
Block Decision
       ↓
Subsequent Request
       ↓
Verify Blocked State
```

This distinction is important because:

> Detection does not necessarily mean blocking.

A request may be detected while the configured policy allows monitoring, scoring, tarpit behavior, or another response.

---

# 15. Telemetry Verification

After each security scenario, the test framework should verify whether the expected telemetry event was generated.

The verification may check:

```text
Telemetry
   |
   +-- Source IP
   +-- Attack Type
   +-- Threat Score
   +-- Timestamp
   +-- Defense Action
   +-- Blocking Status
```

The exact fields depend on the active database schema and telemetry implementation.

---

# 16. Test Result Model

Each automated test should produce a structured result.

Example:

```json
{
  "test_id": "ATK-001",
  "attack_type": "SQL Injection",
  "target": "/api/test",
  "detection": true,
  "classification": "SQL Injection",
  "defense_action": "BLOCK",
  "http_status": 403,
  "response_time_ms": 12.4,
  "telemetry": true,
  "overall_status": "PASS"
}
```

The actual fields should be adapted to the final implementation.

---

# 17. Error Handling

The test runner should handle common execution errors without terminating the entire test suite.

Examples include:

* Connection refused
* Connection timeout
* Invalid URL
* Unexpected HTTP status
* Malformed response
* Telemetry unavailable
* Database unavailable

Example execution behavior:

```text
Test 1 → PASS
Test 2 → PASS
Test 3 → ERROR
Test 4 → PASS
```

The framework should continue with remaining independent tests where safe.

Errors should be clearly distinguished from security test failures.

---

# 18. Test Isolation

Each test scenario should be as independent as practical.

Before running a test, the framework should establish the required baseline state.

After testing, temporary state should be cleaned up where necessary.

For IP-based tests, the tester must account for the fact that a previously blocked test IP may affect subsequent scenarios.

A controlled test IP or reset mechanism should therefore be used when available.

---

# 19. Brute-Force Automation

The brute-force scenario requires controlled repetition.

The test runner should use a limited number of authentication attempts defined by configuration.

Example:

```text
Configured Attempts: 5

Attempt 1 → Failure
Attempt 2 → Failure
Attempt 3 → Failure
Attempt 4 → Failure
Attempt 5 → Failure
             ↓
       Evaluate Defense
```

The framework must avoid uncontrolled request generation.

The objective is to verify threshold-based defense behavior, not to create excessive traffic.

---

# 20. Legitimate Traffic Testing

Automated security testing should also generate legitimate requests.

These requests provide a baseline for false-positive evaluation.

Example:

```text
Legitimate Request
        ↓
Wotmed-Net
        ↓
Normal Response
        ↓
No Unnecessary Detection
        ↓
No Unnecessary Block
```

The results will be compared with malicious test results.

---

# 21. Command-Line Interface

The test runner should eventually support simple command-line execution.

Example:

```bash
python security_test.py
```

Optional future commands may include:

```bash
python security_test.py --category sqli
python security_test.py --category xss
python security_test.py --category traversal
python security_test.py --category brute-force
python security_test.py --all
```

The exact CLI options will depend on the implementation.

---

# 22. Output

The automated framework should produce human-readable console output.

Example:

```text
========================================
 WOTMED-NET SECURITY TEST RUN
========================================

[ATK-001] SQL Injection
Detection:     PASS
Defense:       PASS
Telemetry:     PASS
Latency:       14.2 ms
Result:        PASS

[ATK-002] XSS
Detection:     PASS
Defense:       PASS
Telemetry:     PASS
Latency:       11.7 ms
Result:        PASS

========================================
Summary
========================================
Total Tests: 2
Passed:      2
Failed:      0
Errors:      0
========================================
```

---

# 23. Machine-Readable Results

In addition to console output, the framework should support structured result storage.

Possible formats include:

```text
JSON
CSV
```

Example output directory:

```text
security-tests/
└── results/
    ├── latest.json
    └── latest.csv
```

These files can later be used to generate security reports and calculate metrics.

Generated result files should not contain secrets or sensitive production information.

---

# 24. Exit Codes

The test runner should use meaningful process exit codes.

Suggested behavior:

```text
0 → All executed tests passed

1 → One or more security tests failed

2 → Test execution/configuration error
```

This is useful for CI/CD integration.

---

# 25. CI/CD Integration

The automated security tests can eventually be integrated into the project's CI/CD pipeline.

Conceptual workflow:

```text
Code Change
    ↓
Build
    ↓
Start Test Environment
    ↓
Run Security Tests
    ↓
Evaluate Results
    ↓
    +---- PASS ----> Continue Pipeline
    |
    +---- FAIL ----> Pipeline Warning/Failure
```

The exact CI/CD implementation will be documented separately in the DevOps documentation.

---

# 26. Security and Safety Requirements

The automated tester must:

* Run only against authorized environments.
* Use controlled request rates.
* Avoid destructive payloads.
* Avoid real credentials.
* Avoid production data.
* Avoid denial-of-service behavior.
* Protect configuration secrets.
* Validate the target before execution.
* Provide clear test identification.

The test framework is a defensive validation tool, not an unrestricted exploitation framework.

---

# 27. Maintenance

When Wotmed-Net behavior changes, the following should be reviewed:

* Test endpoints
* Payload definitions
* Expected classifications
* Threat score assumptions
* Defense thresholds
* Telemetry fields
* Database queries
* Result parser
* CI/CD configuration

Test cases should be version-controlled together with the project.

---

# 28. Implementation Roadmap

The automated testing implementation will be developed in stages.

### Phase 1 — Basic HTTP Tester

Implement:

* Configuration loading
* HTTP requests
* Timeout handling
* Response measurement
* Console output

### Phase 2 — Security Test Cases

Implement:

* SQL Injection tests
* XSS tests
* Path Traversal tests
* Brute-Force tests

### Phase 3 — Defense Validation

Add:

* Threat score verification
* Detection verification
* Defense action verification
* Blocking verification

### Phase 4 — Telemetry Validation

Add:

* Telemetry retrieval
* Event matching
* IP reputation verification
* Database verification

### Phase 5 — Reporting

Add:

* JSON results
* CSV results
* Summary statistics
* Detection rate
* False-positive ratio
* Blocking effectiveness
* Response latency

### Phase 6 — CI/CD

Integrate the automated security suite into the project pipeline.

---

# 29. Completion Criteria

The automated testing component will be considered complete when:

* Test configuration can be loaded reliably.
* Test cases can be executed automatically.
* SQL Injection testing is implemented.
* XSS testing is implemented.
* Path Traversal testing is implemented.
* Brute-Force testing is implemented.
* Response latency is measured.
* Detection results are collected.
* Defense behavior is evaluated.
* Telemetry is verified.
* Results are stored in a structured format.
* Test failures are clearly reported.
* Tests can run against the authorized Wotmed-Net environment.

---

# 30. Important Implementation Principle

The automated testing framework must measure the actual behavior of Wotmed-Net.

It must not manufacture successful results.

For every test:

```text
Expected Result
      |
      v
Execute Test
      |
      v
Observe Actual Result
      |
      v
Compare
      |
      +---- Match ----> PASS
      |
      +---- Different -> FAIL
```

This ensures that the final security evaluation represents the actual defensive capabilities of Wotmed-Net rather than theoretical capabilities.

---

# 31. Summary

The automated security testing component provides a repeatable mechanism for evaluating Wotmed-Net against controlled application-layer attack scenarios.

The framework will progressively evolve from a basic HTTP test runner into a complete security validation system capable of measuring:

```text
Attack Detection
       ↓
Threat Classification
       ↓
Threat Scoring
       ↓
Defense Response
       ↓
Blocking
       ↓
Telemetry
       ↓
Performance
       ↓
Security Metrics
```

All security claims produced by the testing framework must be supported by observed test evidence.
