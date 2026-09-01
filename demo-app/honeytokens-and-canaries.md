# Honeytokens and Canary Resources

## Overview

Honeytokens and canary resources will be used by the Demo Application
to identify suspicious interaction within the controlled Wotmed-Net
testing environment.

These resources will be designed so that they do not contain real
credentials, production secrets, or sensitive information.

## Honeytokens

Honeytokens are fake values or resources that can be monitored for
unexpected access or use.

Planned honeytokens include:

- Fake administrative credentials
- Decoy configuration values
- Decoy API keys
- Fake sensitive-looking files

The values will be created specifically for the test environment.

## Honeytoken Trigger

A honeytoken trigger occurs when a test user or simulated attacker
accesses or attempts to use a honeytoken.

The application can record the interaction and generate a security
event.

Example:

Fake Credential
        ↓
Credential Used
        ↓
Interaction Detected
        ↓
Security Event

## Canary Resources

Canary resources are controlled resources that are not expected to be
accessed during normal application use.

Planned canary resources may include:

- Canary endpoints
- Canary files
- Decoy administrative resources

An unexpected request to one of these resources can be treated as a
deception event.

## Canary Trigger

The basic canary workflow is:

Request
        ↓
Canary Resource
        ↓
Access Detected
        ↓
Deception Trigger
        ↓
Security Event

## Security Event

When a honeytoken or canary resource is triggered, the application
will record information about the interaction.

The event may include information such as:

- Event type
- Triggered resource
- Request information
- Timestamp
- Source information
- Detection status

The final event format will be coordinated with the Wotmed-Net
telemetry implementation.

## Implementation Status

The honeytokens and canary resources are part of the planned
deception implementation.

Specific resources and trigger behavior will be updated in this
document as they are implemented and tested.