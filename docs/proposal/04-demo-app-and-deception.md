# Reference Application and Deception Layer

**Author:** Eman Mohammednur Ahmed
**Role:** Demo App & Deception Tester
**Project:** Wotmed-Net

---

## Executive Summary

The Demo App & Deception Layer establishes a controlled validation environment for Wotmed-Net by integrating deceptive resources into the Student Management application and verifying how interactions with those resources are detected, recorded, and blocked.

The implementation demonstrates that legitimate application traffic can continue to operate while controlled interactions with deceptive resources generate structured security events and return HTTP `403 Forbidden` responses.

The deception layer has been locally verified together with Wotmed-Net security and telemetry observation. Final cloud telemetry storage and SOC Dashboard integration remain pending broader project-wide integration and verification.

---

## 1. Overview

The Student Management application serves as the reference application for validating Wotmed-Net application-layer security and deception capabilities.

Deception resources are integrated into the application backend and provide controlled security signals when accessed. This creates a reproducible environment for testing the relationship between application requests, Wotmed-Net security processing, deception mechanisms, security-event generation, and telemetry observation.

Normal application functionality remains available while the dedicated deception routes provide controlled security-testing points.

---

## 2. Purpose

The primary purpose of this component is to validate the interaction between the reference application and the Wotmed-Net defense stack.

The implementation verifies that:

* legitimate application requests can continue successfully;
* dedicated deception resources can be accessed for controlled testing;
* interactions with deception resources generate structured security events;
* verified deception routes return HTTP `403 Forbidden`;
* Wotmed-Net telemetry observations are produced locally; and
* the behavior can be reproduced and documented using controlled localhost testing.

---

## 3. Reference Application Integration

The reference application is integrated with Wotmed-Net through its backend.

