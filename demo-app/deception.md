# Deception Mechanisms

## Overview

The Demo Application uses controlled deception mechanisms to help identify suspicious interactions within the Wotmed-Net testing environment.

The mechanisms are being integrated into the existing Student Management System to detect interactions with designated decoy resources while preserving normal application functionality.

The implementation is tested locally. The evidence collected covers endpoint responses, security-event generation, telemetry visibility, and corresponding SOC Dashboard alerts.

## Decoy Resources

Decoy resources are application resources designed specifically for security testing and detection. They appear as resources that should not normally be accessed during legitimate application use.

The implemented and tested deception resources include:

- **Honeytoken:** A designated decoy token used to detect suspicious interaction.
- **Canary endpoint:** A controlled endpoint used to detect access attempts.
- **Canary file resource:** A controlled resource used to detect requests for a designated canary file.
- **Decoy administrative resource:** A decoy endpoint used to detect suspicious access attempts.

Additional decoy resources, such as fake configuration values and other hidden application resources, may be considered for future testing.

Decoy resources must not contain real credentials, genuine secrets, or production data.

## Deception Triggers

A deception trigger occurs when a request interacts with a configured deception resource.

Examples include:

- Accessing the designated honeytoken resource.
- Requesting the canary endpoint.
- Requesting the canary file resource.
- Accessing the decoy administrative endpoint.

When a configured trigger is detected, the application can generate a security event associated with the interaction.

The locally tested event types include:

| Deception mechanism | Observed event type |
|---|---|
| Honeytoken | `honeytoken_triggered` |
| Canary endpoint | `canary_triggered` |
| Canary file | `canary_file_triggered` |
| Decoy administrative resource | `decoy_admin_triggered` |

These event names describe the tested implementation and should remain consistent with the event names used by the relevant application and telemetry components.

## Deception Workflow

The intended workflow is:

Suspicious Interaction  
↓  
Deception Resource Accessed  
↓  
Trigger Detected  
↓  
Security Event Generated  
↓  
Telemetry Event Observed  
↓  
Corresponding SOC Dashboard Alert

Local testing has produced evidence of endpoint responses, associated events in the available telemetry interface, and corresponding alerts displayed in the SOC Dashboard.

This verifies the observed parts of the workflow in the local testing environment. It does not, by itself, establish that every stage is fully integrated or that events are persisted reliably in a production environment.

## Security Event Information

When a deception trigger is detected, the application generates a security event for monitoring and analysis.

The event should identify the relevant trigger and include the fields required by the agreed Wotmed-Net telemetry format.

The event schema, field mapping, delivery behavior, and persistence requirements must be verified against the telemetry component's implementation and agreed interface contract. No unverified schema or delivery guarantee should be assumed.

## Wotmed-Net Integration

The Demo Application's deception mechanisms are intended to provide security events to the Wotmed-Net telemetry system so that they can be observed by the relevant monitoring components.

Local evidence includes the visibility of the tested deception events in the telemetry interface and related alerts in the SOC Dashboard.

The following areas require separate verification before the complete integration can be described as fully operational:

- Agreement between the application's security-event fields and the telemetry schema.
- Reliable event transmission and handling of delivery failures.
- Event persistence and retrieval, where required by the system design.
- Consistent event identification and severity mapping across components.
- Verification of threat-score calculations and their interpretation.

The presence of an event in a local interface should not be treated as proof of database persistence, production deployment, or complete end-to-end reliability.

## Implementation and Verification Status

| Component | Status |
|---|---|
| Honeytoken deception mechanism | Implemented — locally tested |
| Canary endpoint | Implemented — locally tested |
| Canary file resource | Implemented — locally tested |
| Decoy administrative resource | Implemented — locally tested |
| Related security-event generation | Observed during local testing |
| Telemetry event visibility | Observed during local testing |
| Corresponding SOC Dashboard alerts | Observed during local testing |
| Complete production telemetry integration | Not verified |
| Persistent storage and reliable event recovery | Not verified |
| Complete threat-score mapping | Not verified |
| Additional proposed decoy resources | Planned / not verified |

The detailed endpoint, telemetry, dashboard, and live-event screenshots are maintained in `demo-app/evidence/README.md`.

## Implementation Approach

The deception mechanisms were introduced into the existing Student Management System and tested individually in the local environment.

Testing focused on confirming that:

1. Requests to configured deception resources produced the expected observed HTTP responses.
2. The corresponding security events were generated and visible in the available telemetry interface.
3. Related alerts appeared in the SOC Dashboard during testing.
4. Normal application functionality could still be checked separately from the deception tests.

The collected evidence documents the behavior observed during these tests. Further verification is required for production deployment, persistent storage, complete telemetry reliability, and any integration behavior not directly covered by the available evidence.

## Scope of Contribution

My contribution focuses on **Demo App & Deception Testing**: working with the existing reference application, testing 
configured deception resources, checking endpoint behavior, and verifying the visibility of the resulting security events in the available monitoring interfaces.

Backend telemetry infrastructure, SOC Dashboard implementation, and complete production integration are separate concerns and should only be reported as completed when supported by their own implementation and verification evidence.
