# Wotmed-Net Demo App & Deception Tester

**Lead:** Eman Mohammednur Ahmed
**Role:** Demo App & Deception Tester
**Project:** Wotmed-Net

---

## Overview

The `demo-app` component provides the controlled reference application used to demonstrate and verify Wotmed-Net application-layer security and deception capabilities.

The reference application is based on the existing **Student Management System**. Its backend has been integrated with the Wotmed-Net defense and security layers to support controlled deception testing and security-event generation.

The implementation is designed to demonstrate two types of behavior:

1. Normal application traffic continues to operate normally.
2. Controlled interaction with deception resources generates security events and returns an access-denied response.

---

## Reference Application

The Student Management application serves as the reference application for the Wotmed-Net demonstration environment.

The current request flow is:

```text
Client Request
      |
Student Management Backend
      |
Wotmed-Net Defense Layer
      |
Wotmed-Net Security Middleware
      |
Application Route / Deception Route
      |
Security Event
      |
Wotmed-Net Telemetry Observation
```

The application is tested locally using controlled requests.

---

## Implemented Deception Mechanisms

The reference application currently contains four verified deception mechanisms.

### Canary

```text
GET /api/deception/canary
```

Generates:

```text
canary_triggered
```

and returns HTTP `403 Forbidden`.

**Status:** IMPLEMENTED - VERIFIED

### Canary File

```text
GET /api/deception/canary-file
```

Generates:

```text
canary_file_triggered
```

and returns HTTP `403 Forbidden`.

**Status:** IMPLEMENTED - VERIFIED

### Decoy Administrative Resource

```text
GET /api/deception/decoy-admin
```

Generates:

```text
decoy_admin_triggered
```

and returns HTTP `403 Forbidden`.

**Status:** IMPLEMENTED - VERIFIED

### Honeytoken

```text
GET /api/deception/honeytoken
```

The controlled honeytoken is:

```text
WOTMED-DECOY-ADMIN-TOKEN-001
```

A valid honeytoken interaction generates:

```text
honeytoken_triggered
```

and returns HTTP `403 Forbidden`.

**Status:** IMPLEMENTED - VERIFIED

---

## Verification

Controlled localhost testing has verified:

| Test                         | Observed Result                      | Status                 |
| ---------------------------- | ------------------------------------ | ---------------------- |
| `/api/departments`           | HTTP `200`                           | IMPLEMENTED - VERIFIED |
| `/api/deception/canary`      | `canary_triggered` + HTTP `403`      | IMPLEMENTED - VERIFIED |
| `/api/deception/canary-file` | `canary_file_triggered` + HTTP `403` | IMPLEMENTED - VERIFIED |
| `/api/deception/decoy-admin` | `decoy_admin_triggered` + HTTP `403` | IMPLEMENTED - VERIFIED |
| `/api/deception/honeytoken`  | `honeytoken_triggered` + HTTP `403`  | IMPLEMENTED - VERIFIED |

The verification demonstrates that normal application traffic remains functional while controlled interaction with deception resources generates the expected security events and access-denied responses.

---

## Wotmed-Net Telemetry

The application is integrated with the Wotmed-Net security and telemetry layers.

Local testing has verified that API requests produce Wotmed-Net telemetry observations and that deception requests also generate their corresponding security events.

**Local telemetry observation:** IMPLEMENTED - VERIFIED

The current development environment does not have the required Supabase credentials configured, so final cloud telemetry storage has not yet been verified.

**Cloud telemetry storage:** PENDING PROJECT INTEGRATION

**SOC Dashboard reception/display:** PENDING PROJECT INTEGRATION

---

## Documentation

Detailed documentation for this component is available in the following files:

* [Reference Application](reference-application.md)
* [Deception Mechanisms](deception.md)
* [Honeytokens and Canary Resources](honeytokens-and-canaries.md)
* [Testing](testing.md)

Project-level proposal documentation:

* [Demo App & Deception Proposal Documentation](../docs/proposal/04-demo-app-and-deception.md)

---

## Scope and Responsibilities

The Demo App & Deception Tester is responsible for:

* reference application integration;
* deception mechanism implementation;
* honeytoken and canary resources;
* deception triggers;
* security-event generation;
* controlled application verification;
* evidence collection and testing; and
* documentation of the implemented behavior.

Final cloud telemetry and SOC Dashboard integration depend on the corresponding Wotmed-Net Backend/Telemetry and SOC Dashboard components.

---

## Security and Testing

All deception mechanisms and security tests are intended for the authorized Wotmed-Net development and testing environment.

Testing is performed against the local development application.

No real credentials, production secrets, or production data are used as deception resources.

The deception mechanisms are designed as controlled security-testing resources and should not be deployed to an unauthorized environment.

---

## Current Status

### IMPLEMENTED - VERIFIED

* Reference application integration
* Wotmed-Net defense/security integration
* Canary
* Canary file
* Decoy administrative resource
* Honeytoken
* Security-event generation
* Local telemetry observation
* Normal application traffic verification
* Controlled localhost testing

### PENDING PROJECT INTEGRATION

* Final telemetry event-schema mapping
* Cloud telemetry storage verification
* End-to-end telemetry delivery
* SOC Dashboard reception and display
* Final end-to-end integration evidence
