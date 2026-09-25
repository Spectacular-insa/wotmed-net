# Reference Application and Deception Layer

**Author:** Eman Mohammednur Ahmed  
**Role:** Demo App & Deception Tester  
**Project:** Wotmed-Net

---

## Executive Summary

The Demo App & Deception layer establishes a controlled validation environment for Wotmed-Net by integrating deceptive resources into the Student Management application and measuring how those interactions are detected, blocked, and observed. This component is designed to prove that legitimate business traffic can continue without disruption while suspicious access attempts to decoy assets trigger structured security events and deny access with HTTP 403 responses.

This section is strategically important because it demonstrates the practical value of deception-based detection in a real application context. It verifies that the system can distinguish between normal application behavior and adversarial interaction, while also confirming that telemetry and event generation are functioning at the local verification stage before broader platform integration is completed.

---

## 1. Overview

The reference application provides a realistic workload for validating Wotmed-Net’s ability to monitor application-layer activity, detect deceptive interactions, and enforce access controls around intentionally exposed decoy resources. The application remains operational for standard requests while deceptive endpoints trigger security actions when accessed or probed.

This creates a dependable environment for demonstrating how deception can function as a measurable and effective security control.

---

## 2. Strategic Value

This component is not just a demonstration of endpoint access; it validates the project’s security model in a meaningful way.

It proves that:

- ordinary application behavior continues normally
- deceptive endpoints are identifiable and traceable
- suspicious interactions generate actionable alerts
- access can be denied before exploitation occurs
- telemetry collection can observe and record the event lifecycle

This is a critical proof point for the overall Wotmed-Net platform because it demonstrates deception-driven threat detection in a real application workflow, not merely in theory.

---

## 3. Purpose

The primary objective of this layer is to validate the interaction between the application layer and the Wotmed-Net defense stack. It ensures that the Student Management application supports both business functionality and controlled deception-driven detection without interrupting normal usage.

The implementation specifically verifies:

- legitimate traffic remains functional
- deceptive endpoints trigger event generation
- suspicious requests are blocked with HTTP 403
- local telemetry observes the interaction correctly

---

## 4. Request Flow

```text
Client Request
      ↓
Student Management Backend
      ↓
Wotmed-Net Defense Layer
      ↓
Wotmed-Net Security Middleware
      ↓
Application Route / Deception Route
      ↓
Security Event Generation
      ↓
Telemetry Observation
```

This flow enables a clean distinction between normal application behavior and controlled deceptive interaction.

---

## 5. Implemented Deception Mechanisms

The reference application includes four verified deception mechanisms.

### 5.1 Canary Endpoint

**Route:** `GET /api/deception/canary`

- Event: `canary_triggered`
- Result: HTTP `403 Forbidden`
- Status: IMPLEMENTED — VERIFIED

### 5.2 Canary File Resource

**Route:** `GET /api/deception/canary-file`

- Event: `canary_file_triggered`
- Result: HTTP `403 Forbidden`
- Status: IMPLEMENTED — VERIFIED

### 5.3 Decoy Administrative Resource

**Route:** `GET /api/deception/decoy-admin`

- Event: `decoy_admin_triggered`
- Result: HTTP `403 Forbidden`
- Status: IMPLEMENTED — VERIFIED

### 5.4 Honeytoken Detection

**Route:** `GET /api/deception/honeytoken`

- Token: `WOTMED-DECOY-ADMIN-TOKEN-001`
- Event: `honeytoken_triggered`
- Result: HTTP `403 Forbidden`
- Status: IMPLEMENTED — VERIFIED

---

## 6. Security Event Generation

Each deceptive interaction produces a structured security event containing relevant request metadata, including:

- event type
- resource accessed
- HTTP method
- source IP
- user-agent
- timestamp

This creates a clear security signal when a deceptive asset is accessed, supporting both validation and operational monitoring.

---

## 7. Telemetry and Integration Status

The reference application is integrated with the Wotmed-Net security and telemetry layers. Controlled testing confirms that requests to deceptive endpoints produce both the corresponding security events and telemetry observations.

Current operational status:

- Local telemetry: VERIFIED
- Cloud telemetry storage: PENDING
- SOC Dashboard integration: PENDING

This indicates that the deception layer is functionally validated in the local environment, while final cloud-wide telemetry and dashboard integration remain dependent on the broader platform implementation.

---

## 8. Verification Results

Controlled local testing confirmed the following behavior:

| Test                         | Result                             | Status   |
| ---------------------------- | ---------------------------------- | -------- |
| `/api/departments`           | HTTP 200                           | VERIFIED |
| `/api/deception/canary`      | `canary_triggered` + HTTP 403      | VERIFIED |
| `/api/deception/canary-file` | `canary_file_triggered` + HTTP 403 | VERIFIED |
| `/api/deception/decoy-admin` | `decoy_admin_triggered` + HTTP 403 | VERIFIED |
| `/api/deception/honeytoken`  | `honeytoken_triggered` + HTTP 403  | VERIFIED |

The results demonstrate that normal application traffic remains functional while deceptive assets generate measurable alert signals and deny access.

---

## 9. Scope and Responsibilities

The responsibilities of the Demo App & Deception Tester include:

- integrating the reference application with the Wotmed-Net enforcement layer
- implementing deceptive assets and controlled attack surfaces
- generating structured security events
- verifying suspicious interaction behavior
- documenting test evidence and implementation status

Final cloud telemetry and SOC Dashboard integration remain dependent on the Backend/Telemetry and Dashboard components of the project.

---

## 10. Evidence and Validation Basis

The implemented functionality is supported by controlled request testing and backend observations confirming that:

1. deception routes are reachable
2. expected security events are generated
3. telemetry is observed locally
4. requests to deceptive resources are denied with HTTP 403
5. normal application traffic continues to succeed

This evidence validates the deception layer in its current development stage and supports the claim that it is functionally effective before final cloud integration is completed.

---

## 11. Final Status

| Component                      | Status   |
| ------------------------------ | -------- |
| Student Management application | VERIFIED |
| Wotmed-Net defense integration | VERIFIED |
| Canary endpoint                | VERIFIED |
| Canary file resource           | VERIFIED |
| Decoy admin resource           | VERIFIED |
| Honeytoken detection           | VERIFIED |
| Security event generation      | VERIFIED |
| Local telemetry observation    | VERIFIED |
| Cloud telemetry storage        | PENDING  |
| SOC dashboard integration      | PENDING  |

---

## Closing Statement

The Demo App & Deception layer has successfully demonstrated the core deception-driven monitoring model within a controlled application environment. The implementation is functional, measurable, and aligned with the strategic objectives of Wotmed-Net. The remaining work is limited to system-wide integration with telemetry and dashboard components, not to a failure of the deception layer itself.
