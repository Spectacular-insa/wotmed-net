# Wotmed-Net

## Security Testing & Final Presentation

**Project:** Wotmed-Net — Application-Layer Active Defense Middleware & Deception Network Platform
**Role:** Security Testing & Final Presentation
**Team:** Group 1 — Spectacular Group
**Program:** INSA Cyber Talent Summer Camp
**Repository:** `Spectacular-insa/wotmed-net`

---

## 1. Overview

This document defines the Security Testing and Final Presentation responsibilities for Wotmed-Net.

The Core Engine and Active Defense Middleware are implemented as separate project components by the respective team members. The responsibility of this role is to independently validate the implemented defensive behavior through controlled security testing, document the results, generate evidence, and present the system's security capabilities during the final demonstration.

The security-testing work focuses on answering the following question:

> **Does the implemented Wotmed-Net defense respond correctly when controlled malicious traffic is introduced?**

The testing process covers SQL Injection, Cross-Site Scripting (XSS), Path Traversal, and controlled Brute Force behavior.

---

# 2. Role and Responsibilities

The Security Testing & Final Presentation role is responsible for:

* Designing controlled security test scenarios
* Implementing automated security test cases
* Executing tests against the running Wotmed-Net application
* Measuring detection and defensive responses
* Validating threat-response behavior
* Recording test evidence
* Generating JSON and CSV reports
* Documenting findings and limitations
* Preparing the final security demonstration
* Explaining security results during the final presentation

This role does **not** claim ownership of the Core Engine or Active Defense Middleware implementation.

---

# 3. Security Testing Objectives

The main objectives are to:

1. Verify that malicious application-layer inputs can be detected.
2. Verify that the implemented defense actions are triggered correctly.
3. Validate containment behavior such as blocking and tarpitting.
4. Verify controlled brute-force threshold behavior.
5. Measure test execution reliability and response time.
6. Produce reproducible security-testing evidence.
7. Provide a clear security demonstration for reviewers.

---

# 4. Testing Scope

The implemented automated test suite covers four primary attack categories.

| Category               | Purpose                                                   |
| ---------------------- | --------------------------------------------------------- |
| SQL Injection          | Validate detection of SQL-oriented malicious input        |
| Cross-Site Scripting   | Validate detection of script-oriented payloads            |
| Path Traversal         | Validate detection of directory traversal patterns        |
| Controlled Brute Force | Validate threshold-based repeated authentication behavior |

The current test suite contains **11 test cases**.

### Out of Scope

The current automated validation does not independently establish:

* Production-scale performance
* Formal false-positive rate
* Long-term telemetry persistence
* IP reputation accuracy
* Real-world attacker behavior
* Full penetration-test coverage
* Production security certification

These areas may be addressed through future testing.

---

# 5. Automated Security Testing Framework

The security-testing framework is implemented in Python and executed through the project's `uv` environment.

### Test Location

```text
security-tests/
├── README.md
├── testing-strategy.md
├── attack-scenarios.md
├── automated-testing.md
├── defense-validation.md
├── test-results.md
├── scripts/
│   ├── security_test.py
│   ├── config.py
│   ├── test_cases.py
│   └── reporter.py
└── results/
    ├── security_test_results.json
    └── security_test_results.csv
```

### Target Configuration

```text
Target   : http://localhost:3000
Endpoint : /api/v1/auth/login
Timeout  : 5 seconds
```

### Execution

```powershell
cd C:\Users\hp\Desktop\INSA\wotmed-net\security-tests\scripts
uv run python security_test.py
```

The tests are designed to run against the locally controlled Wotmed-Net environment.

---

# 6. Attack Scenario Matrix

| ID      | Attack Scenario        | Tests | Expected Defensive Behavior         |
| ------- | ---------------------- | ----: | ----------------------------------- |
| ATK-001 | SQL Injection          |     2 | Detect and block/redirect           |
| ATK-002 | Cross-Site Scripting   |     2 | Detect and contain                  |
| ATK-003 | Path Traversal         |     2 | Detect and block/redirect           |
| ATK-004 | Controlled Brute Force |     5 | Trigger threshold-based containment |

---

# 7. Actual Security Test Results

The completed automated test run produced the following results.

| Category       |  Tests | Detected | Passed | Failed |
| -------------- | -----: | -------: | -----: | -----: |
| SQL Injection  |      2 |        2 |      2 |      0 |
| XSS            |      2 |        2 |      2 |      0 |
| Path Traversal |      2 |        2 |      2 |      0 |
| Brute Force    |      5 |        1 |      5 |      0 |
| **Total**      | **11** |    **7** | **11** |  **0** |

### Overall Results

* **Total tests:** 11
* **Passed:** 11
* **Failed:** 0
* **Request failures:** 0
* **Detected:** 7
* **Request success:** 100%
* **Average response time:** 0.6768 seconds
* **Suite-specific detection rate:** 63.64%

