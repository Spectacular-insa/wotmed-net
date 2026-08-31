# Reference App & Honeytoken Configurations Proposal
**Author:** Eman Mohammednur Ahmed (Demo App & Deception Tester)

## 1. Reference Application Architecture
- A multi-tier sample web application (simulated enterprise portal or e-commerce shop) built to integrate directly with the Wotmed-Net active defense middleware.

## 2. Honeytoken & Canary Design
- Strategically embeds hidden form fields, invisible administrative endpoints, fake database credentials, and canary files designed exclusively to detect unauthorized probing.

## 3. Deception Workflow & Trigger Mapping
- Any interaction with honeytokens instantly generates high-priority telemetry alerts and triggers active defense countermeasures.

## 4. Verification Testing Scenarios
- Baseline functional tests ensuring the reference application remains fully operational for legitimate users while deceptive traps remain active.