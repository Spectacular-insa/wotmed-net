# 05 — Security Testing & Final Presentation

## 1. Overview

Wotmed-Net requires continuous security validation to ensure that its application-layer active defense mechanisms function as intended. This deliverable defines the security testing approach, controlled red-team validation, automated security test framework, defense verification, evidence collection, and final presentation activities for the project.

All security testing will be performed only in the authorized Wotmed-Net development and test environment. Security claims must be based on observed behavior and collected evidence rather than assumptions.

The core validation flow is:

Detect → Classify → Score → Defense Decision → Monitor / Tarpit / Block → Record Telemetry → Support Security Analysis

---

## 2. Role and Responsibilities

The Security Testing and Presentation workstream is responsible for:

- Security test planning
- Controlled red-team validation
- Automated security testing
- Attack scenario definition
- Defense validation
- Security metrics collection
- Telemetry verification
- Blocking effectiveness assessment
- False-positive validation
- Evidence gathering
- Security reporting
- Executive summary preparation
- Final presentation preparation
- Live demonstration planning

All activities must remain within the approved project environment and follow the project’s authorized testing boundaries.

---

## 3. Security Testing Objectives

The testing process has the following objectives:

1. Validate application-layer threat detection.
2. Validate threat classification logic.
3. Validate threat scoring behavior.
4. Validate configured defense responses.
5. Verify blocking behavior where configured.
6. Measure detection effectiveness.
7. Measure false-positive behavior.
8. Measure response latency.
9. Verify security telemetry generation.
10. Confirm that security events are visible in the monitoring and dashboard layers.
11. Identify weaknesses in the implemented defense mechanisms.
12. Produce reproducible evidence suitable for project evaluation.

---

## 4. Testing Scope

The initial testing scope covers the following application-layer scenarios:

- SQL Injection
- Cross-Site Scripting (XSS)
- Path Traversal
- Brute-Force Authentication
- Legitimate Traffic Baseline

The validation process evaluates:

- Request inspection
- Threat detection
- Threat classification
- Threat scoring
- Defense decisions
- Blocking behavior
- IP reputation behavior where enabled
- Telemetry generation
- Database persistence
- SOC/dashboard visibility
- Response latency

The testing scope excludes destructive operations, unauthorized systems, real credential theft, data exfiltration, malware deployment, and denial-of-service activity.

---

## 5. Automated Security Testing Framework

### 5.1 Purpose

The automated security testing framework is intended to generate controlled, application-layer security requests against the authorized Wotmed-Net test environment.

The initial implementation uses Python-based HTTP testing, structured around a reusable test lifecycle:

- Test configuration
- Test case definitions
- Request generation
- Response collection
- Detection evaluation
- Defense validation
- Telemetry verification
- Result aggregation
- Reporting

The framework must report only observed system behavior and must not manufacture successful results.

### 5.2 Proposed Architecture

```text
                Security Test Runner
                         |
                         v
                 Test Configuration
                         |
                         v
                 Test Case Loader
                         |
              +----------+----------+
              |                       |
              v                       v
          SQL Injection            XSS     Path Traversal
              |                       |
              +----------+----------+
                         |
                         v
                  HTTP Request Layer
                         |
                         v
                     Wotmed-Net
                         |
              +----------+----------+
              |                     |
              v                     v
        Defense Engine         Telemetry Layer
              |                     |
              +----------+----------+
                         |
                         v
                  Result Collector
                         |
                         v
                      Reporting
```

---

## 6. Attack Scenarios

### 6.1 ATK-001 — SQL Injection

#### Objective

Determine whether Wotmed-Net identifies controlled SQL injection indicators.

#### Example Test Indicators

- ' OR '1'='1
- admin'--
- ' UNION SELECT NULL--

These payloads are detection probes only and must not be used to alter or extract real production data.

#### Validation Points

- Request inspection
- SQL injection detection
- Threat classification
- Threat-score behavior
- Defense response
- Telemetry generation
- Security-event persistence where applicable

The result must reflect the actual Wotmed-Net configuration and observed behavior.

### 6.2 ATK-002 — Cross-Site Scripting (XSS)

#### Objective

Determine whether Wotmed-Net identifies controlled XSS indicators.

#### Example Test Indicator

- <script>alert(1)</script>

Additional non-destructive indicators may be used to test multiple detection patterns.

#### Validation Points

- Input inspection
- XSS detection
- Threat classification
- Threat-score behavior where applicable
- Defense response
- Telemetry generation

All testing must be performed only in the authorized test environment.

### 6.3 ATK-003 — Path Traversal

#### Objective

Determine whether Wotmed-Net identifies controlled path traversal indicators.

#### Example Test Indicator

- ../../etc/passwd

Encoded traversal representations may also be tested where relevant to the implemented detection rules.

