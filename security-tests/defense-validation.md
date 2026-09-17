# Wotmed-Net Defense Validation

## 1. Overview

This document presents the validation of the Wotmed-Net application-layer active defense mechanisms against controlled security attack scenarios.

The validation focuses on whether Wotmed-Net can:

* Detect suspicious application-layer requests
* Assign an appropriate defensive response
* Block or contain malicious activity
* Apply adaptive defenses based on detected threat behavior
* Maintain successful request processing during controlled testing
* Trigger brute-force protection at the configured threshold

The validation was performed using the automated security testing framework located in the `security-tests/` directory.

---

## 2. Validation Objectives

The primary objectives were to validate:

1. SQL Injection detection and defense
2. Cross-Site Scripting (XSS) detection and defense
3. Path Traversal detection and defense
4. Controlled brute-force threshold detection
5. Correct defensive action selection
6. Request processing reliability
7. Response-time behavior during security testing

---

## 3. Test Environment

| Component         | Configuration                          |
| ----------------- | -------------------------------------- |
| Project           | Wotmed-Net                             |
| Test Target       | `http://localhost:3000`                |
| Endpoint          | `/api/v1/auth/login`                   |
| Testing Framework | Python automated security tester       |
| Python Execution  | `uv run python`                        |
| Timeout           | 5 seconds                              |
| Test Categories   | SQLi, XSS, Path Traversal, Brute Force |
| Total Test Cases  | 11                                     |

The tests were executed against the locally running Wotmed-Net application under controlled conditions.

---

## 4. Defense Decision Model

Wotmed-Net uses threat scoring to determine the appropriate defensive response.

The configured response model is:

| Threat Level | Defense Response                               |
| ------------ | ---------------------------------------------- |
| Clean        | Allow request                                  |
| Warning      | Allow with warning/monitoring                  |
| Tarpit       | Delay and contain suspicious activity          |
| Block        | Block and redirect the request to the honeypot |

The security testing framework validates both the detection decision and the resulting defense action.

---

## 5. Validation Methodology

Each security test follows a controlled process:

```text
Attack Payload
      ↓
Application Request
      ↓
Wotmed-Net Inspection
      ↓
Threat Detection
      ↓
Threat Score / Decision
      ↓
Defense Action
      ↓
Blocking or Containment
      ↓
Test Result Evaluation
```

A test is considered successful when the observed behavior matches the expected security behavior defined for that scenario.

---

## 6. Validation Results

The automated security test suite executed **11 security test cases**.

| Category             |  Tests | Detected | Passed | Detection Rate |
| -------------------- | -----: | -------: | -----: | -------------: |
| SQL Injection        |      2 |        2 |      2 |           100% |
| Cross-Site Scripting |      2 |        2 |      2 |           100% |
| Path Traversal       |      2 |        2 |      2 |           100% |
| Brute Force          |      5 |        1 |      5 |            20% |
| **Total**            | **11** |    **7** | **11** |     **63.64%** |

### Overall Test Status

* **Total Tests:** 11
* **Passed:** 11
* **Failed:** 0
* **Request Failures:** 0
* **Detected Requests:** 7
* **Request Success Rate:** 100%
* **Overall Detection Rate:** 63.64%
* **Average Response Time:** 0.6768 seconds

The 63.64% figure represents the proportion of requests detected as suspicious within this specific test suite. It should not be interpreted as a general security-effectiveness percentage.

---

## 7. SQL Injection Validation

Two controlled SQL Injection scenarios were executed:

### SQLi Authentication Bypass

Observed behavior:

```text
Status: 500
Detection: DETECTED
Defense: BLOCK_AND_REDIRECT_HONEYPOT
Blocking: BLOCKED
Result: TEST_PASSED
```

### SQLi UNION Probe

Observed behavior:

```text
Status: 500
Detection: DETECTED
Defense: BLOCK_AND_REDIRECT_HONEYPOT
Blocking: BLOCKED
Result: TEST_PASSED
```

### Validation Result

Both SQL Injection scenarios were detected and blocked.

**Result: 2/2 tests passed.**

---

## 8. Cross-Site Scripting Validation

Two controlled XSS scenarios were executed.

### Basic Script Injection

Observed behavior:

```text
Status: 200
Detection: DETECTED
Defense: AUTONOMOUS_DYNAMIC_TARPIT
Blocking: TARPITTED
Result: TEST_PASSED
```

### Image Event Handler Injection

Observed behavior:

```text
Status: 200
Detection: DETECTED
Defense: AUTONOMOUS_DYNAMIC_TARPIT
Blocking: TARPITTED
Result: TEST_PASSED
```

### Validation Result

Both XSS scenarios were detected and contained using the autonomous dynamic tarpit defense.

**Result: 2/2 tests passed.**

The HTTP `200` response does not mean that the malicious request was considered safe. The security decision was determined from the explicit detection and defense results produced by the testing framework.

---

## 9. Path Traversal Validation

Two controlled Path Traversal scenarios were executed.

### Basic Path Traversal

Observed behavior:

```text
Status: 500
Detection: DETECTED
Defense: BLOCK_AND_REDIRECT_HONEYPOT
Blocking: BLOCKED
Result: TEST_PASSED
```

### Nested Path Traversal

Observed behavior:

