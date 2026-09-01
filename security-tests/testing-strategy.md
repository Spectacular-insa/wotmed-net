# Wotmed-Net Security Testing Strategy

## 1. Purpose

This document defines the security testing strategy for Wotmed-Net.

The purpose of the strategy is to systematically evaluate the ability of the Wotmed-Net active defense middleware to detect, analyze, respond to, and record application-layer security threats.

Testing will be performed in a controlled project environment using reproducible attack scenarios and automated testing where practical.

The strategy focuses on validating both security behavior and operational telemetry.

---

## 2. Testing Scope

The security testing scope includes the following application-layer attack categories:

* SQL Injection
* Cross-Site Scripting (XSS)
* Path Traversal
* Brute-Force Authentication Attempts

The testing process will evaluate:

* Request inspection
* Threat detection
* Threat classification
* Threat scoring
* Defense decisions
* Blocking behavior
* Response latency
* Telemetry generation
* IP reputation updates
* Security event persistence

Testing will be limited to the authorized Wotmed-Net development/test environment.

---

## 3. Test Environment

Security tests will be executed against the Wotmed-Net controlled test environment.

The environment may contain the following components:

```text
Security Test Scripts
        |
        v
   Test Client
        |
        v
Wotmed-Net Middleware
        |
        +----------------+
        |                |
        v                v
 Threat Detection     Defense Engine
        |                |
        +-------+--------+
                |
                v
          Telemetry Layer
                |
                v
          PostgreSQL /
             Supabase
```

The exact host, port, endpoints, database configuration, and deployment method will be documented according to the active project configuration.

---

## 4. Testing Objectives

The primary testing objectives are:

### 4.1 Detection

Determine whether malicious requests are correctly identified.

### 4.2 Classification

Determine whether detected requests are assigned to the appropriate attack category.

### 4.3 Threat Scoring

Verify that detected activity contributes correctly to the configured threat score.

### 4.4 Defense Response

Verify that Wotmed-Net performs the expected response after detecting suspicious or malicious activity.

Possible responses may include:

* Allow
* Monitor
* Detect
* Tarpit
* Block

The actual response will be compared with the configured project behavior.

### 4.5 Telemetry

Verify that security events are recorded correctly and can be consumed by the monitoring/dashboard layer.

### 4.6 Performance

Measure the time required to process security-related requests and generate the corresponding defense response.

---

## 5. Attack Categories

### 5.1 SQL Injection

The SQL Injection test will generate controlled requests containing representative SQL injection patterns.

The test will determine whether Wotmed-Net:

1. Inspects the request.
2. Detects suspicious SQL patterns.
3. Assigns the appropriate threat category.
4. Updates the threat score when applicable.
5. Applies the expected defense response.
6. Generates telemetry.

---

### 5.2 Cross-Site Scripting

The XSS test will generate controlled requests containing representative cross-site scripting patterns.

The test will determine whether Wotmed-Net:

1. Inspects the request.
2. Detects suspicious script-related input.
3. Classifies the request as XSS-related when appropriate.
4. Applies the expected defense response.
5. Generates telemetry.

---

### 5.3 Path Traversal

The Path Traversal test will generate controlled requests containing representative traversal patterns.

The test will determine whether Wotmed-Net:

1. Inspects the requested path.
2. Identifies traversal indicators.
3. Classifies the request appropriately.
4. Applies the expected defense response.
5. Generates telemetry.

---

### 5.4 Brute-Force Authentication

The brute-force test will simulate repeated authentication attempts within the controlled test environment.

The test will determine whether repeated activity:

1. Is counted correctly.
2. Contributes to the threat score when configured.
3. Triggers the appropriate defense threshold.
4. Results in blocking or another configured mitigation.
5. Generates the expected telemetry.

---

## 6. Testing Methodology

The security testing process will use the following methodology:

```text
1. Prepare Test Environment
          |
          v
2. Define Test Case
          |
          v
3. Generate Controlled Request
          |
          v
4. Send Request to Wotmed-Net
          |
          v
5. Observe Middleware Response
          |
          v
6. Inspect Threat/Defense Data
          |
          v
7. Verify Telemetry
          |
          v
8. Record Test Result
          |
          v
9. Calculate Security Metrics
```

Each test should be reproducible using the same configuration and test inputs.

---

## 7. Test Case Structure

Every security test case should contain the following information:

| Field                   | Description                               |
| ----------------------- | ----------------------------------------- |
| Test ID                 | Unique identifier                         |
| Attack Type             | SQLi, XSS, Path Traversal, or Brute Force |
| Target                  | Endpoint or application component         |
| Input                   | Controlled test request                   |
| Expected Detection      | Whether detection is expected             |
| Expected Classification | Expected threat category                  |
| Expected Defense        | Expected mitigation                       |
| Expected Telemetry      | Expected logging behavior                 |
| Actual Result           | Observed behavior                         |
| Response Time           | Measured processing time                  |
| Status                  | PASS / FAIL                               |
| Evidence                | Supporting logs or screenshots            |

---

## 8. Expected Security Behavior

A security test is successful when the observed behavior matches the configured Wotmed-Net security policy.

For a malicious request, the expected flow is:

```text
Malicious Request
       |
       v
Request Inspection
       |
       v
Threat Detection
       |
       v
Threat Classification
       |
       v
Threat Score Update
       |
       v
Defense Decision
       |
       +-------> Allow / Monitor
       |
       +-------> Tarpit
       |
       +-------> Block
       |
       v
Telemetry Generation
```