The 63.64% value represents the proportion of test cases in this particular suite for which the automated evaluator recorded a detection. It should not be interpreted as a universal security effectiveness score.

---

# 8. Defensive Behavior Observed

## 8.1 SQL Injection

Two SQL Injection scenarios were executed.

Both were detected and resulted in blocking/honeypot redirection behavior.

Observed response:

```text
Detection : DETECTED
Defense   : BLOCK_AND_REDIRECT_HONEYPOT
Outcome   : BLOCKED
```

Result:

```text
2/2 tests passed
2/2 detected
```

---

## 8.2 Cross-Site Scripting

Two XSS scenarios were executed.

Both were detected and handled through dynamic tarpitting.

Observed response:

```text
Detection : DETECTED
Defense   : AUTONOMOUS_DYNAMIC_TARPIT
Outcome   : TARPITTED
```

Result:

```text
2/2 tests passed
2/2 detected
```

---

## 8.3 Path Traversal

Two Path Traversal scenarios were executed.

Both were detected and handled through blocking/honeypot redirection.

Observed response:

```text
Detection : DETECTED
Defense   : BLOCK_AND_REDIRECT_HONEYPOT
Outcome   : BLOCKED
```

Result:

```text
2/2 tests passed
2/2 detected
```

---

## 8.4 Controlled Brute Force

Five sequential authentication attempts were used to validate threshold behavior.

The first four attempts remained allowed, while the fifth attempt triggered defensive containment.

```text
Attempt 1 → NOT_DETECTED → ALLOW
Attempt 2 → NOT_DETECTED → ALLOW
Attempt 3 → NOT_DETECTED → ALLOW
Attempt 4 → NOT_DETECTED → ALLOW
Attempt 5 → DETECTED → AUTONOMOUS_DYNAMIC_TARPIT
```

Result:

```text
5/5 tests passed
1/5 attempts detected
```

The purpose of this scenario is to validate threshold-based behavior rather than to classify every individual request as malicious.

---

# 9. Security Metrics

The following metrics were collected from the completed test execution.

### Test Reliability

```text
11 / 11 tests passed
0 failed
0 request failures
100% request success
```

### Detection

```text
7 / 11 test cases detected
63.64% suite-specific detection rate
```

### Response Time

```text
Average response time: 0.6768 seconds
```

These values describe the observed local test run and should not be treated as production performance benchmarks.

---

# 10. Evidence and Reporting

The automated framework produces machine-readable evidence.

### JSON Report

```text
security-tests/results/security_test_results.json
```

The JSON report provides structured test information suitable for further analysis or integration into future CI/CD workflows.

### CSV Report

```text
security-tests/results/security_test_results.csv
```

The CSV report provides a tabular representation of the test results.

The reports allow the team to preserve evidence instead of relying only on terminal output.

---

# 11. Defense Validation

The security-testing role validates the relationship between:

```text
Attack Input
     ↓
Wotmed-Net Middleware
     ↓
Threat Evaluation
     ↓
Defense Decision
     ↓
Observed Response
     ↓
Automated Test Result
```

The validation focuses on whether the implemented defense produces the expected observable response.

The tested defensive actions include:

* Blocking
* Honeypot redirection
* Dynamic tarpitting
* Allow behavior before a brute-force threshold is reached

---

# 12. Security Testing Principles

The testing process follows these principles:

### Controlled

Tests are executed against a locally controlled application environment.

### Reproducible

The same test suite can be executed repeatedly using the documented command.

### Evidence-Based

Results are recorded in structured JSON and CSV reports.

### Non-Destructive

The test cases are designed for controlled application-layer validation rather than destructive exploitation.

### Separated Responsibilities

Security testing validates the behavior of the implemented defense but does not claim authorship of the Core Engine or Middleware implementation.

---

# 13. Final Presentation Responsibility

The Security Testing role also includes preparation of the final security demonstration.

The presentation should demonstrate the system from an attack-and-defense perspective.

The core story is:

```text
Attacker sends malicious request
            ↓
Wotmed-Net intercepts request
            ↓
Threat is evaluated
            ↓
Threat score / detection decision
            ↓
Defense action
            ↓
Request is contained
            ↓
Evidence is available
```

---

# 14. Live Demonstration Plan

The final demonstration can follow this sequence.

### Step 1 — Start the Application

Start the Wotmed-Net application and confirm that the runtime is available on:

```text
http://localhost:3000
```

### Step 2 — Explain the Architecture

Briefly show:

```text
Client
  ↓
Middleware
  ↓
Threat Evaluation
  ↓
Defense Action
  ↓
Application / Honeypot / Tarpit
```

The Core Engine and Middleware implementation can be explained by the responsible team member.

The Security Testing section then demonstrates how their behavior was validated.

### Step 3 — Demonstrate SQL Injection

Send a controlled SQL Injection test.

Show:

```text
DETECTED
↓
BLOCK_AND_REDIRECT_HONEYPOT
↓
BLOCKED
```