The objective is to validate detection without accessing or disclosing any real sensitive files.

#### Validation Points

- Path inspection
- Traversal detection
- Threat classification
- Threat-score behavior where applicable
- Defense response
- Telemetry generation

### 6.4 ATK-004 — Brute-Force Authentication

#### Objective

Determine whether repeated controlled authentication failures are handled according to the configured security policy.

Testing must use a dedicated test account or a controlled test endpoint.

#### Example

- Attempt 1 → Failed
- Attempt 2 → Failed
- Attempt 3 → Failed
- Attempt 4 → Failed
- Attempt 5 → Failed

The exact number and rate of attempts must align with the configured Wotmed-Net defense policy.

#### Validation Points

- Repeated request handling
- Threat accumulation
- Threshold behavior
- Defense response
- Blocking behavior where configured
- Telemetry generation

No real user credentials may be used.

---

## 7. Legitimate Traffic Baseline

Security testing must include legitimate requests to evaluate false-positive behavior.

#### Example Baseline Requests

- GET /api/health
- GET /api/test?search=normal-query

#### Expected Behavior

Legitimate request → normal processing → normal response → no unnecessary detection → no unnecessary blocking

This baseline is used to calculate the false-positive ratio and confirm that valid traffic is not being incorrectly classified as malicious.

---

## 8. Defense Validation

Security testing will assess whether Wotmed-Net applies the configured response to detected threats.

The validation flow is:

Controlled Attack → Detection → Classification → Threat Score → Defense Decision → Monitor / Tarpit / Block → Telemetry

Detection and blocking are treated as separate outcomes. A request may be detected without being blocked immediately, depending on the active policy configuration.

An HTTP status code alone is not sufficient proof of security detection. Detection should be verified through authoritative Wotmed-Net telemetry, threat state, or another implementation-specific security indicator.

---

## 9. Security Metrics

### 9.1 Detection Rate

Detection Rate measures the percentage of malicious test requests correctly identified.

Detection Rate = (Correctly Detected Malicious Requests / Total Malicious Test Requests) × 100

### 9.2 False Positive Ratio

False Positive Ratio measures legitimate requests incorrectly classified as malicious.

False Positive Ratio = (Legitimate Requests Incorrectly Detected / Total Legitimate Requests) × 100

### 9.3 Response Latency

Response latency measures the time needed to process a security request and produce the corresponding response.

Response Latency = Response Completion Time − Request Start Time

Latency must be measured consistently across comparable tests.

### 9.4 Blocking Effectiveness

Blocking effectiveness measures whether qualifying malicious activity is successfully blocked.

Blocking Effectiveness = (Successfully Blocked Qualifying Requests / Total Qualifying Malicious Requests) × 100

### 9.5 Telemetry Success Rate

Telemetry success rate measures whether expected security events are successfully recorded.

Telemetry Success Rate = (Successfully Recorded Security Events / Expected Security Events) × 100

---

## 10. Security Test Matrix

| Test ID  | Attack Type        | Detection             | Classification | Defense             | Telemetry | Primary Metric         |
| -------- | ------------------ | --------------------- | -------------- | ------------------- | --------- | ---------------------- |
| ATK-001  | SQL Injection      | Required              | SQL Injection  | Configured Response | Required  | Detection Rate         |
| ATK-002  | XSS                | Required              | XSS            | Configured Response | Required  | Detection Rate         |
| ATK-003  | Path Traversal     | Required              | Path Traversal | Configured Response | Required  | Detection Rate         |
| ATK-004  | Brute Force        | Required              | Brute Force    | Threshold Response  | Required  | Blocking Effectiveness |
| BASE-001 | Legitimate Traffic | No Detection Expected | None           | Allow               | Normal    | False Positive Ratio   |

This matrix defines expected evaluation criteria; it does not represent actual test results until testing is executed.

---

## 11. Test Execution Process

Each test will follow a reproducible and documented process:

1. Verify the test environment.
2. Establish a baseline for normal traffic.
3. Configure the relevant security policy and detection settings.
4. Execute the attack scenario under controlled conditions.
5. Capture the request and response behavior.
6. Validate defense activation and telemetry generation.
7. Record observed outcomes and supporting evidence.
8. Compare results to expected behavior.
9. Document results in the test report.

---

## 12. Evidence Collection and Reporting

Evidence collection must include measurable and reproducible records such as:

- Request payloads used
- Timestamps for test execution
- Request and response metadata
- Security telemetry entries
- Threat classification decisions
- Defense responses taken
- Observed dashboard or log outputs
- Screenshots or documentation of the results when relevant

The final report must describe the test objective, method, observed results, and interpretation of the evidence. It must clearly separate expected behavior from measured outcomes.

---

