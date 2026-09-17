"""
Wotmed-Net Security Test Runner

Controlled security testing framework for authorized environments.
Validates observable Wotmed-Net defense behavior through HTTP responses.
"""

import sys
import time

import requests

from config import (
    PROJECT_NAME,
    TARGET_URL,
    TEST_ENDPOINT,
    REQUEST_TIMEOUT,
    AUTHORIZED_TARGET,
)

from test_cases import (
    SQL_INJECTION_TESTS,
    XSS_TESTS,
    PATH_TRAVERSAL_TESTS,
    BRUTE_FORCE_ATTEMPTS,
)

from reporter import generate_report


# =========================================================
# Observable Wotmed-Net Response Signatures
# =========================================================

HONEYPOT_SIGNATURE = "Database transaction execution fault"
TARPIT_SIGNATURE = "Wotmed-Net-Tarpit-Node"


# =========================================================
# Standard Test Headers
# =========================================================

TEST_HEADERS = {
    "Accept": "application/json",
    "User-Agent": "Wotmed-Security-Tester/1.0",
    "Content-Type": "application/json",
}


# =========================================================
# Request Helper
# =========================================================

def send_test_request(payload):
    """
    Send one controlled security test request.

    The payload is placed in the username field because the
    current Wotmed-Net test endpoint accepts JSON login data.
    """

    url = f"{TARGET_URL}{TEST_ENDPOINT}"

    body = {
        "username": payload,
        "password": "controlled-security-test",
    }

    start_time = time.perf_counter()

    try:
        response = requests.post(
            url,
            json=body,
            headers=TEST_HEADERS,
            timeout=REQUEST_TIMEOUT,
        )

        elapsed = time.perf_counter() - start_time

        return {
            "success": True,
            "status_code": response.status_code,
            "response_time": round(elapsed, 4),
            "url": response.url,
            "response_body": response.text,
            "error": None,
        }

    except requests.RequestException as error:

        elapsed = time.perf_counter() - start_time

        return {
            "success": False,
            "status_code": None,
            "response_time": round(elapsed, 4),
            "url": url,
            "response_body": None,
            "error": str(error),
        }


# =========================================================
# Result Evaluation
# =========================================================

def evaluate_result(category, result, attempt=None):
    """
    Evaluate observable Wotmed-Net defense behavior.

    The tester evaluates what can be observed through the
    HTTP response rather than assuming internal engine flags.

    For brute-force testing, attempts before the configured
    threshold are expected to remain undetected. The final
    threshold attempt is expected to trigger a defense.
    """

    if not result["success"]:

        return {
            "test_status": "REQUEST_FAILED",
            "detection_result": "UNKNOWN",
            "defense_action": "UNKNOWN",
            "blocking_status": "UNKNOWN",
        }

    status_code = result["status_code"]
    response_body = result["response_body"] or ""

    # -----------------------------------------------------
    # SQL Injection
    # -----------------------------------------------------

    if category == "SQL Injection":

        detected = (
            status_code == 500
            and HONEYPOT_SIGNATURE in response_body
        )

        return {
            "test_status": (
                "TEST_PASSED"
                if detected
                else "TEST_FAILED"
            ),
            "detection_result": (
                "DETECTED"
                if detected
                else "NOT_DETECTED"
            ),
            "defense_action": (
                "BLOCK_AND_REDIRECT_HONEYPOT"
                if detected
                else "ALLOW"
            ),
            "blocking_status": (
                "BLOCKED"
                if detected
                else "NOT_BLOCKED"
            ),
        }

    # -----------------------------------------------------
    # Cross-Site Scripting
    # -----------------------------------------------------

    if category == "Cross-Site Scripting":

        detected = (
            TARPIT_SIGNATURE in response_body
            or (
                status_code == 500
                and HONEYPOT_SIGNATURE in response_body
            )
        )

        return {
            "test_status": (
                "TEST_PASSED"
                if detected
                else "TEST_FAILED"
            ),
            "detection_result": (
                "DETECTED"
                if detected
                else "NOT_DETECTED"
            ),
            "defense_action": (
                "AUTONOMOUS_DYNAMIC_TARPIT"
                if TARPIT_SIGNATURE in response_body
                else (
                    "BLOCK_AND_REDIRECT_HONEYPOT"
                    if detected
                    else "ALLOW"
                )
            ),
            "blocking_status": (
                "TARPITTED"
                if TARPIT_SIGNATURE in response_body
                else (
                    "BLOCKED"
                    if detected
                    else "NOT_BLOCKED"
                )
            ),
        }

    # -----------------------------------------------------
    # Path Traversal
    # -----------------------------------------------------

    if category == "Path Traversal":

        detected = (
            status_code == 500
            and HONEYPOT_SIGNATURE in response_body
        )

        return {
            "test_status": (
                "TEST_PASSED"
                if detected
                else "TEST_FAILED"
            ),
            "detection_result": (
                "DETECTED"
                if detected
                else "NOT_DETECTED"
            ),
            "defense_action": (
                "BLOCK_AND_REDIRECT_HONEYPOT"
                if detected
                else "ALLOW"
            ),
            "blocking_status": (
                "BLOCKED"
                if detected
                else "NOT_BLOCKED"
            ),
        }

    # -----------------------------------------------------
    # Brute Force
    # -----------------------------------------------------

    if category == "Brute Force":

        detected = (
            TARPIT_SIGNATURE in response_body
            or (
                status_code == 500
                and HONEYPOT_SIGNATURE in response_body
            )
        )

        # Before the threshold:
        # NOT_DETECTED is the expected behavior.
        if attempt is not None and attempt < BRUTE_FORCE_ATTEMPTS:

            return {
                "test_status": (
                    "TEST_PASSED"
                    if not detected
                    else "TEST_FAILED"
                ),
                "detection_result": (
                    "DETECTED"
                    if detected
                    else "NOT_DETECTED"
                ),
                "defense_action": (
                    "AUTONOMOUS_DYNAMIC_TARPIT"
                    if TARPIT_SIGNATURE in response_body
                    else (
                        "BLOCK_AND_REDIRECT_HONEYPOT"
                        if detected
                        else "ALLOW"
                    )
                ),
                "blocking_status": (
                    "TARPITTED"
                    if TARPIT_SIGNATURE in response_body
                    else (
                        "BLOCKED"
                        if detected
                        else "NOT_BLOCKED"
                    )
                ),
            }

        # Final threshold attempt:
        # Detection is required.
        return {
            "test_status": (
                "TEST_PASSED"
                if detected
                else "TEST_FAILED"
            ),
            "detection_result": (
                "DETECTED"
                if detected
                else "NOT_DETECTED"
            ),
            "defense_action": (
                "AUTONOMOUS_DYNAMIC_TARPIT"
                if TARPIT_SIGNATURE in response_body
                else (
                    "BLOCK_AND_REDIRECT_HONEYPOT"
                    if detected
                    else "ALLOW"
                )
            ),
            "blocking_status": (
                "TARPITTED"
                if TARPIT_SIGNATURE in response_body
                else (
                    "BLOCKED"
                    if detected
                    else "NOT_BLOCKED"
                )
            ),
        }

    # -----------------------------------------------------
    # Unknown Category
    # -----------------------------------------------------

    return {
        "test_status": "UNKNOWN",
        "detection_result": "UNKNOWN",
        "defense_action": "UNKNOWN",
        "blocking_status": "UNKNOWN",
    }


