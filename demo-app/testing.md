# Demo Application Testing

## Overview

Testing will be used to verify that the Student Management System
continues to work normally while the deception mechanisms detect
controlled suspicious interactions.

Testing will be performed only within the authorized Wotmed-Net
development and testing environment.

## Functional Testing

The reference application will first be tested to confirm that its
normal functionality works correctly.

Testing will cover:

- User authentication
- Student management
- Course management
- Department management
- Dashboard functionality
- Database operations

## Deception Testing

After the normal application functionality has been verified, the
deception mechanisms will be tested individually.

The tests will verify that:

- Decoy resources can be accessed in the test environment.
- Honeytokens can be triggered.
- Canary resources can be triggered.
- Deception triggers are detected.
- Security events are generated.

## Honeytoken Testing

A controlled test will interact with a honeytoken and verify that
the application detects the interaction.

Expected flow:

Honeytoken Interaction
        ↓
Trigger Detected
        ↓
Security Event
        ↓
Telemetry

## Canary Testing

A controlled request will be sent to a canary resource.

The test will verify that the unexpected access is detected and that
the appropriate security event is generated.

Expected flow:

Canary Request
        ↓
Access Detected
        ↓
Deception Trigger
        ↓
Security Event

## Telemetry Verification

Generated deception events will be checked to verify that the
expected event information is available to the Wotmed-Net telemetry
component.

The final verification will depend on the telemetry implementation
used by the project.

## Integration Testing

The final testing stage will verify the interaction between the Demo
Application and the Wotmed-Net components.

The expected workflow is:

Demo Application
        ↓
Deception Trigger
        ↓
Security Event
        ↓
Wotmed-Net
        ↓
Telemetry

## Test Results

Actual test results will be added after the corresponding features
have been implemented and tested.

Each test result should record:

- Test name
- Test condition
- Expected result
- Actual result
- Pass / Fail status
- Supporting evidence