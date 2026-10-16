# Wotmed-Net Demo App & Deception Tester

**Lead:** Eman Mohammednur Ahmed  
**Component:** Demo Application and Deception Testing

## Overview

The `demo-app` component uses the existing Student Management System as the reference application for demonstrating and testing Wotmed-Net deception mechanisms.

The application has been adapted for controlled security testing. The work focuses on detecting interactions with designated deception resources, generating associated security events, and verifying their visibility in the available Wotmed-Net telemetry and SOC Dashboard interfaces.

## Responsibilities

This component covers:

- Reference application assessment and adaptation.
- Deception mechanism implementation and testing.
- Honeytoken and canary resource testing.
- Deception trigger verification.
- Security-event generation verification.
- Application functionality checks.
- Verification of event visibility in Wotmed-Net telemetry.
- Verification of corresponding SOC Dashboard alerts.
- Documentation of test results and supporting evidence.

## Documentation

The following documents describe the component and its testing activities:

- [Reference Application](reference-application.md)
- [Deception Mechanisms](deception.md)
- [Honeytokens and Canary Resources](honeytokens-and-canaries.md)
- [Demo Application Testing](testing.md)
- [Evidence Screenshots](evidence/README.md)

## Current Testing Scope

Local testing has covered four deception mechanisms:

1. Honeytoken resource.
2. Canary endpoint.
3. Canary file resource.
4. Decoy administrative resource.

The collected evidence includes endpoint responses, telemetry event visibility, SOC Dashboard alerts, and live-event views.

These results document observed behavior in the local testing environment. They do not independently establish production readiness, persistent event storage, or complete end-to-end reliability.

## Security

All testing is intended for the authorized Wotmed-Net development and testing environment.

Deception resources must use controlled test values and must not expose real credentials, production secrets, or sensitive production data.

Testing should be performed in a controlled environment, and any claims about implementation or integration should be supported by the relevant code and verification evidence.
