# Deception Mechanisms

## Overview

The Wotmed-Net Demo Application uses controlled deception mechanisms to identify and record interactions with resources that are not part of normal application functionality.

The deception mechanisms are integrated into the existing **Student Management System** and are intended for authorized local security testing.

Normal application functionality remains available while the deception resources provide controlled security-event generation.

## Implemented Deception Mechanisms

The reference application currently contains four implemented and verified deception mechanisms:

1. Canary
2. Canary File
3. Decoy Administrative Resource
4. Honeytoken

Each mechanism is exposed through the `/api/deception` route group.

## Canary

### Endpoint

```text
GET /api/deception/canary
```

### Behavior

A request to the Canary resource triggers a security event:

```text
canary_triggered
```

The event records information including:

* HTTP method
* Request IP address
* User-agent
* Deception resource
* Event timestamp

The endpoint returns:

```text
HTTP 403 Forbidden
```

### Status

**IMPLEMENTED - VERIFIED**

## Canary File

### Endpoint

```text
GET /api/deception/canary-file
```

### Behavior

A request to the Canary File resource triggers:

```text
canary_file_triggered
```

The endpoint returns:

```text
HTTP 403 Forbidden
```

The event records request information and the triggered deception resource.

### Status

**IMPLEMENTED - VERIFIED**

## Decoy Administrative Resource

### Endpoint

```text
GET /api/deception/decoy-admin
```

### Behavior

A request to the decoy administrative resource triggers:

```text
decoy_admin_triggered
```

The endpoint returns:

```text
HTTP 403 Forbidden
```

The resource is separated from the application's normal administrative functionality and is intended only for controlled security testing.

### Status

**IMPLEMENTED - VERIFIED**

## Honeytoken

### Endpoint

```text
GET /api/deception/honeytoken
```

The controlled honeytoken value is:

```text
WOTMED-DECOY-ADMIN-TOKEN-001
```

### Behavior

A request containing the controlled honeytoken triggers:

```text
honeytoken_triggered
```

The event records information including:

* HTTP method
* Request IP address
* User-agent
* Honeytoken resource
* Event timestamp

A valid honeytoken interaction returns:

```text
HTTP 403 Forbidden
```

### Status

**IMPLEMENTED - VERIFIED**

## Deception Summary

| Mechanism                     | Endpoint                     | Security Event          | Response   | Status                 |
| ----------------------------- | ---------------------------- | ----------------------- | ---------- | ---------------------- |
| Canary                        | `/api/deception/canary`      | `canary_triggered`      | HTTP `403` | IMPLEMENTED - VERIFIED |
| Canary File                   | `/api/deception/canary-file` | `canary_file_triggered` | HTTP `403` | IMPLEMENTED - VERIFIED |
| Decoy Administrative Resource | `/api/deception/decoy-admin` | `decoy_admin_triggered` | HTTP `403` | IMPLEMENTED - VERIFIED |
| Honeytoken                    | `/api/deception/honeytoken`  | `honeytoken_triggered`  | HTTP `403` | IMPLEMENTED - VERIFIED |

## Deception Workflow

The verified application workflow is:

```text
Client Request
      |
Student Management Backend
      |
Wotmed-Net Defense Layer
      |
Wotmed-Net Security Middleware
      |
Deception Route
      |
Deception Trigger
      |
Security Event
      |
Wotmed-Net Telemetry Observation
```

When a deception resource is accessed, the corresponding deception service generates a security event.

## Security Event Generation

Security events are generated through the application's security-event service.

The current event structure includes information such as:

```text
Event Type
Deception Resource
HTTP Method
Request IP
User-Agent
Timestamp
```

The events are observable in the backend runtime during controlled testing.

## Wotmed-Net Telemetry

During local testing, the deception requests were observed by the Wotmed-Net telemetry layer.

The local development environment currently operates without the required Supabase credentials, so telemetry is observed locally rather than verified as stored in the cloud telemetry database.

**Local telemetry observation:** IMPLEMENTED - VERIFIED

The following remain pending project integration:

* Final telemetry event-schema mapping
* Cloud telemetry storage verification
* End-to-end telemetry delivery
* SOC Dashboard reception and display
* Final end-to-end integration evidence

## Verification

All four deception mechanisms were tested against the local Student Management backend.

The observed results were:

* Canary generated `canary_triggered` and returned HTTP `403`.
* Canary File generated `canary_file_triggered` and returned HTTP `403`.
* Decoy Administrative Resource generated `decoy_admin_triggered` and returned HTTP `403`.
* Honeytoken generated `honeytoken_triggered` and returned HTTP `403`.

The verification evidence consists of backend runtime output and controlled request results.

## Security and Testing Scope

The deception mechanisms are intended for the authorized Wotmed-Net development and testing environment.

Testing is performed against the local development application using controlled requests.

No real credentials, production secrets, or production data are used as deception resources.

The deception resources should not be deployed or tested against unauthorized systems.