```text
Status: 500
Detection: DETECTED
Defense: BLOCK_AND_REDIRECT_HONEYPOT
Blocking: BLOCKED
Result: TEST_PASSED
```

### Validation Result

Both Path Traversal scenarios were detected and blocked.

**Result: 2/2 tests passed.**

---

## 10. Brute-Force Threshold Validation

The brute-force scenario used five controlled authentication attempts.

The expected behavior was that the first four attempts would remain below the configured detection threshold, while the fifth attempt would trigger the defensive mechanism.

| Attempt | Detection    | Defense                   | Result |
| ------- | ------------ | ------------------------- | ------ |
| 1       | NOT_DETECTED | ALLOW                     | PASSED |
| 2       | NOT_DETECTED | ALLOW                     | PASSED |
| 3       | NOT_DETECTED | ALLOW                     | PASSED |
| 4       | NOT_DETECTED | ALLOW                     | PASSED |
| 5       | DETECTED     | AUTONOMOUS_DYNAMIC_TARPIT | PASSED |

The fifth attempt successfully triggered the expected defense.

### Validation Result

**5/5 brute-force test steps passed.**

The category's 20% detection rate is expected because the test was specifically designed to verify threshold behavior. Detection of all five attempts was not the expected outcome.

---

## 11. Defense Action Validation

The observed defense actions were:

| Attack Category | Observed Defense               |
| --------------- | ------------------------------ |
| SQL Injection   | Block and Redirect to Honeypot |
| XSS             | Autonomous Dynamic Tarpit      |
| Path Traversal  | Block and Redirect to Honeypot |
| Brute Force     | Autonomous Dynamic Tarpit      |

This demonstrates that different attack patterns can result in different defensive responses rather than using a single response for every suspicious request.

---

## 12. Request Reliability and Response Time

All 11 security test requests were successfully processed by the application.

```text
Request Success Rate: 100%
Request Failures: 0
Average Response Time: 0.6768 seconds
```

Response times varied depending on the applied defense.

In particular, tarpit responses took longer than normal allowed requests, which is consistent with the purpose of a tarpit mechanism: slowing suspicious activity while keeping the attacker contained.

The measured average response time represents this specific local test execution and should not be treated as a production performance benchmark.

---

## 13. Evidence and Generated Reports

The automated testing framework generated machine-readable result files:

```text
security-tests/results/security_test_results.json
security-tests/results/security_test_results.csv
```

These files provide structured evidence of:

* Test cases
* Detection results
* Defense actions
* Blocking/containment results
* Response status
* Response time
* Overall test status

The console output also provides a human-readable summary suitable for demonstration and presentation.

---

## 14. Validation Findings

The completed validation produced the following findings:

### Finding 1 — SQL Injection

Both tested SQL Injection payloads were detected and blocked.

### Finding 2 — XSS

Both tested XSS payloads were detected and contained using the dynamic tarpit mechanism.

### Finding 3 — Path Traversal

Both tested Path Traversal payloads were detected and blocked.

### Finding 4 — Brute Force

The configured brute-force threshold was successfully triggered on the fifth controlled attempt.

### Finding 5 — Request Reliability

All 11 requests were processed successfully during the test execution.

---

## 15. Validation Limitations

This validation has several important limitations.

### 15.1 Controlled Test Scope

The tests were performed against a local development instance and a limited set of controlled payloads.

The results therefore demonstrate behavior for the tested scenarios and do not represent complete coverage of all possible attacks.

### 15.2 Limited Attack Categories

The current automated suite covers:

* SQL Injection
* Cross-Site Scripting
* Path Traversal
* Controlled Brute Force

Other attack categories require additional testing.

### 15.3 False-Positive Measurement

A formal false-positive rate was not calculated in this execution because a sufficiently large legitimate-traffic dataset was not included in the 11-test automated run.

### 15.4 Telemetry Validation

The automated output confirms detection and defense decisions, but an independent end-to-end telemetry validation was not included in this particular test execution.

### 15.5 IP Reputation Validation

IP reputation and external reputation-source behavior were not independently measured in this test run.

---

## 16. Future Validation Improvements

Future testing can extend the validation framework with:

* Larger legitimate-traffic datasets
* False-positive and false-negative measurement
* Additional SQL Injection techniques
* Additional XSS variants
* Command Injection testing
* Authentication and authorization testing
* API abuse testing
* Rate-limit testing
* Session security testing
* Header manipulation testing
* IP reputation validation
* Telemetry persistence verification
* Continuous security testing through CI/CD
* Larger-scale performance testing

---

## 17. Conclusion

The completed automated security validation successfully executed **11 controlled security tests**, with **11 tests passing and 0 tests failing**.

The test suite detected:

* 2/2 SQL Injection scenarios
* 2/2 XSS scenarios
* 2/2 Path Traversal scenarios
* 1/5 brute-force attempts, with the fifth attempt correctly triggering the configured threshold defense

The observed defense mechanisms included:

* Blocking and honeypot redirection
* Autonomous dynamic tarpitting
* Allow behavior for traffic that remained below the configured detection threshold

The validation therefore confirms that the implemented Wotmed-Net defense mechanisms responded according to the expected behavior for the tested attack scenarios.

The generated JSON and CSV reports provide additional machine-readable evidence for review, documentation, and final project presentation.
