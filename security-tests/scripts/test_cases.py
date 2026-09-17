"""
Controlled security test cases for Wotmed-Net.

These test cases are intended for authorized local/test environments only.
"""

# ---------------------------------------------------------
# SQL Injection
# ---------------------------------------------------------

SQL_INJECTION_TESTS = [
    {
        "name": "SQLi Authentication Bypass",
        "category": "SQL Injection",
        "payload": "' OR '1'='1",
        "description": "Tests whether SQL injection patterns are detected."
    },
    {
        "name": "SQLi UNION Probe",
        "category": "SQL Injection",
        "payload": "' UNION SELECT NULL--",
        "description": "Tests detection of UNION-based SQL injection patterns."
    },
]


# ---------------------------------------------------------
# Cross-Site Scripting
# ---------------------------------------------------------

XSS_TESTS = [
    {
        "name": "Basic Script Injection",
        "category": "Cross-Site Scripting",
        "payload": "<script>alert(1)</script>",
        "description": "Tests detection of basic script injection."
    },
    {
        "name": "Image Event Handler Injection",
        "category": "Cross-Site Scripting",
        "payload": "<img src=x onerror=alert(1)>",
        "description": "Tests detection of an event-handler XSS pattern."
    },
]


# ---------------------------------------------------------
# Path Traversal
# ---------------------------------------------------------

PATH_TRAVERSAL_TESTS = [
    {
        "name": "Basic Path Traversal",
        "category": "Path Traversal",
        "payload": "../test.txt",
        "description": "Tests detection of basic directory traversal."
    },
    {
        "name": "Nested Path Traversal",
        "category": "Path Traversal",
        "payload": "../../test.txt",
        "description": "Tests detection of nested directory traversal."
    },
]


# ---------------------------------------------------------
# Brute Force
# ---------------------------------------------------------

BRUTE_FORCE_ATTEMPTS = 5

BRUTE_FORCE_TEST = {
    "name": "Controlled Login Brute Force",
    "category": "Brute Force",
    "attempts": BRUTE_FORCE_ATTEMPTS,
    "description": (
        "Performs a small number of controlled authentication attempts "
        "against an authorized test endpoint."
    )
}