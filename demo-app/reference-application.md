# Reference Application

## Overview

The Demo Application uses the existing Student Management System as the reference application for the Wotmed-Net project.

The existing application is adapted to provide a realistic environment for testing controlled deception mechanisms. The goal is to extend the application for security demonstrations rather than replace it with a new application.

## Application Features

The reference application includes functionality for:

- User authentication.
- Student management.
- Course management.
- Department management.
- Dashboard functionality.
- Database operations.

These features provide the application context in which normal requests can be distinguished from interactions with designated deception resources.

## Application Structure

The reference application consists of three main components:

- **Frontend:** The user interface through which users interact with the application.
- **Backend / API:** Handles HTTP requests, application logic, security checks, and database communication.
- **MySQL Database:** Stores application data used by the backend.

The Wotmed-Net deception mechanisms are added to the existing application and backend request flow.

## Frontend

The frontend provides the user interface for the Student Management System. It allows users to access the application's available features and interact with its backend APIs.

The existing frontend serves as the reference interface for testing that security-related additions do not unnecessarily disrupt normal application use.

## Backend

The backend exposes the application's API endpoints and processes incoming requests.

It handles application logic and database operations. The security-related additions include configured deception resources and mechanisms that detect designated interactions and generate security events.

Observed endpoint responses and generated events are documented in the Demo App evidence collection.

## Database

MySQL is used by the reference application to support its database operations.

The existence of the application's database does not, by itself, establish that Wotmed-Net deception events are persisted in that database. Deception-event persistence and recovery must be verified separately against the relevant implementation.

## Adaptation for Wotmed-Net

The existing Student Management System has been extended for controlled deception testing.

The implemented and locally tested mechanisms include:

- A designated honeytoken resource.
- A canary endpoint.
- A canary file resource.
- A decoy administrative resource.
- Security-event generation associated with configured deception triggers.

The application is used to test the behavior of these resources and observe the resulting events in the available Wotmed-Net telemetry interface and SOC Dashboard.

## Security Event and Telemetry Context

Wotmed-Net telemetry provides a way to observe security-related events generated during testing.

For example, a separately observed telemetry record for `POST /api/test` contained the following fields:

- `incident_id`: An incident identifier.
- `client_ip`: The recorded client address.
- `user_agent`: The recorded client software information.
- `path` and `method`: The request path and HTTP method.
- `threat_score`: The score recorded for that event.
- `action_taken`: The action recorded by the security system.
- `triggered_flags`: The detection flags associated with the event.
- `created_at`: The event timestamp.

That record reported a threat score of `100`, the action `BLOCK_AND_REDIRECT_HONEYPOT`, and the flags `ABNORMAL_HEADER_ORDER` and `CANARY_TOKEN_TRAPPED`.

This is an example of a recorded security telemetry event. It should be treated separately from the honeytoken, canary endpoint, canary file, and decoy administrative test results. It does not establish that all deception events receive the same score, action, or flags.

## Testing and Verification

Testing of the adapted reference application focuses on:

1. Checking the observed HTTP responses from configured deception resources.
2. Confirming that the expected deception event types are generated during local tests.
3. Checking whether the events are visible in the available telemetry interface.
4. Checking whether corresponding alerts appear in the SOC Dashboard.
5. Separately checking normal application endpoints to identify unintended disruption.

Screenshots and their descriptions are maintained in `demo-app/evidence/README.md`.

The evidence documents the behavior observed during local testing. Production readiness, complete end-to-end integration, reliable event delivery, and persistent storage must not be claimed without separate verification.

## Scope of Contribution

My contribution focuses on the **Demo App & Deception Tester** role: testing deception resources within the existing reference application, checking endpoint behavior, and verifying the visibility of related security events in the available monitoring interfaces.

The implementation and maintenance of the wider telemetry infrastructure, database persistence pipeline, and SOC Dashboard remain separate responsibilities unless additional work and evidence establish otherwise.
