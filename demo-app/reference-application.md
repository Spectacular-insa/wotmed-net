# Reference Application

## Overview

The Wotmed-Net Demo Application uses the existing **Student Management System** as the controlled reference application for demonstrating and testing Wotmed-Net application-layer security and deception capabilities.

The existing application is adapted rather than replaced. Its normal functionality remains available while Wotmed-Net security and deception mechanisms are integrated for controlled testing.

## Application Components

The reference application consists of:

- Frontend
- Backend / API
- MySQL Database

### Frontend

The frontend provides the user interface for interacting with the Student Management System.

### Backend / API

The backend provides the application API, handles application requests and business logic, and communicates with the MySQL database.

The backend is also the integration point for the Wotmed-Net security and deception layers.

### Database

MySQL is used by the Student Management System to store application data and support backend database operations.

## Wotmed-Net Integration

The Student Management backend integrates Wotmed-Net security components into the API request flow.

The current backend request flow is:

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

The Wotmed-Net defense layer and security middleware are registered in the backend before the application routes.

The security middleware inspects incoming API requests for configured suspicious request signatures and can generate security telemetry when a suspicious request is detected.

## Deception Integration

The backend contains a dedicated deception route group:

```text
/api/deception
```

The currently implemented deception resources are:

| Mechanism                     | Endpoint                     | Security Event          | Response   |
| ----------------------------- | ---------------------------- | ----------------------- | ---------- |
| Canary                        | `/api/deception/canary`      | `canary_triggered`      | HTTP `403` |
| Canary File                   | `/api/deception/canary-file` | `canary_file_triggered` | HTTP `403` |
| Decoy Administrative Resource | `/api/deception/decoy-admin` | `decoy_admin_triggered` | HTTP `403` |
| Honeytoken                    | `/api/deception/honeytoken`  | `honeytoken_triggered`  | HTTP `403` |

These resources are designed for controlled security testing and are separate from the application's normal functional endpoints.

## Security Event Generation

When a deception resource is triggered, the corresponding deception service creates a security event containing information such as:

- Event type
- Deception resource
- HTTP method
- Request IP address
- User-agent
- Event timestamp

The security event is currently observable in the backend runtime through the Wotmed-Net security event logging mechanism.

## Normal Application Behavior

Normal application routes remain available alongside the deception routes.

For example:

```text
GET /api/departments
```

was verified during controlled localhost testing and returned HTTP `200`.

This demonstrates that the addition of the deception mechanisms does not prevent normal application requests from being processed.

## Verification

Controlled localhost testing has verified:

- Normal application traffic continues to operate.
- The Wotmed-Net defense and security layers are active in the backend.
- The Canary deception resource generates `canary_triggered`.
- The Canary File deception resource generates `canary_file_triggered`.
- The Decoy Administrative Resource generates `decoy_admin_triggered`.
- A valid honeytoken interaction generates `honeytoken_triggered`.
- The four deception resources return HTTP `403 Forbidden`.
- Wotmed-Net telemetry observations are visible in the local development environment.

The verified deception mechanisms are documented separately in the deception documentation.

## Telemetry Status

Local Wotmed-Net telemetry observation has been verified during controlled testing.

The current development environment does not have the required Supabase credentials configured, so final cloud telemetry storage has not yet been verified.

The following remain pending project integration:

- Final telemetry event-schema mapping
- Cloud telemetry storage verification
- End-to-end telemetry delivery
- SOC Dashboard reception and display
- Final end-to-end integration evidence

These items depend on the Wotmed-Net Backend/Telemetry and SOC Dashboard components.

## Security and Testing Scope

The reference application and its deception mechanisms are intended for the authorized Wotmed-Net development and testing environment.

Testing is performed against the local development application using controlled requests.

No real credentials, production secrets, or production data are used as deception resources.

