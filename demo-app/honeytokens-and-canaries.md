# Honeytokens and Canary Resources

## Overview

Honeytokens and canary resources are used by the Demo Application to identify suspicious interactions within the controlled Wotmed-Net testing environment.

The resources are integrated into the existing Student Management reference application for local security testing. They are designed to use controlled, non-production values and must not expose real credentials, production secrets, or sensitive data.

Local testing has covered the honeytoken, canary endpoint, canary file resource, and decoy administrative resource. The collected evidence is maintained in `demo-app/evidence/README.md`.

## Honeytokens

A honeytoken is a decoy value or resource designed to detect unexpected access or use.

The implemented honeytoken mechanism uses a designated decoy administrative token identifier:

`WOTMED-DECOY-ADMIN-TOKEN`

This identifier is a decoy resource label, not a real credential.

Other possible honeytoken examples include:

- Fake administrative credentials.
- Decoy configuration values.
- Fake API keys.
- Synthetic sensitive-looking files.

These additional examples remain proposed unless they are implemented and independently tested.

## Honeytoken Trigger

A honeytoken trigger occurs when an interaction with the designated honeytoken resource is detected.

The tested workflow is:

Honeytoken Resource  
↓  
Interaction Detected  
↓  
Security Event Generated  
↓  
Telemetry Event Observed  
↓  
Related SOC Dashboard Alert

The locally observed event type is:

`honeytoken_triggered`

The collected screenshots document the endpoint response and the corresponding telemetry, SOC Dashboard, and live-event views.

## Canary Resources

Canary resources are controlled resources used to detect unexpected access attempts.

The implemented and tested resources include:

- **Canary endpoint:** A designated endpoint used to detect access attempts.
- **Canary file resource:** A designated resource used to detect requests for a canary file.
- **Decoy administrative resource:** A decoy endpoint used to detect suspicious administrative-resource access.

These resources are intended for controlled testing and should not contain genuine sensitive information.

## Canary Triggers

A canary trigger occurs when a request reaches a configured canary or decoy resource.

The general workflow is:

Request Received  
↓  
Configured Resource Accessed  
↓  
Trigger Detected  
↓  
Security Event Generated  
↓  
Telemetry and Dashboard Visibility

The locally observed event types are:

| Resource | Observed event type |
|---|---|
| Canary endpoint | `canary_triggered` |
| Canary file resource | `canary_file_triggered` |
| Decoy administrative resource | `decoy_admin_triggered` |

The tested endpoint requests returned HTTP 403 responses in the captured evidence. These responses document the observed behavior of the tested requests; they should not be interpreted as proof that every possible access path is blocked.

## Security Events

When a configured honeytoken or canary resource is triggered, the application can generate a security event for monitoring and analysis.

Relevant event information depends on the implemented event schema and may include:

- Event type.
- Triggered resource or resource identifier.
- Timestamp.
- Available request context.
- Detection status.
- Other fields defined by the agreed telemetry contract.

Only fields confirmed by the implementation should be documented as guaranteed event properties. Source information, severity, and threat-score values must not be assumed to be complete or accurate without verification.

The tested event types were observed in the local telemetry interface, with corresponding alerts visible in the SOC Dashboard during testing.

## Implementation Status

| Mechanism or capability | Status |
|---|---|
| Honeytoken resource | Implemented — locally tested |
| Honeytoken trigger event | Observed during local testing |
| Canary endpoint | Implemented — locally tested |
| Canary file resource | Implemented — locally tested |
| Decoy administrative resource | Implemented — locally tested |
| Related telemetry events | Observed during local testing |
| Corresponding SOC Dashboard alerts | Observed during local testing |
| Additional proposed honeytoken types | Planned / not verified |
| Complete production integration and persistent storage | Not verified |

## Verification and Evidence

The evidence screenshots are stored in `demo-app/evidence/` and indexed in `demo-app/evidence/README.md`.

They document four stages for each tested mechanism:

1. Endpoint response.
2. Telemetry event visibility.
3. SOC Dashboard alert visibility.
4. Live-event visibility.

These captures support the specific local observations shown. They do not independently prove production readiness, persistent database storage, complete threat-score mapping, or reliable delivery under all conditions.

## Scope

This work focuses on the Demo App & Deception Tester role: testing controlled honeytokens and canary resources, checking their observed responses, and verifying the visibility of generated events in the available Wotmed-Net monitoring interfaces.
