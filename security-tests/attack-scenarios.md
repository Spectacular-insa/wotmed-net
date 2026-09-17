# Wotmed-Net Security Attack Scenarios

## 1. Overview

This document defines the controlled security attack scenarios used to validate the Wotmed-Net application-layer active defense mechanisms.

The scenarios are designed for:

* Automated security testing
* Defense validation
* Repeatable execution
* Evidence collection
* Final project demonstration

All scenarios are executed against the local Wotmed-Net test environment.

---

## 2. Test Environment

| Parameter        | Configuration                    |
| ---------------- | -------------------------------- |
| Target           | `http://localhost:3000`          |
| Endpoint         | `/api/v1/auth/login`             |
| Environment      | Local development                |
| Test Runner      | Python                           |
| Execution        | `uv run python security_test.py` |
| Timeout          | 5 seconds                        |
| Total Test Cases | 11                               |

---

## 3. Scenario Identification

The current security testing framework contains four primary scenarios.

| ID      | Scenario               | Test Cases | Primary Defense |
| ------- | ---------------------- | ---------: | --------------- |
| ATK-001 | SQL Injection          |          2 | Honeypot Block  |
| ATK-002 | Cross-Site Scripting   |          2 | Dynamic Tarpit  |
| ATK-003 | Path Traversal         |          2 | Honeypot Block  |
| ATK-004 | Controlled Brute Force |          5 | Dynamic Tarpit  |

---

# 4. ATK-001 — SQL Injection

## 4.1 Objective

Validate that Wotmed-Net can identify SQL Injection patterns in authentication requests and apply the configured blocking defense.

## 4.2 Target

```text
POST /api/v1/auth/login
```

## 4.3 Test Cases

Two SQL Injection scenarios are currently implemented:

1. SQLi Authentication Bypass
2. SQLi UNION Probe

## 4.4 Expected Behavior

The malicious request should:

1. Be inspected by Wotmed-Net.
2. Be identified as suspicious.
3. Trigger SQL Injection detection.
4. Receive the configured blocking defense.
5. Be redirected toward the honeypot defense path.

Expected result:

```text
Detection: DETECTED
Defense:   BLOCK_AND_REDIRECT_HONEYPOT
Blocking:  BLOCKED
```

## 4.5 Actual Results

### SQLi Authentication Bypass

```text
Status:    500
Detection: DETECTED
Defense:   BLOCK_AND_REDIRECT_HONEYPOT
Blocking:  BLOCKED
Result:    TEST_PASSED
```

### SQLi UNION Probe

```text
Status:    500
Detection: DETECTED
Defense:   BLOCK_AND_REDIRECT_HONEYPOT
Blocking:  BLOCKED
Result:    TEST_PASSED
```

## 4.6 Scenario Result

```text
Tests:    2
Detected: 2
Passed:   2
Failed:   0
```

**ATK-001: PASS**

---

# 5. ATK-002 — Cross-Site Scripting

## 5.1 Objective

Validate that Wotmed-Net identifies common XSS patterns and applies a containment mechanism instead of treating suspicious requests as normal traffic.

## 5.2 Target

```text
POST /api/v1/auth/login
```

## 5.3 Test Cases

Two XSS scenarios are currently implemented:

1. Basic Script Injection
2. Image Event Handler Injection

## 5.4 Expected Behavior

The malicious request should:

1. Be inspected.
2. Be identified as an XSS-related suspicious request.
3. Trigger detection.
4. Activate the autonomous dynamic tarpit.
5. Delay and contain the suspicious activity.

Expected result:

```text
Detection: DETECTED
Defense:   AUTONOMOUS_DYNAMIC_TARPIT
Blocking:  TARPITTED
```

## 5.5 Actual Results

### Basic Script Injection

```text
Status:    200
Detection: DETECTED
Defense:   AUTONOMOUS_DYNAMIC_TARPIT
Blocking:  TARPITTED
Result:    TEST_PASSED
```

### Image Event Handler Injection

```text
Status:    200
Detection: DETECTED
Defense:   AUTONOMOUS_DYNAMIC_TARPIT
Blocking:  TARPITTED
Result:    TEST_PASSED
```

