[Wotmed SOC Telemetry Stream]: {
  "incident_id": "inc_sdfp7z4h_1789766126241",
  "client_ip": "::1",
  "user_agent": "Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.9444",
  "path": "/api/test",
  "method": "POST",
  "tls_fingerprint": "AUTOMATED_CLIENT_TLS",
  "threat_score": 100,
  "action_taken": "BLOCK_AND_REDIRECT_HONEYPOT",
  "triggered_flags": [
    "ABNORMAL_HEADER_ORDER",
    "CANARY_TOKEN_TRAPPED"
  ],
  "created_at": "2026-09-18T21:15:26.241Z"
}
# Reference Application

## Overview

The Demo Application uses an existing Student Management System as
the reference application for the Wotmed-Net project.

The existing application provides the basic functionality required
for the security demonstration environment. It will be adapted
rather than replaced with a completely new application.

## Application Features

The reference application provides:

- User authentication
- Student management
- Course management
- Department management
- Dashboard functionality
- Database operations

## Application Structure

The application consists of three main parts:

- Frontend
- Backend / API
- MySQL Database

## Frontend

The frontend provides the user interface and allows users to interact
with the Student Management System.

## Backend

The backend provides the API and handles application requests,
application logic, and communication with the database.

## Database

MySQL is used to store the application's data and support the
backend database operations.

## Adaptation for Wotmed-Net

The existing Student Management System will be adapted to support
the Wotmed-Net demonstration environment.

The adaptation will include:

- Deception resources
- Honeytokens
- Canary resources
- Deception triggers
- Security event generation

The application will continue to provide its normal functionality
while the additional security mechanisms are tested in a controlled
environment.