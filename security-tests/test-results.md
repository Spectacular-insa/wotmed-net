# Wotmed-Net Security Test Results

## 1. Overview

This document records the results of the automated security testing performed against the Wotmed-Net application.

The test suite validates the application's ability to detect and respond to selected application-layer attack patterns using controlled security test cases.

Testing was performed against the locally running Wotmed-Net instance.

---

## 2. Test Configuration

| Parameter      | Value                             |
| -------------- | --------------------------------- |
| Target         | `http://localhost:3000`           |
| Endpoint       | `/api/v1/auth/login`              |
| Test Framework | Python Security Testing Framework |
| Execution      | `uv run python security_test.py`  |
| Timeout        | 5 seconds                         |
| Total Tests    | 11                                |

---

## 3. Test Execution

The security testing framework was executed from:

```text
security-tests/scripts/
```

Command used:

```bash
uv run python security_test.py
```

The framework automatically executed the configured attack scenarios and evaluated:

* Detection
* Defense action
* Blocking or containment
* Request status
* Response time
* Expected versus observed behavior

---

## 4. Overall Results

| Metric                 |         Result |
| ---------------------- | -------------: |
| Total Security Tests   |             11 |
| Tests Passed           |             11 |
| Tests Failed           |              0 |
| Request Failures       |              0 |
| Detected Requests      |              7 |
| Request Success Rate   |           100% |
| Overall Detection Rate |         63.64% |
| Average Response Time  | 0.6768 seconds |

### Overall Status

**TEST SUITE: PASSED**

All 11 test cases produced the expected test outcome.

---

## 5. Category Results

| Category             |  Tests | Detected | Passed | Failed | Detection Rate |
| -------------------- | -----: | -------: | -----: | -----: | -------------: |
| SQL Injection        |      2 |        2 |      2 |      0 |           100% |
| Cross-Site Scripting |      2 |        2 |      2 |      0 |           100% |
| Path Traversal       |      2 |        2 |      2 |      0 |           100% |
| Brute Force          |      5 |        1 |      5 |      0 |            20% |
| **Total**            | **11** |    **7** | **11** |  **0** |     **63.64%** |

The detection rate describes the proportion of requests that were marked as detected within this particular test suite. It is not a general measure of the security effectiveness of the entire Wotmed-Net platform.

---

## 6. SQL Injection Results

### Test 1 — SQLi Authentication Bypass

| Field       | Result                      |
| ----------- | --------------------------- |
| Test        | SQLi Authentication Bypass  |
| HTTP Status | 500                         |
| Detection   | DETECTED                    |
| Defense     | BLOCK_AND_REDIRECT_HONEYPOT |
| Blocking    | BLOCKED                     |
| Result      | TEST_PASSED                 |

### Test 2 — SQLi UNION Probe

| Field       | Result                      |
| ----------- | --------------------------- |
| Test        | SQLi UNION Probe            |
| HTTP Status | 500                         |
| Detection   | DETECTED                    |
| Defense     | BLOCK_AND_REDIRECT_HONEYPOT |
| Blocking    | BLOCKED                     |
| Result      | TEST_PASSED                 |

### SQL Injection Summary

```text
Tests:      2
Detected:   2
Passed:     2
Failed:     0
```

**Category Result: PASS**

---

## 7. Cross-Site Scripting Results

### Test 3 — Basic Script Injection

| Field       | Result                    |
| ----------- | ------------------------- |
| Test        | Basic Script Injection    |
| HTTP Status | 200                       |
| Detection   | DETECTED                  |
| Defense     | AUTONOMOUS_DYNAMIC_TARPIT |
| Blocking    | TARPITTED                 |
| Result      | TEST_PASSED               |

### Test 4 — Image Event Handler Injection

| Field       | Result                        |
| ----------- | ----------------------------- |
| Test        | Image Event Handler Injection |
| HTTP Status | 200                           |
| Detection   | DETECTED                      |
| Defense     | AUTONOMOUS_DYNAMIC_TARPIT     |
| Blocking    | TARPITTED                     |
| Result      | TEST_PASSED                   |

### XSS Summary

```text
Tests:      2
Detected:   2
Passed:     2
Failed:     0
```

**Category Result: PASS**

The `200` HTTP status does not indicate that the malicious requests were allowed as normal traffic. The security tester separately recorded the requests as detected and tarpitted.

---

## 8. Path Traversal Results

### Test 5 — Basic Path Traversal

| Field       | Result                      |
| ----------- | --------------------------- |
| Test        | Basic Path Traversal        |
| HTTP Status | 500                         |
| Detection   | DETECTED                    |
| Defense     | BLOCK_AND_REDIRECT_HONEYPOT |
| Blocking    | BLOCKED                     |
| Result      | TEST_PASSED                 |

### Test 6 — Nested Path Traversal

| Field       | Result                      |
| ----------- | --------------------------- |
| Test        | Nested Path Traversal       |
| HTTP Status | 500                         |
| Detection   | DETECTED                    |
| Defense     | BLOCK_AND_REDIRECT_HONEYPOT |
| Blocking    | BLOCKED                     |
| Result      | TEST_PASSED                 |

### Path Traversal Summary

```text
Tests:      2
Detected:   2
Passed:     2
Failed:     0
```

**Category Result: PASS**

---

## 9. Brute-Force Results

The brute-force test consisted of five controlled authentication attempts.

The purpose was to verify that normal attempts below the configured threshold remain allowed while repeated suspicious activity eventually triggers a defensive response.