## 5.6 Scenario Result

```text
Tests:    2
Detected: 2
Passed:   2
Failed:   0
```

**ATK-002: PASS**

> Note: The HTTP `200` response does not by itself indicate that the malicious request was allowed normally. The security test separately recorded the request as detected and tarpitted.

---

# 6. ATK-003 — Path Traversal

## 6.1 Objective

Validate that Wotmed-Net can identify path traversal patterns and apply the configured blocking and honeypot defense.

## 6.2 Target

```text
POST /api/v1/auth/login
```

## 6.3 Test Cases

Two Path Traversal scenarios are currently implemented:

1. Basic Path Traversal
2. Nested Path Traversal

## 6.4 Expected Behavior

The suspicious request should:

1. Be inspected.
2. Trigger Path Traversal detection.
3. Be blocked.
4. Be redirected toward the honeypot defense mechanism.

Expected result:

```text
Detection: DETECTED
Defense:   BLOCK_AND_REDIRECT_HONEYPOT
Blocking:  BLOCKED
```

## 6.5 Actual Results

### Basic Path Traversal

```text
Status:    500
Detection: DETECTED
Defense:   BLOCK_AND_REDIRECT_HONEYPOT
Blocking:  BLOCKED
Result:    TEST_PASSED
```

### Nested Path Traversal

```text
Status:    500
Detection: DETECTED
Defense:   BLOCK_AND_REDIRECT_HONEYPOT
Blocking:  BLOCKED
Result:    TEST_PASSED
```

## 6.6 Scenario Result

```text
Tests:    2
Detected: 2
Passed:   2
Failed:   0
```

**ATK-003: PASS**

---

# 7. ATK-004 — Controlled Brute Force

## 7.1 Objective

Validate behavioral detection of repeated authentication attempts and confirm that the configured brute-force threshold triggers an adaptive defense.

Unlike the other attack scenarios, this test validates behavior across multiple requests rather than a single malicious payload.

## 7.2 Target

```text
POST /api/v1/auth/login
```

## 7.3 Test Design

The scenario performs five controlled authentication attempts.

The expected behavior is:

```text
Attempts 1–4
     ↓
Below Detection Threshold
     ↓
ALLOW

Attempt 5
     ↓
Threshold Reached
     ↓
DETECTED
     ↓
AUTONOMOUS_DYNAMIC_TARPIT
```

## 7.4 Actual Results

| Attempt | Detection    | Defense                   | Blocking    | Result |
| ------: | ------------ | ------------------------- | ----------- | ------ |
|       1 | NOT_DETECTED | ALLOW                     | NOT_BLOCKED | PASS   |
|       2 | NOT_DETECTED | ALLOW                     | NOT_BLOCKED | PASS   |
|       3 | NOT_DETECTED | ALLOW                     | NOT_BLOCKED | PASS   |
|       4 | NOT_DETECTED | ALLOW                     | NOT_BLOCKED | PASS   |
|       5 | DETECTED     | AUTONOMOUS_DYNAMIC_TARPIT | TARPITTED   | PASS   |

## 7.5 Threshold Validation

The fifth attempt successfully triggered the configured defensive response.

```text
Defense Triggered: YES
Threshold Detected: YES
Suite Status: TEST_PASSED
```

## 7.6 Scenario Result

```text
Attempts:          5
Detected:          1
Passed:            5
Failed:            0
Defense Triggered: YES
```

**ATK-004: PASS**

The 20% detection rate for this scenario is expected because the test is designed to trigger detection only when the configured threshold is reached.

---

# 8. Scenario Coverage Summary

| ID        | Scenario               |  Tests | Detected | Passed | Failed |
| --------- | ---------------------- | -----: | -------: | -----: | -----: |
| ATK-001   | SQL Injection          |      2 |        2 |      2 |      0 |
| ATK-002   | Cross-Site Scripting   |      2 |        2 |      2 |      0 |
| ATK-003   | Path Traversal         |      2 |        2 |      2 |      0 |
| ATK-004   | Controlled Brute Force |      5 |        1 |      5 |      0 |
| **Total** | **4 Scenarios**        | **11** |    **7** | **11** |  **0** |