# =========================================================
# Common Result Builder
# =========================================================

def build_test_result(
    test,
    result,
    evaluation,
    attempt=None,
):
    """
    Build a normalized result object for reporting.
    """

    test_result = {
        "test_name": test["name"],
        "category": test["category"],
        "payload": test.get("payload", ""),
        "status_code": result["status_code"],
        "response_time": result["response_time"],
        "success": result["success"],
        "error": result["error"],
        "test_status": evaluation["test_status"],
        "detection_result": evaluation["detection_result"],
        "defense_action": evaluation["defense_action"],
        "blocking_status": evaluation["blocking_status"],
    }

    if attempt is not None:
        test_result["attempt"] = attempt

    return test_result


# =========================================================
# Result Printer
# =========================================================

def print_test_result(test_result):
    """
    Print one normalized test result.
    """

    print(
        f"  Status: {test_result['status_code']} | "
        f"Response: {test_result['response_time']}s"
    )

    print(
        f"  Detection: {test_result['detection_result']}"
    )

    print(
        f"  Defense: {test_result['defense_action']}"
    )

    print(
        f"  Blocking: {test_result['blocking_status']}"
    )

    print(
        f"  Result: {test_result['test_status']}"
    )

    if test_result["error"]:
        print(
            f"  Error: {test_result['error']}"
        )


# =========================================================
# SQL Injection Tests
# =========================================================

def run_sql_injection_tests():

    print("\n[SQL Injection Tests]")
    print("-" * 40)

    results = []

    for test in SQL_INJECTION_TESTS:

        print(f"Testing: {test['name']}")

        result = send_test_request(
            test["payload"]
        )

        evaluation = evaluate_result(
            test["category"],
            result,
        )

        test_result = build_test_result(
            test,
            result,
            evaluation,
        )

        results.append(test_result)

        print_test_result(test_result)

    return results


# =========================================================
# XSS Tests
# =========================================================

def run_xss_tests():

    print("\n[Cross-Site Scripting Tests]")
    print("-" * 40)

    results = []

    for test in XSS_TESTS:

        print(f"Testing: {test['name']}")

        result = send_test_request(
            test["payload"]
        )

        evaluation = evaluate_result(
            test["category"],
            result,
        )

        test_result = build_test_result(
            test,
            result,
            evaluation,
        )

        results.append(test_result)

        print_test_result(test_result)

    return results


