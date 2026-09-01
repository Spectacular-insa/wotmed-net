# Wotmed-Net Attack Scenarios

## 1. Overview

This document defines the controlled application-layer attack scenarios used to evaluate the Wotmed-Net active defense middleware.

The scenarios are designed for authorized testing within the Wotmed-Net development or test environment.

Each scenario defines:

* Attack category
* Test objective
* Test conditions
* Controlled request examples
* Expected detection
* Expected defense behavior
* Expected telemetry
* Pass/fail criteria

The scenarios are intentionally non-destructive and are designed to validate security controls rather than compromise or damage the test environment.

---

# 2. Scenario Identification

| ID      | Attack Category            | Priority |
| ------- | -------------------------- | -------- |
| ATK-001 | SQL Injection              | High     |
| ATK-002 | Cross-Site Scripting (XSS) | High     |
| ATK-003 | Path Traversal             | High     |
| ATK-004 | Brute-Force Authentication | High     |

---

# 3. ATK-001 — SQL Injection

## 3.1 Objective

Determine whether Wotmed-Net detects suspicious SQL injection patterns contained in HTTP requests.

## 3.2 Target

The test should target an authorized Wotmed-Net-protected application endpoint that accepts user-controlled parameters.

Example:

```text
GET /api/test?search=<controlled-payload>
```

The exact endpoint must be replaced with an endpoint that actually exists in the Wotmed-Net test environment.

## 3.3 Controlled Test Inputs

Representative non-destructive SQL injection indicators may include:

```text
' OR '1'='1
```

```text
' UNION SELECT NULL--
```

```text
admin'--
```

These inputs are used only as detection probes.

They should not be used to modify, delete, or extract real data.

## 3.4 Expected Detection

Wotmed-Net should identify requests containing configured SQL injection indicators.

Expected classification:

```text
Attack Type: SQL Injection
Detection: TRUE
```

## 3.5 Expected Defense

The actual response must follow the configured Wotmed-Net defense policy.

Possible outcomes include:

```text
Detection
    ↓
Threat Score Update
    ↓
Defense Decision
    ↓
Monitor / Tarpit / Block
```

The test must record the actual response instead of assuming that every SQL injection request will immediately be blocked.

## 3.6 Expected Telemetry

The system should generate an appropriate security event containing, where supported:

* Source IP
* Attack category
* Threat score
* Timestamp
* Request information
* Defense action
* Blocking status

## 3.7 Pass Criteria

The test passes when the configured SQL injection detection behavior occurs and the expected security telemetry is generated.

---

# 4. ATK-002 — Cross-Site Scripting (XSS)

## 4.1 Objective

Determine whether Wotmed-Net identifies requests containing common XSS indicators.

## 4.2 Target

The test should target an authorized endpoint that accepts user-controlled input.

Example:

```text
GET /api/test?query=<controlled-payload>
```

## 4.3 Controlled Test Inputs

Representative XSS detection probes may include:

```html
<script>alert(1)</script>
```

```html
<img src=x onerror=alert(1)>
```

```text
javascript:alert(1)
```

These payloads are used as controlled detection probes and should not be executed against real users or production systems.

## 4.4 Expected Detection

Expected classification:

```text
Attack Type: XSS
Detection: TRUE
```

## 4.5 Expected Defense

The observed response should be compared with the configured defense policy.

The test should determine whether the request is:

* Detected
* Monitored
* Delayed
* Blocked

## 4.6 Expected Telemetry

The security telemetry should record the event where supported.

Relevant information includes:

* Source IP
* Attack category
* Timestamp
* Threat score
* Defense action
* Request information

## 4.7 Pass Criteria

The test passes when the configured XSS detection behavior is observed and the corresponding security event is correctly recorded.

---

# 5. ATK-003 — Path Traversal

## 5.1 Objective

Determine whether Wotmed-Net identifies suspicious path traversal patterns in HTTP requests.

## 5.2 Target

The test should target an authorized application endpoint that processes a path or file-related parameter.

Example:

```text
GET /api/test?file=<controlled-payload>
```

## 5.3 Controlled Test Inputs

Representative traversal indicators may include:

```text
../../etc/passwd
```

```text
..%2F..%2Fetc%2Fpasswd
```

```text
..\..\windows\system.ini
```

These values are used only to test request inspection.

The test should not attempt to access or disclose real sensitive files.

## 5.4 Expected Detection

Expected classification:

```text
Attack Type: Path Traversal
Detection: TRUE
```

## 5.5 Expected Defense

The test should verify the configured Wotmed-Net response.

Possible actions include:

```text
Monitor
Tarpit
Block
```

The actual action must be recorded from the running system.

## 5.6 Expected Telemetry

The event should be available through the project's telemetry mechanism where supported.

Expected information may include:

* Source IP
* Requested path/parameter
* Attack category
* Threat score
* Timestamp
* Defense action

## 5.7 Pass Criteria

The test passes when the traversal indicator is handled according to the configured security policy and the relevant telemetry is available.