---

# 9. Expected Defense Mapping

The current scenario-to-defense mapping is:

| Scenario       | Expected Defense       | Observed  |
| -------------- | ---------------------- | --------- |
| SQL Injection  | Honeypot Block         | Confirmed |
| XSS            | Dynamic Tarpit         | Confirmed |
| Path Traversal | Honeypot Block         | Confirmed |
| Brute Force    | Threshold-based Tarpit | Confirmed |

---

# 10. Scenario Execution Process

Each scenario follows the same general process:

```text
Scenario Selection
       ↓
Payload / Request Generation
       ↓
HTTP Request
       ↓
Wotmed-Net Inspection
       ↓
Detection
       ↓
Threat Evaluation
       ↓
Defense Selection
       ↓
Defense Execution
       ↓
Observed Result
       ↓
Expected vs Actual Comparison
       ↓
PASS / FAIL
```

---

# 11. Test Result Criteria

A scenario passes when its observed behavior satisfies its defined security objective.

### Detection-Based Test

```text
Expected: DETECTED
Observed: DETECTED
Result:   PASS
```

### Blocking Test

```text
Expected: BLOCKED
Observed: BLOCKED
Result:   PASS
```

### Tarpit Test

```text
Expected: TARPITTED
Observed: TARPITTED
Result:   PASS
```

### Threshold Test

```text
Expected:
Attempts 1–4 → ALLOW
Attempt 5    → DETECTED + TARPIT

Observed:
Attempts 1–4 → ALLOW
Attempt 5    → DETECTED + TARPIT

Result: PASS
```

---

# 12. Legitimate Traffic Consideration

The current brute-force scenario provides limited validation that activity below the configured threshold is not immediately blocked.

However, this should not be considered a complete legitimate-traffic or false-positive assessment.

A comprehensive baseline should include representative normal requests such as:

* Normal authentication
* Normal user input
* Normal API requests
* Repeated legitimate actions
* Common application navigation

A formal false-positive rate was not calculated from the current 11-test execution.

---

# 13. Safety Boundaries

The attack scenarios are executed within controlled boundaries.

### Environment

Testing is performed against the local development instance.

### Payloads

Payloads are predefined and controlled.

### Scope

Testing is limited to the configured application endpoint.

### Non-Destructive Approach

The scenarios are designed to test detection and defense behavior without intentionally damaging application data.

### Reproducibility

The same scenarios can be executed repeatedly using the automated testing framework.

---

# 14. Evidence Collection

Evidence is collected from the automated testing framework.

The framework records:

* Test name
* Attack category
* HTTP status
* Detection status
* Defense action
* Blocking/containment status
* Response time
* Expected result
* Actual result
* Test status

Generated reports:

```text
security-tests/results/security_test_results.json
security-tests/results/security_test_results.csv
```

---

# 15. Current Limitations

The current scenarios provide coverage for four application-layer attack categories.

They do not represent complete application security testing.

Additional scenarios can be added for:

* Command Injection
* CSRF
* Authentication security
* Authorization
* Session management
* API abuse
* Header manipulation
* Rate limiting
* Additional XSS variants
* Additional SQL Injection variants
* Larger behavioral attack sequences

---

# 16. Future Scenario Expansion

Future versions of the framework can add:

1. Command Injection scenarios
2. Authentication bypass variations
3. Authorization testing
4. Session security scenarios
5. API abuse scenarios
6. CSRF scenarios
7. Header anomaly testing
8. Larger brute-force campaigns
9. Legitimate traffic baseline scenarios
10. Regression scenarios for previously fixed vulnerabilities

---

# 17. Final Scenario Status

The current attack-scenario suite is implemented and validated for the defined scope.

```text
ATK-001 SQL Injection       : PASS
ATK-002 XSS                 : PASS
ATK-003 Path Traversal      : PASS
ATK-004 Brute Force         : PASS

Total Test Cases            : 11
Passed                      : 11
Failed                      : 0
```

The completed scenarios provide repeatable evidence that the tested Wotmed-Net defense mechanisms respond according to their defined behavior.