# =========================================================
# Path Traversal Tests
# =========================================================

def run_path_traversal_tests():

    print("\n[Path Traversal Tests]")
    print("-" * 40)

    results = []

    for test in PATH_TRAVERSAL_TESTS:

        print(f"Testing: {test['name']}")

        result = send_test_request(
            test["payload"]
        )

        evaluation = evaluate_result(
            test["category"],
            result,
        )

        test_result = build_test_result(
            test,
            result,
            evaluation,
        )

        results.append(test_result)

        print_test_result(test_result)

    return results


# =========================================================
# Controlled Brute Force Test
# =========================================================

def run_brute_force_test():

    print("\n[Controlled Brute Force Test]")
    print("-" * 40)

    results = []

    for attempt in range(
        1,
        BRUTE_FORCE_ATTEMPTS + 1
    ):

        print(
            f"Attempt {attempt}/{BRUTE_FORCE_ATTEMPTS}"
        )

        payload = (
            f"controlled-invalid-login-{attempt}"
        )

        result = send_test_request(payload)

        evaluation = evaluate_result(
            "Brute Force",
            result,
            attempt=attempt,
        )

        test_definition = {
            "name": (
                f"Controlled Login Brute Force "
                f"Attempt {attempt}"
            ),
            "category": "Brute Force",
            "payload": payload,
        }

        test_result = build_test_result(
            test_definition,
            result,
            evaluation,
            attempt=attempt,
        )

        test_result["expected_behavior"] = (
            "EXPECTED_NOT_DETECTED"
            if attempt < BRUTE_FORCE_ATTEMPTS
            else "EXPECTED_DETECTED"
        )

        results.append(test_result)

        print_test_result(test_result)

        print(
            f"  Expected: "
            f"{test_result['expected_behavior']}"
        )

    # -----------------------------------------------------
    # Suite-Level Validation
    # -----------------------------------------------------

    defense_triggered = any(
        result["detection_result"] == "DETECTED"
        for result in results
    )

    final_attempt_detected = (
        len(results) >= BRUTE_FORCE_ATTEMPTS
        and results[
            BRUTE_FORCE_ATTEMPTS - 1
        ]["detection_result"] == "DETECTED"
    )

    all_requests_successful = all(
        result["success"]
        for result in results
    )

    suite_passed = (
        defense_triggered
        and final_attempt_detected
        and all_requests_successful
    )

    print("\nBrute Force Suite Result:")

    print(
        "  Defense Triggered: "
        f"{'YES' if defense_triggered else 'NO'}"
    )

    print(
        "  Threshold Attempt Detected: "
        f"{'YES' if final_attempt_detected else 'NO'}"
    )

    print(
        "  Suite Status: "
        f"{'TEST_PASSED' if suite_passed else 'TEST_FAILED'}"
    )

    return results


# =========================================================
# Test Summary
# =========================================================

def print_summary(results):
    """
    Print a compact summary of the executed security tests.
    """

    total = len(results)

    successful = sum(
        1
        for result in results
        if result.get("success") is True
    )

    failed_requests = sum(
        1
        for result in results
        if result.get("success") is False
    )

    passed_tests = sum(
        1
        for result in results
        if result.get("test_status") == "TEST_PASSED"
    )

    failed_tests = sum(
        1
        for result in results
        if result.get("test_status") == "TEST_FAILED"
    )

    detected = sum(
        1
        for result in results
        if result.get("detection_result") == "DETECTED"
    )

    print("\n" + "=" * 60)
    print("Security Test Summary")
    print("=" * 60)

    print(f"Total tests   : {total}")
    print(f"Passed tests  : {passed_tests}")
    print(f"Failed tests  : {failed_tests}")
    print(f"Detected      : {detected}")
    print(f"Request OK    : {successful}")
    print(f"Request Failed: {failed_requests}")

    if total > 0:
        detection_rate = (detected / total) * 100
        request_success_rate = (successful / total) * 100

        print(f"Detection rate: {detection_rate:.2f}%")
        print(f"Request success: {request_success_rate:.2f}%")


# =========================================================
# Main Runner
# =========================================================

def main():
    """
    Run the full security test suite for the configured target.
    """

    if not AUTHORIZED_TARGET:
        print(
            "Testing stopped: target is not authorized.",
            file=sys.stderr,
        )
        return 2

    print("=" * 60)
    print(PROJECT_NAME)
    print("Security Testing Framework")
    print("=" * 60)

    print(f"\nTarget   : {TARGET_URL}")
    print(f"Endpoint : {TEST_ENDPOINT}")
    print(f"Timeout  : {REQUEST_TIMEOUT}s")
    print("\nStarting controlled security tests...")

    all_results = []
    all_results.extend(run_sql_injection_tests())
    all_results.extend(run_xss_tests())
    all_results.extend(run_path_traversal_tests())
    all_results.extend(run_brute_force_test())

    print_summary(all_results)

    generate_report(all_results)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