---

# 6. ATK-004 — Brute-Force Authentication

## 6.1 Objective

Determine whether Wotmed-Net can identify repeated authentication attempts and apply the configured threat-response mechanism.

## 6.2 Test Conditions

A dedicated test account or authentication endpoint should be used.

The test must not use real user credentials.

Example:

```text
POST /api/test-login
```

Repeated controlled authentication attempts should be generated against the test environment.

## 6.3 Test Pattern

The automated test should perform a limited number of controlled attempts.

Example:

```text
Attempt 1 → Authentication Failure
Attempt 2 → Authentication Failure
Attempt 3 → Authentication Failure
Attempt 4 → Authentication Failure
...
```

The exact number of attempts should be determined by the configured security policy.

## 6.4 Expected Detection

The system should identify repeated suspicious authentication activity when the configured threshold is reached.

Expected classification:

```text
Attack Type: Brute Force
Detection: TRUE
```

## 6.5 Expected Defense

The test should verify whether the configured mechanism:

* Increases threat score
* Applies rate limiting
* Delays requests
* Triggers a tarpit
* Blocks the source IP
* Produces another configured mitigation

The actual implementation must determine which behavior occurs.

## 6.6 Expected Telemetry

The system should record relevant authentication threat events.

Expected information may include:

* Source IP
* Attempt count
* Threat score
* Timestamp
* Attack category
* Defense action
* Blocking status

## 6.7 Pass Criteria

The test passes when repeated authentication activity produces the configured security response and the corresponding telemetry is recorded.

---

# 7. Legitimate Traffic Baseline

Security testing must also include legitimate requests.

This is necessary to measure false positives.

Example legitimate requests:

```text
GET /api/health
```

```text
GET /api/products
```

```text
GET /api/test?search=normal-query
```

The exact endpoints depend on the active test application.

Expected behavior:

```text
Legitimate Request
       ↓
No Attack Indicator
       ↓
Normal Application Response
       ↓
No Unnecessary Blocking
```

These requests will be used as a baseline for false-positive measurement.

---

# 8. Attack Scenario Execution Flow

Each scenario follows the same basic process:

```text
Initialize Test
      ↓
Verify Target
      ↓
Send Controlled Request
      ↓
Capture HTTP Response
      ↓
Inspect Wotmed-Net Behavior
      ↓
Check Threat Score
      ↓
Check Defense Action
      ↓
Verify Telemetry
      ↓
Record Result
```
---

# 9. Scenario Result Template

Each executed scenario should produce a result similar to:

| Field          | Value                 |
| -------------- | --------------------- |
| Test ID        | ATK-001               |
| Attack Type    | SQL Injection         |
| Target         | Actual test endpoint  |
| Payload        | Controlled test input |
| Detection      | PASS/FAIL             |
| Classification | Actual result         |
| Threat Score   | Actual value          |
| Defense Action | Actual action         |
| HTTP Status    | Actual status         |
| Response Time  | Measured value        |
| Telemetry      | PASS/FAIL             |
| Blocking       | PASS/FAIL/N/A         |
| Overall Result | PASS/FAIL             |

---

# 10. Test Data Handling

Test data must remain isolated from production data.

The security testing process should:

* Use dedicated test endpoints where possible.
* Use test accounts for authentication scenarios.
* Avoid real credentials.
* Avoid destructive database operations.
* Avoid sensitive production information.
* Avoid uncontrolled traffic generation.
* Clean up temporary test data after testing.

---

# 11. Safety Boundaries

The attack scenarios are intended exclusively for authorized environments.

The following activities are outside the scope of this test suite:

* Testing third-party systems without authorization
* Data destruction
* Data exfiltration
* Denial-of-service attacks
* Credential theft
* Malware deployment
* Persistent compromise
* Attacks against production systems without explicit authorization

The objective is to validate Wotmed-Net's defensive capabilities safely and reproducibly.

---

# 12. Scenario Coverage

The current test suite covers the primary application-layer scenarios defined for the project:

```text
                  Wotmed-Net
                      |
       +--------------+--------------+
       |              |              |
      SQLi           XSS       Path Traversal
       |              |              |
       +--------------+--------------+
                      |
                Brute Force
                      |
                      v
              Defense Validation
                      |
                      v
                  Telemetry
                      |
                      v
                Test Results
```

---

# 13. Completion Criteria

The attack scenario phase is complete when:

* All four attack categories have defined test cases.
* Legitimate baseline traffic has been defined.
* Test targets have been identified.
* Controlled inputs have been prepared.
* Expected behavior has been documented.
* Automated execution has been implemented.
* Actual results have been collected.
* Defense behavior has been validated.
* Telemetry has been verified.
* Results have been documented.

---

# 14. Important Implementation Note

The scenarios in this document define the intended security tests.

They do not claim that Wotmed-Net currently detects every listed attack.

Actual detection capability must be established by executing the tests against the running implementation.

Any difference between expected and observed behavior must be documented as a test finding.
