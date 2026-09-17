# Wotmed-Net Security Testing Strategy

## 1. Purpose

This document defines the security testing strategy used to validate the application-layer active defense mechanisms of Wotmed-Net.

The strategy focuses on controlled, repeatable, and evidence-based testing of malicious application-layer requests.

The testing process validates both:

* **Detection:** whether Wotmed-Net identifies suspicious activity
* **Defense:** whether the appropriate response is applied after detection

---

## 2. Testing Scope

The current automated security testing scope covers:

* SQL Injection
* Cross-Site Scripting (XSS)
* Path Traversal
* Controlled Brute-Force activity

The tests are executed against the Wotmed-Net application through the configured authentication endpoint.

### Current Target

```text
Target   : http://localhost:3000
Endpoint : /api/v1/auth/login
```

Testing is performed in a controlled local development environment.

---

## 3. Testing Objectives

The testing strategy has the following objectives:

1. Verify that known malicious request patterns are detected.
2. Verify that detected attacks trigger the expected defense mechanism.
3. Validate blocking and containment behavior.
4. Validate threshold-based brute-force detection.
5. Confirm that legitimate activity below the tested threshold is not unnecessarily blocked.
6. Measure request processing reliability.
7. Measure response-time behavior.
8. Generate reproducible security evidence.
9. Produce machine-readable test results for further analysis.

---

## 4. Test Environment

| Component                   | Configuration           |
| --------------------------- | ----------------------- |
| Application                 | Wotmed-Net              |
| Environment                 | Local development       |
| Target                      | `http://localhost:3000` |
| Test Endpoint               | `/api/v1/auth/login`    |
| Testing Language            | Python                  |
| Package/Environment Manager | `uv`                    |
| Timeout                     | 5 seconds               |
| Test Runner                 | `security_test.py`      |

The test framework communicates with the running Wotmed-Net application using HTTP requests.

---

## 5. Testing Methodology

The testing methodology follows a controlled attack-and-validation process:

```text
1. Select Test Case
        ↓
2. Generate Controlled Payload
        ↓
3. Send HTTP Request
        ↓
4. Wotmed-Net Inspects Request
        ↓
5. Detection Decision
        ↓
6. Defense Decision
        ↓
7. Observe Application Response
        ↓
8. Compare Expected vs Observed Behavior
        ↓
9. Record Result
        ↓
10. Generate Report
```

Each test case has a defined expected behavior.

A test passes when the observed security behavior satisfies the expected behavior defined for that scenario.

---

## 6. Test Categories

### 6.1 SQL Injection

SQL Injection tests evaluate whether suspicious SQL-related authentication input is detected.

Current scenarios:

* SQLi Authentication Bypass
* SQLi UNION Probe

Expected defense:

```text
BLOCK_AND_REDIRECT_HONEYPOT
```

---

### 6.2 Cross-Site Scripting

XSS tests evaluate whether script-related payloads are identified.

Current scenarios:

* Basic Script Injection
* Image Event Handler Injection

Expected defense:

```text
AUTONOMOUS_DYNAMIC_TARPIT
```

The tarpit mechanism is used to slow and contain suspicious activity.

---

### 6.3 Path Traversal

Path Traversal tests evaluate whether attempts to access files through traversal patterns are detected.

Current scenarios:

* Basic Path Traversal
* Nested Path Traversal

Expected defense:

```text
BLOCK_AND_REDIRECT_HONEYPOT
```

---

### 6.4 Controlled Brute Force

The brute-force test evaluates threshold-based behavioral detection.

Five controlled authentication attempts are generated.

Expected behavior:

```text
Attempts 1-4 → Below Threshold → ALLOW
Attempt 5    → Threshold Reached → TARPIT
```

This validates that repeated suspicious activity eventually triggers a defense mechanism.

---

## 7. Test Case Structure

Each automated test records information including:

| Field           | Purpose                         |
| --------------- | ------------------------------- |
| Test Name       | Identifies the scenario         |
| Category        | Attack classification           |
| Payload         | Controlled test input           |
| HTTP Status     | Application response status     |
| Detection       | Whether the attack was detected |
| Defense         | Selected defense mechanism      |
| Blocking        | Blocking or containment result  |
| Response Time   | Request processing duration     |
| Expected Result | Expected security behavior      |
| Actual Result   | Observed security behavior      |
| Test Status     | PASS or FAIL                    |

This structure allows the framework to distinguish application response status from security decision status.

---

## 8. Detection and Defense Evaluation

Detection and defense are evaluated separately.

For example:

```text
Detection: DETECTED
Defense:   AUTONOMOUS_DYNAMIC_TARPIT
Blocking:  TARPITTED
Result:    TEST_PASSED
```