### Step 4 — Demonstrate XSS

Send a controlled XSS payload.

Show:

```text
DETECTED
↓
AUTONOMOUS_DYNAMIC_TARPIT
↓
TARPITTED
```

### Step 5 — Demonstrate Path Traversal

Send a controlled Path Traversal payload.

Show:

```text
DETECTED
↓
BLOCK_AND_REDIRECT_HONEYPOT
↓
BLOCKED
```

### Step 6 — Demonstrate Brute Force Threshold

Run the five controlled authentication attempts.

Explain:

```text
Attempts 1–4 → ALLOW
Attempt 5     → DETECTED → TARPITTED
```

This demonstrates the threshold-based defensive behavior.

### Step 7 — Show Automated Results

Display:

```text
Total Tests      : 11
Passed           : 11
Failed           : 0
Request Failures : 0
Detected         : 7
Success Rate     : 100%
Avg Response     : 0.6768s
```

Then open the generated JSON or CSV report.

---

# 15. Presentation Outline

The Security Testing section of the final presentation can follow this structure:

### Slide 1 — Security Testing Overview

* Testing role
* Testing objectives
* Scope

### Slide 2 — Attack Scenarios

* SQL Injection
* XSS
* Path Traversal
* Controlled Brute Force

### Slide 3 — Automated Testing Framework

* Python
* `uv`
* Test cases
* Automated reporter
* JSON/CSV evidence

### Slide 4 — Defense Validation

Show:

```text
Attack
 ↓
Detection
 ↓
Defense
 ↓
Containment
```

### Slide 5 — Actual Results

```text
11 Tests
11 Passed
0 Failed
7 Detected
100% Request Success
0.6768s Average Response
```

### Slide 6 — Live Demonstration

Demonstrate:

* SQL Injection
* XSS
* Path Traversal
* Brute Force threshold

### Slide 7 — Limitations and Future Work

Explain what has and has not been validated.

### Slide 8 — Conclusion

Summarize the security-testing evidence and the demonstrated defensive behavior.

---

# 16. Evidence Classification

The current project has direct evidence for:

* Automated test execution
* SQL Injection detection
* XSS detection
* Path Traversal detection
* Brute-force threshold behavior
* Defense actions observed during testing
* JSON result generation
* CSV result generation
* Request success
* Average response time

The current run does **not** independently provide quantitative evidence for:

* Formal false-positive rate
* Production traffic performance
* IP reputation accuracy
* Long-term telemetry persistence
* Large-scale distributed attack simulation

These should therefore be presented as future validation areas rather than completed measurements.

---

# 17. Limitations

The current security test suite is intentionally limited in scope.

It does not represent a complete penetration test.

Important limitations include:

1. Only four attack categories are currently automated.
2. The test suite uses a limited number of payloads.
3. Testing is performed against a local environment.
4. Production-scale traffic was not evaluated.
5. False-positive measurement was not independently performed.
6. Long-term telemetry behavior was not the primary focus of this test run.
7. IP reputation behavior was not independently validated.
8. Detection results are specific to the implemented test cases.

These limitations should be communicated clearly during the final presentation.

---

# 18. Future Improvements

Future versions of the security-testing framework can include:

* Additional SQL Injection payloads
* Additional XSS variants
* Command Injection testing
* Authentication abuse testing
* Header anomaly testing
* HTTP method abuse testing
* Rate-limit testing
* Larger brute-force scenarios
* Legitimate traffic baseline testing
* False-positive measurement
* Telemetry persistence validation
* IP reputation validation
* CI/CD security-test integration
* Historical result comparison
* Automated security regression testing

---

# 19. Definition of Done

The Security Testing & Final Presentation responsibility is considered complete when:

* [x] Security testing scope defined
* [x] Attack scenarios documented
* [x] Automated testing framework implemented
* [x] SQL Injection tests executed
* [x] XSS tests executed
* [x] Path Traversal tests executed
* [x] Controlled Brute Force tests executed
* [x] Defense behavior validated
* [x] JSON report generated
* [x] CSV report generated
* [x] Test results documented
* [x] Limitations documented
* [x] Final demonstration plan prepared
* [x] Presentation structure prepared

---

# 20. Final Statement

The Security Testing & Final Presentation work provides an evidence-based validation layer for the Wotmed-Net project.

The implemented automated test suite successfully executed **11 controlled security test cases**, with **11 tests passing**, **0 failed tests**, and **0 request failures**.

The testing demonstrated observable defensive behavior for SQL Injection, XSS, Path Traversal, and controlled Brute Force scenarios.

The resulting evidence provides a reproducible basis for demonstrating how the implemented Wotmed-Net defense responds to controlled malicious application traffic.

The role therefore complements the Core Engine and Middleware implementation by independently testing, documenting, and presenting their observable security behavior.

> **Core Engine builds the defense.
> Security Testing validates the defense.
> Final Presentation demonstrates the evidence.**