| Attempt | Detection    | Defense                   | Blocking    | Result      |
| ------: | ------------ | ------------------------- | ----------- | ----------- |
|       1 | NOT_DETECTED | ALLOW                     | NOT_BLOCKED | TEST_PASSED |
|       2 | NOT_DETECTED | ALLOW                     | NOT_BLOCKED | TEST_PASSED |
|       3 | NOT_DETECTED | ALLOW                     | NOT_BLOCKED | TEST_PASSED |
|       4 | NOT_DETECTED | ALLOW                     | NOT_BLOCKED | TEST_PASSED |
|       5 | DETECTED     | AUTONOMOUS_DYNAMIC_TARPIT | TARPITTED   | TEST_PASSED |

### Brute-Force Summary

```text
Total Attempts:       5
Detected Attempts:    1
Passed Attempts:      5
Failed Attempts:      0
Defense Triggered:    YES
Threshold Detected:   YES
```

**Category Result: PASS**

The 20% detection rate is intentional in this test. The test expected the first four attempts to remain below the threshold and the fifth attempt to trigger the defense.

---

## 10. Defense Actions Observed

The test execution demonstrated multiple defense responses.

| Attack         | Defense Action                 | Result    |
| -------------- | ------------------------------ | --------- |
| SQL Injection  | Block and Redirect to Honeypot | Blocked   |
| XSS            | Autonomous Dynamic Tarpit      | Tarpitted |
| Path Traversal | Block and Redirect to Honeypot | Blocked   |
| Brute Force    | Autonomous Dynamic Tarpit      | Tarpitted |

This demonstrates that Wotmed-Net applies different defensive responses according to the detected activity.

---

## 11. Response-Time Results

The complete test suite recorded an average response time of:

```text
0.6768 seconds
```

Individual requests showed different response times depending on the defense mechanism.

Normal allowed requests generally completed quickly, while tarpit responses introduced additional delay.

The response-time measurement is specific to this local execution environment and should not be interpreted as a production performance benchmark.

---

## 12. Request Reliability

All requests generated during the test suite were successfully processed.

```text
Total Requests:      11
Successful Requests: 11
Failed Requests:     0
Success Rate:        100%
```

This means the automated security-testing framework successfully communicated with the target application throughout the test execution.

---

## 13. Test Case Summary

| ID      | Test Case                     | Detection    | Defense        | Result |
| ------- | ----------------------------- | ------------ | -------------- | ------ |
| ATK-001 | SQLi Authentication Bypass    | DETECTED     | Honeypot Block | PASS   |
| ATK-001 | SQLi UNION Probe              | DETECTED     | Honeypot Block | PASS   |
| ATK-002 | Basic Script Injection        | DETECTED     | Dynamic Tarpit | PASS   |
| ATK-002 | Image Event Handler Injection | DETECTED     | Dynamic Tarpit | PASS   |
| ATK-003 | Basic Path Traversal          | DETECTED     | Honeypot Block | PASS   |
| ATK-003 | Nested Path Traversal         | DETECTED     | Honeypot Block | PASS   |
| ATK-004 | Brute Force Attempt 1         | NOT_DETECTED | Allow          | PASS   |
| ATK-004 | Brute Force Attempt 2         | NOT_DETECTED | Allow          | PASS   |
| ATK-004 | Brute Force Attempt 3         | NOT_DETECTED | Allow          | PASS   |
| ATK-004 | Brute Force Attempt 4         | NOT_DETECTED | Allow          | PASS   |
| ATK-004 | Brute Force Attempt 5         | DETECTED     | Dynamic Tarpit | PASS   |

---

## 14. Generated Evidence

The testing framework generated the following machine-readable reports:

```text
security-tests/results/security_test_results.json
security-tests/results/security_test_results.csv
```

### JSON Report

The JSON report provides structured test information that can be consumed by other tools or used for later analysis.

### CSV Report

The CSV report provides tabular test data suitable for:

* Spreadsheet analysis
* Result filtering
* Presentation preparation
* Further statistical analysis

---

## 15. Evidence Classification

The current test execution directly verifies:

* Attack detection
* Defense decision
* Blocking/containment behavior
* Request success
* Response time
* Expected test outcome

The following were **not independently measured in this specific 11-test execution**:

* Formal false-positive rate
* Formal false-negative rate
* External IP reputation validation
* End-to-end telemetry persistence
* Large-scale performance under load
* Production-scale attack coverage

These areas are therefore treated as future validation work rather than reported as completed measurements.

---

## 16. Limitations

The results should be interpreted within the scope of the current testing environment.

The suite contains a limited number of controlled payloads and focuses on four attack categories. Passing these tests does not establish that the system is protected against every possible implementation or variation of these attacks.

Additional testing is required for broader security assurance.

---

## 17. Recommended Future Test Coverage

Future versions of the security testing framework can include:

1. Additional SQL Injection payload variations
2. Stored and reflected XSS scenarios
3. Command Injection
4. Authentication bypass techniques
5. Authorization testing
6. Session security testing
7. API abuse
8. Rate-limit testing
9. Header manipulation
10. CSRF testing
11. Larger brute-force datasets
12. Legitimate traffic baselines
13. False-positive measurement
14. Telemetry persistence verification
15. Performance and load testing

---

## 18. Final Test Status

```text
============================================================
WOTMED-NET SECURITY TEST REPORT
============================================================

Total Security Tests : 11
Tests Passed         : 11
Tests Failed         : 0
Request Failures     : 0
Detected Tests       : 7
Detection Rate       : 63.64%
Request Success Rate : 100.00%
Average Response     : 0.6768s

Overall Result       : PASS
============================================================
```

The completed test execution confirms that all 11 defined security test cases achieved their expected test outcomes under the controlled local testing environment.

The results provide documented evidence of Wotmed-Net's current detection and adaptive defense behavior for the tested SQL Injection, XSS, Path Traversal, and controlled brute-force scenarios.