The current request flow is:

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
Wotmed-Net Telemetry Observation
```

Normal application requests continue through the application routes.

Requests interacting with the dedicated deception resources can trigger the corresponding security event and receive an access-denied response.

---

## 4. Implemented Deception Mechanisms

Four deception mechanisms have been implemented and verified in the reference application.

### 4.1 Canary Endpoint

**Route:**

```text
GET /api/deception/canary
```

**Security event:**

```text
canary_triggered
```

**Observed result:** HTTP `403 Forbidden`

**Status:** IMPLEMENTED — VERIFIED

---

### 4.2 Canary File Resource

**Route:**

```text
GET /api/deception/canary-file
```

**Security event:**

```text
canary_file_triggered
```

**Observed result:** HTTP `403 Forbidden`

**Status:** IMPLEMENTED — VERIFIED

---

### 4.3 Decoy Administrative Resource

**Route:**

```text
GET /api/deception/decoy-admin
```

**Security event:**

```text
decoy_admin_triggered
```

**Observed result:** HTTP `403 Forbidden`

**Status:** IMPLEMENTED — VERIFIED

---

### 4.4 Honeytoken Detection

**Route:**

```text
GET /api/deception/honeytoken
```

The controlled honeytoken used for verification is:

```text
WOTMED-DECOY-ADMIN-TOKEN-001
```

**Security event:**

```text
honeytoken_triggered
```

**Observed result:** HTTP `403 Forbidden`

**Status:** IMPLEMENTED — VERIFIED

---

## 5. Security Event Generation

Interactions with the implemented deception resources generate structured security events.

The events currently contain request and resource information including:

* event type;
* deception resource;
* HTTP method;
* source IP address;
* User-Agent; and
* timestamp.

For example, accessing the canary route produces a `canary_triggered` event identifying the deception resource and relevant request information.

These events provide an observable security signal for controlled validation and subsequent telemetry integration.

---

## 6. Wotmed-Net Telemetry Observation

The reference application is integrated with the Wotmed-Net security and telemetry layers.

During controlled localhost verification, requests to the deception routes produced Wotmed-Net telemetry observations together with the corresponding deception security events.

The current development environment reports that Supabase credentials are not configured. Consequently, telemetry is currently operating in local-buffer/observation mode rather than verified cloud storage.

**Status:** IMPLEMENTED — LOCAL TELEMETRY VERIFIED

### Pending Project Integration

The following items remain pending broader Wotmed-Net integration:

* final telemetry event-schema mapping;
* final cloud telemetry storage verification;
* end-to-end telemetry delivery;
* SOC Dashboard reception and display; and
* final end-to-end evidence after Backend/Telemetry integration.

---

## 7. Verification Testing

Controlled localhost testing was performed against both normal application traffic and the implemented deception resources.

| Test                         | Expected Result             | Observed Result                      | Status                 |
| ---------------------------- | --------------------------- | ------------------------------------ | ---------------------- |
| `/api/departments`           | Normal application response | HTTP `200`                           | IMPLEMENTED — VERIFIED |
| `/api/deception/canary`      | Security event + block      | `canary_triggered` + HTTP `403`      | IMPLEMENTED — VERIFIED |
| `/api/deception/canary-file` | Security event + block      | `canary_file_triggered` + HTTP `403` | IMPLEMENTED — VERIFIED |
| `/api/deception/decoy-admin` | Security event + block      | `decoy_admin_triggered` + HTTP `403` | IMPLEMENTED — VERIFIED |
| `/api/deception/honeytoken`  | Honeytoken event + block    | `honeytoken_triggered` + HTTP `403`  | IMPLEMENTED — VERIFIED |

The tests demonstrate that normal application traffic can return a successful application response while controlled interactions with deception resources generate the expected security events and access-denied responses.

---

## 8. Verification Status

### IMPLEMENTED — VERIFIED

* Student Management reference application integration
* Wotmed-Net defense layer integration
* Wotmed-Net security middleware integration
* Canary deception
* Canary file deception
* Decoy administrative resource
* Honeytoken detection
* Security event generation
* Local Wotmed-Net telemetry observation
* Normal application request verification
* HTTP `403 Forbidden` responses from verified deception routes
* Controlled localhost verification
* Verification evidence collection

### PENDING PROJECT INTEGRATION

* Final telemetry event-schema mapping
* Final cloud telemetry storage verification
* End-to-end telemetry delivery
* SOC Dashboard reception and display
* Final end-to-end evidence after Backend/Telemetry integration

---

## 9. Scope and Responsibilities

The **Demo App & Deception Tester** responsibility covers:

* integrating the reference application with the Wotmed-Net defense layer;
* implementing controlled deception resources;
* generating structured security events;
* verifying deception-triggered behavior;
* testing normal versus deceptive application traffic;
* collecting verification evidence; and
* documenting implementation and verification status.

The final telemetry pipeline and SOC Dashboard integration depend on the corresponding Wotmed-Net Backend/Telemetry and SOC Dashboard components.

Accordingly, cloud telemetry storage and dashboard display are not marked as verified until the remaining project-wide integration has been completed and tested.

---

## 10. Evidence and Validation Basis

The implemented functionality is supported by controlled request testing and backend observations demonstrating:

1. access to the implemented deception routes;
2. generation of the expected security events;
3. Wotmed-Net telemetry observation;
4. HTTP `403 Forbidden` responses from verified deception resources; and
5. successful normal application traffic with HTTP `200`.

Evidence was collected from the local development environment using controlled requests and backend runtime output.

This evidence supports the current implementation and verification status without claiming completion of the final cloud telemetry and SOC Dashboard pipeline.

---

## 11. Implementation Summary

| Component                                | Status                      |
| ---------------------------------------- | --------------------------- |
| Student Management reference application | IMPLEMENTED — VERIFIED      |
| Wotmed-Net defense integration           | IMPLEMENTED — VERIFIED      |
| Wotmed-Net security middleware           | IMPLEMENTED — VERIFIED      |
| Canary endpoint                          | IMPLEMENTED — VERIFIED      |
| Canary file resource                     | IMPLEMENTED — VERIFIED      |
| Decoy administrative resource            | IMPLEMENTED — VERIFIED      |
| Honeytoken detection                     | IMPLEMENTED — VERIFIED      |
| Security event generation                | IMPLEMENTED — VERIFIED      |
| Local telemetry observation              | IMPLEMENTED — VERIFIED      |
| Cloud telemetry storage                  | PENDING PROJECT INTEGRATION |
| SOC Dashboard integration                | PENDING PROJECT INTEGRATION |
| Final end-to-end telemetry test          | PENDING PROJECT INTEGRATION |

---

## 12. Current Conclusion

The Demo App & Deception Layer has successfully demonstrated the core deception-driven monitoring workflow within the controlled Student Management reference application.

The implemented deception mechanisms are locally functional and verified through reproducible testing. Each verified deception resource generates its corresponding security event and returns an access-denied response, while normal application traffic continues to function.

The remaining documented work concerns integration with the final project-wide telemetry pipeline and SOC Dashboard. Those components will be marked verified only after their corresponding end-to-end integration and evidence have been completed.