## 13. Final Presentation

The final presentation will communicate the project outcome in a concise, evidence-based format. It should include:

- Project overview
- Defense architecture summary
- Security testing objectives
- Key attack scenarios and results
- Security metrics and observed findings
- Telemetry verification results
- False-positive and blocking analysis
- Lessons learned and system limitations
- Recommendations for future improvements

The presentation should emphasize practical evidence and the operational value of the Wotmed-Net active defense approach.

---

## 14. Success Criteria

The security testing effort will be considered successful when:

- Malicious traffic is correctly recognized in the targeted scenarios.
- Threat classification and scoring behavior are consistent with configuration.
- Telemetry is generated and visible to the monitoring layer.
- Defense actions are applied according to the configured policy.
- Legitimate traffic remains functional with acceptable false-positive rates.
- Results are documented with evidence suitable for technical review and presentation.

This deliverable ensures that Wotmed-Net is evaluated using a structured, defensible, and reproducible security testing model.

          ↓

3. Select Test Case
   ↓
4. Generate Controlled Request
   ↓
5. Send Request
   ↓
6. Capture Response
   ↓
7. Measure Latency
   ↓
8. Inspect Security State
   ↓
9. Verify Telemetry
   ↓
10. Record Result
    ↓
11. Calculate Metrics

Each execution should record the test ID, timestamp, request
information, observed security behavior, and supporting evidence.

12. Test Evidence

Evidence will be collected for important security tests.

Evidence may include:

Test script output
HTTP request information
HTTP response information
Response timing
Middleware logs
Threat score
IP reputation information
Database records
Telemetry records
Dashboard screenshots
Blocking state
Test timestamps

Each evidence item should be associated with its corresponding
test ID.

13. Test Result Classification

Each test will receive one of the following states:

PASS
FAIL
ERROR
NOT EXECUTED
PASS

The observed behavior satisfies the defined expected behavior.

FAIL

The test executed successfully, but the observed security behavior
did not satisfy the expected criteria.

ERROR

The test could not be completed because of an environment,
configuration, connectivity, or execution problem.

NOT EXECUTED

The test has been defined but has not yet been executed.

14. Telemetry and SOC Validation

Security testing will verify that detected security events reach
the telemetry and monitoring layers.

The validation flow is:

Attack Request
↓
Wotmed-Net
↓
Threat Detection
↓
Security Event
↓
Database / Telemetry
↓
SOC Dashboard

Where supported, the following information will be verified:

Source IP
Timestamp
Attack category
Threat score
Defense action
Blocking status
Relevant request information

The objective is to verify that security events are not only handled
by the middleware but also become observable to the monitoring layer.

15. IP Reputation and Blocking Validation

Where IP-based threat tracking is enabled, security tests will verify
that repeated malicious activity produces the expected security-state
changes.

Conceptual flow:

Initial State
↓
ACTIVE
↓
Malicious Activity
↓
Threat Score Increase
↓
Configured Threshold
↓
BLOCKED

The actual threshold and scoring behavior must be obtained from the
active Wotmed-Net configuration.

Observed values must be recorded rather than assumed.

16. False-Positive Validation

False-positive testing will use legitimate application requests.

The objective is to ensure that normal application behavior does not
unnecessarily trigger defensive controls.

Test categories may include:

Health checks
Normal API requests
Normal search requests
Valid application parameters
Normal authentication behavior

Results will be compared against malicious test behavior.

17. Automated Testing Results

The automated test framework should produce structured results.

Example result format:

{
"test_id": "ATK-001",
"attack_type": "SQL Injection",
"detection": true,
"classification": "SQL Injection",
"defense_action": "BLOCK",
"telemetry": true,
"response_time_ms": 12.4,
"status": "PASS"
}

The values above are illustrative only.

Actual values in the final report must come from executed tests.

No result should be marked as successful without supporting evidence.

18. Security Testing Deliverables

The security testing work is consolidated into this proposal
deliverable.

Current supporting structure:

wotmed-net/
│
├── docs/
│ └── proposal/
│ └── 05-security-testing-and-presentation.md
│
└── security-tests/
└── README.md

The detailed content previously distributed across the security
testing documentation is consolidated into this proposal section.

If separate implementation artifacts are later required, they may be
added without duplicating the proposal content.

19. Final Presentation Responsibility

The security testing responsibility also includes preparation of the
security section of the final project presentation.

The presentation should communicate Wotmed-Net from both technical
and operational perspectives.

The security testing section should demonstrate:

The security problem
Wotmed-Net's active defense approach
Attack simulation
Threat detection
Threat classification
Threat scoring
Defense response
Telemetry generation
SOC visualization
Security metrics
Test evidence
Overall security impact 20. Executive Summary