The exact defense action depends on the implemented Wotmed-Net configuration and threat thresholds.

---

## 9. Pass / Fail Criteria

### PASS

A test will be considered PASS when the system demonstrates the expected behavior defined by the test case.

Examples include:

* The malicious request is detected when detection is expected.
* The correct attack category is identified.
* The expected threat score change occurs.
* The expected defense response is applied.
* Telemetry is generated correctly.
* The recorded result is consistent with the configured security policy.

### FAIL

A test will be considered FAIL when one or more critical expected behaviors are not achieved.

Examples include:

* A malicious request is not detected when detection is required.
* Incorrect attack classification occurs.
* The expected defense action is not applied.
* Threat information is not updated correctly.
* Required telemetry is missing.
* The middleware produces an unexpected security response.

A failure will be documented rather than hidden or manually corrected in the results.

---

## 10. Security Metrics

The testing process will calculate measurable security metrics.

### 10.1 Detection Rate

Detection Rate measures the percentage of malicious test requests correctly detected.

```text
Detection Rate =
Correctly Detected Malicious Requests
------------------------------------- × 100
Total Malicious Test Requests
```

### 10.2 False Positive Ratio

False Positive Ratio measures legitimate requests incorrectly identified as malicious.

```text
False Positive Ratio =
Legitimate Requests Incorrectly Detected
---------------------------------------- × 100
Total Legitimate Requests
```

### 10.3 Response Latency

Response latency measures the time between submitting a test request and receiving the corresponding application/security response.

```text
Response Latency =
Response Timestamp - Request Timestamp
```

Latency should be recorded consistently using the same measurement method.

### 10.4 Blocking Effectiveness

Blocking effectiveness measures whether requests that satisfy the configured blocking conditions are actually prevented.

```text
Blocking Effectiveness =
Successfully Blocked Qualifying Requests
---------------------------------------- × 100
Total Qualifying Malicious Requests
```

### 10.5 Telemetry Success Rate

Telemetry success rate measures whether expected security events are successfully recorded.

```text
Telemetry Success Rate =
Successfully Recorded Security Events
------------------------------------- × 100
Expected Security Events
```

---

## 11. Evidence Collection

Every important security test should produce supporting evidence.

Evidence may include:

* HTTP request and response information
* Middleware logs
* Threat score information
* IP reputation records
* Database records
* Telemetry records
* Dashboard screenshots
* Test script output
* Response timing measurements

Evidence will be associated with the corresponding test ID whenever possible.

---

## 12. Automated Testing Strategy

Security testing should be automated where practical.

The automated testing layer will be responsible for:

* Generating controlled requests
* Executing predefined test cases
* Collecting HTTP responses
* Measuring response latency
* Recording detection outcomes
* Comparing actual and expected results
* Producing structured test output

Python and/or Bash may be used for test automation depending on the final implementation.

The automation must operate only against authorized project environments.

---

## 13. Test Isolation and Safety

Security testing must not be performed against unauthorized systems.

The testing environment should be isolated from production systems unless explicit authorization and appropriate safeguards are available.

Tests should avoid:

* Destructive database operations
* Permanent data modification
* Unauthorized external targets
* Real credential attacks
* Uncontrolled traffic generation
* Denial-of-service behavior

The objective is to validate the defense mechanism, not to damage the target system.

---

## 14. Test Execution Order

The recommended execution order is:

```text
Phase 1
Environment Verification
        |
        v
Phase 2
Baseline / Legitimate Requests
        |
        v
Phase 3
SQL Injection Testing
        |
        v
Phase 4
XSS Testing
        |
        v
Phase 5
Path Traversal Testing
        |
        v
Phase 6
Brute-Force Testing
        |
        v
Phase 7
Defense Validation
        |
        v
Phase 8
Telemetry Verification
        |
        v
Phase 9
Metrics Calculation
        |
        v
Phase 10
Final Security Report
```

---

## 15. Test Completion Criteria

Security testing will be considered complete when:

* All defined attack categories have been tested.
* Automated tests execute reproducibly.
* Expected defense behavior has been evaluated.
* Detection results have been recorded.
* Response latency has been measured.
* Telemetry has been verified.
* False-positive testing has been performed.
* Blocking behavior has been evaluated.
* Test evidence has been collected.
* Final results have been documented.

---

## 16. Relationship With Other Security Testing Documents

This strategy document defines the overall testing approach.

The remaining security testing documents have the following responsibilities:

```text
testing-strategy.md
        |
        +----> Defines HOW testing is performed
        |
        v
attack-scenarios.md
        |
        +----> Defines WHAT attacks are tested
        |
        v
automated-testing.md
        |
        +----> Defines HOW tests are automated
        |
        v
defense-validation.md
        |
        +----> Defines HOW defense behavior is verified
        |
        v
test-results.md
        |
        +----> Records ACTUAL test results
```

These documents should remain consistent with the actual Wotmed-Net implementation.

---

## 17. Strategy Summary

The Wotmed-Net security testing strategy combines controlled attack simulation, automated request generation, defense validation, telemetry verification, and measurable security metrics.

The objective is not simply to demonstrate that an attack request receives a response.

The objective is to provide measurable evidence that Wotmed-Net can:

```text
Detect
  ↓
Classify
  ↓
Score
  ↓
Respond
  ↓
Block when required
  ↓
Record telemetry
  ↓
Support security analysis
```

All final claims about security effectiveness will be based on observed test results rather than assumptions.