This distinction is important because an HTTP status code alone does not determine whether Wotmed-Net detected an attack.

For example, an XSS request may return HTTP `200` while still being detected and tarpitted by the defense layer.

---

## 9. Pass and Fail Criteria

### PASS

A test is marked as `PASS` when the observed behavior matches the expected security behavior.

Examples:

```text
Expected: DETECTED + BLOCKED
Observed: DETECTED + BLOCKED
Result:   PASS
```

or:

```text
Expected: NOT_DETECTED + ALLOW
Observed: NOT_DETECTED + ALLOW
Result:   PASS
```

### FAIL

A test is marked as `FAIL` when the observed behavior does not satisfy the expected behavior.

Examples include:

* Expected attack detection but no detection occurred
* Expected blocking but malicious activity was allowed
* Expected threshold detection but the threshold was not triggered
* Request processing failed unexpectedly

---

## 10. Test Isolation and Safety

Security tests are performed under controlled conditions.

The testing strategy follows these principles:

### Local Testing

Tests target the local Wotmed-Net instance.

### Controlled Payloads

Only predefined test payloads are used.

### Non-Destructive Execution

The tests are designed to validate defensive behavior without intentionally damaging application data.

### Repeatability

Automated tests can be executed repeatedly using the same test definitions.

### Limited Scope

The current suite targets specific application-layer scenarios rather than attempting unrestricted penetration testing.

---

## 11. Brute-Force Threshold Strategy

The brute-force scenario is intentionally different from the other attack categories.

The objective is not to detect every individual request.

Instead, it validates behavioral escalation.

```text
Attempt 1
    ↓
No threshold reached
    ↓
ALLOW

Attempt 2
    ↓
No threshold reached
    ↓
ALLOW

Attempt 3
    ↓
No threshold reached
    ↓
ALLOW

Attempt 4
    ↓
No threshold reached
    ↓
ALLOW

Attempt 5
    ↓
Threshold reached
    ↓
DETECTED
    ↓
TARPITTED
```

This confirms that the defense system can change its response after repeated suspicious activity.

---

## 12. Test Execution Order

The current suite follows this order:

```text
1. SQL Injection
2. Cross-Site Scripting
3. Path Traversal
4. Controlled Brute Force
```

This provides a simple and repeatable execution sequence for the current test suite.

---

## 13. Security Metrics

The testing framework currently records the following metrics:

### Test Pass Rate

Number of passed tests divided by total executed tests.

For the latest execution:

```text
11 / 11 = 100%
```

### Detection Rate

Number of detected requests divided by total tested requests.

For the latest execution:

```text
7 / 11 = 63.64%
```

This metric describes only the behavior of the current test suite. It is not a general security-effectiveness score.

### Request Success Rate

Number of successfully processed requests divided by total requests.

Latest execution:

```text
11 / 11 = 100%
```

### Average Response Time

Latest execution:

```text
0.6768 seconds
```

---

## 14. Current Validation Results

The latest automated execution produced:

| Category       |  Tests | Detected | Passed | Failed |
| -------------- | -----: | -------: | -----: | -----: |
| SQL Injection  |      2 |        2 |      2 |      0 |
| XSS            |      2 |        2 |      2 |      0 |
| Path Traversal |      2 |        2 |      2 |      0 |
| Brute Force    |      5 |        1 |      5 |      0 |
| **Total**      | **11** |    **7** | **11** |  **0** |

Overall:

```text
Total Tests       : 11
Passed            : 11
Failed            : 0
Request Failures  : 0
Detection         : 7
Success Rate      : 100%
```

---

## 15. Evidence Collection

Security testing evidence is collected from:

* Automated console output
* JSON test results
* CSV test results
* Detection decisions
* Defense decisions
* Blocking/containment results
* HTTP response status
* Response-time measurements

Generated reports:

```text
security-tests/results/security_test_results.json
security-tests/results/security_test_results.csv
```

These files provide persistent evidence of the executed test cases.

---

## 16. Legitimate Traffic Consideration

The testing strategy distinguishes between malicious and legitimate traffic.

The current brute-force test provides a limited example of this principle by allowing attempts that remain below the configured threshold.

However, a comprehensive false-positive measurement requires a larger legitimate-traffic dataset.

Therefore, the current 11-test execution does **not** claim a formal false-positive rate.

Future testing should include:

* Normal login requests
* Normal API requests
* Common user input
* Repeated legitimate requests
* Expected application navigation patterns

---

## 17. Telemetry and Logging Validation

The security test framework records detection and defense decisions as part of the test results.

However, independent end-to-end telemetry persistence is not claimed as fully validated by the current 11-test execution.

A future telemetry validation phase should verify:

1. Attack event generation
2. Event persistence
3. Correct timestamp
4. Source identification