Wotmed-Net is an application-layer active defense middleware and
deception platform designed to identify suspicious activity, apply
configured defensive responses, and generate security telemetry.

Security testing provides an evidence-based validation mechanism for
these capabilities.

Controlled application-layer security scenarios will be executed
against the authorized test environment and evaluated according to
detection, classification, threat scoring, defense response, blocking
behavior, telemetry generation, and performance.

The final security assessment will report measured results and
identify observed weaknesses and limitations.

This approach ensures that project security claims are supported by
reproducible evidence rather than theoretical assumptions.

21. Live Demonstration Script

The final demonstration should follow a controlled sequence.

Step 1 — Show System Status

Display the Wotmed-Net monitoring dashboard and confirm that the
relevant defense and telemetry components are operational.

Wotmed-Net
LIVE ENGINE ACTIVE
Step 2 — Establish Normal Traffic

Send a legitimate request.

Expected conceptual flow:

Normal Request
↓
Normal Response
↓
No Unnecessary Security Alert
Step 3 — Launch Controlled Security Test

Execute one authorized security test.

Example:

SQL Injection Detection Test
Step 4 — Show Defense Processing

Display the resulting Wotmed-Net security behavior.

Attack
↓
Detection
↓
Classification
↓
Threat Score
↓
Defense Decision
Step 5 — Show Telemetry

Open the telemetry/dashboard view and demonstrate that the security
event has been recorded.

Step 6 — Demonstrate Repeated Threat Activity

Where supported, execute the controlled repeated-request scenario
and demonstrate the configured threshold-based response.

Step 7 — Present Metrics

Display measured:

Detection Rate
False Positive Ratio
Response Latency
Blocking Effectiveness
Telemetry Success Rate
Step 8 — Explain Results

Clearly distinguish between:

Expected behavior
Actual observed behavior
Successful tests
Failed tests
Test errors
Known limitations 22. Presentation Outline

The security testing section of the final presentation may follow:

1. Security Problem
   ↓
2. Wotmed-Net Defense Architecture
   ↓
3. Threat Detection
   ↓
4. Controlled Red-Team Testing
   ↓
5. Automated Security Testing
   ↓
6. Defense Response
   ↓
7. Telemetry / SOC Monitoring
   ↓
8. Security Metrics
   ↓
9. Live Demonstration
   ↓
10. Results and Limitations
    ↓
11. Future Improvements
12. Security Testing Limitations

The testing process recognizes the following limitations:

Detection depends on the implemented detection rules.
Results depend on configured thresholds and policies.
Test coverage cannot represent every possible attack variation.
Local development performance may differ from production
performance.
False-positive measurements depend on the quality and diversity
of legitimate baseline traffic.
Automated HTTP testing cannot fully evaluate every security control.
Detection success does not automatically imply complete protection
against an attack category.

These limitations must be explicitly acknowledged in the final
evaluation.

24. Future Improvements

Potential future security-testing improvements include:

Expanded attack-payload coverage
Additional OWASP-based scenarios
API fuzz testing
Authentication security testing
Rate-limit validation
Larger legitimate-traffic datasets
Continuous security testing in CI/CD
Historical security metrics
Automated regression testing
Advanced anomaly-detection validation
Expanded telemetry correlation
Security-test coverage reporting 25. Definition of Done

The Security Testing & Final Presentation deliverable is complete
when:

Security testing strategy is documented.
Attack scenarios are defined.
Authorized test targets are identified.
Controlled test inputs are prepared.
Automated testing is implemented where applicable.
SQL Injection testing is implemented and/or executed.
XSS testing is implemented and/or executed.
Path Traversal testing is implemented and/or executed.
Brute-Force testing is implemented and/or executed.
Legitimate traffic baseline is tested.
Defense behavior is validated.
Detection rate is measured.
False-positive ratio is measured.
Response latency is measured.
Blocking effectiveness is measured where applicable.
Telemetry is verified.
Security evidence is collected.
Actual test results are documented.
Limitations are documented.
Executive summary is prepared.
Live demonstration is prepared.
Final presentation content is prepared.

Items described as "implemented and/or executed" must be clearly
distinguished in the final report so that planned capabilities are not
presented as completed results.

26. Final Statement

The security testing component provides an evidence-based evaluation
of the Wotmed-Net active defense system.

The complete validation chain is:

Red Team
↓
Controlled Attack Simulation
↓
Wotmed-Net
↓
Detection
↓
Classification
↓
Threat Scoring
↓
Defense Decision
↓
Monitor / Tarpit / Block
↓
Telemetry
↓
SOC Visibility
↓
Security Metrics
↓
Evidence-Based Evaluation

The final presentation will demonstrate the system using controlled,
reproducible scenarios and will clearly distinguish implemented
capabilities, measured results, and planned future improvements.
