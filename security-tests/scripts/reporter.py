"""
Wotmed-Net Security Test Reporter

Collects, summarizes, and exports security test results
to JSON and CSV formats.

This module is intended for authorized testing environments.
"""

import csv
import json
import os
from collections import defaultdict
from datetime import datetime, timezone


# =========================================================
# Report Directory
# =========================================================

def create_report_directory():
    """
    Create the results directory if it does not exist.

    Returns:
        str: Absolute path to the results directory.
    """

    security_tests_directory = os.path.dirname(
        os.path.dirname(os.path.abspath(__file__))
    )

    report_directory = os.path.join(
        security_tests_directory,
        "results"
    )

    os.makedirs(
        report_directory,
        exist_ok=True
    )

    return report_directory


# =========================================================
# Timestamp
# =========================================================

def add_timestamp(results):
    """
    Add a UTC timestamp to every test result.
    """

    for result in results:

        result["timestamp"] = datetime.now(
            timezone.utc
        ).isoformat()

    return results


# =========================================================
# Category Metrics
# =========================================================

def create_category_metrics(results):
    """
    Calculate security metrics for each attack category.

    Metrics include:
        - total tests
        - detected tests
        - passed tests
        - failed tests
        - request failures
        - detection rate
    """

    categories = defaultdict(list)

    for result in results:

        category = result.get(
            "category",
            "Unknown"
        )

        categories[category].append(result)

    category_metrics = {}

    for category, tests in categories.items():

        total = len(tests)

        detected = sum(
            1
            for test in tests
            if test.get("detection_result")
            == "DETECTED"
        )

        passed = sum(
            1
            for test in tests
            if test.get("test_status")
            == "TEST_PASSED"
        )

        failed = sum(
            1
            for test in tests
            if test.get("test_status")
            == "TEST_FAILED"
        )

        request_failed = sum(
            1
            for test in tests
            if test.get("test_status")
            == "REQUEST_FAILED"
        )

        valid_tests = total - request_failed

        detection_rate = (
            (detected / valid_tests) * 100
            if valid_tests > 0
            else 0
        )

        category_metrics[category] = {
            "total_tests": total,
            "detected": detected,
            "passed": passed,
            "failed": failed,
            "request_failures": request_failed,
            "detection_rate": round(
                detection_rate,
                2
            ),
        }

    return category_metrics


# =========================================================
# Security Summary
# =========================================================

def create_summary(results):
    """
    Create a complete security test summary.
    """

    total = len(results)

    successful_requests = sum(
        1
        for result in results
        if result.get("success") is True
    )

    failed_requests = sum(
        1
        for result in results
        if result.get("success") is False
    )

    tests_passed = sum(
        1
        for result in results
        if result.get("test_status")
        == "TEST_PASSED"
    )

    tests_failed = sum(
        1
        for result in results
        if result.get("test_status")
        == "TEST_FAILED"
    )

    request_failures = sum(
        1
        for result in results
        if result.get("test_status")
        == "REQUEST_FAILED"
    )

    detected_tests = sum(
        1
        for result in results
        if result.get("detection_result")
        == "DETECTED"
    )

    valid_tests = total - request_failures

    detection_rate = (
        (detected_tests / valid_tests) * 100
        if valid_tests > 0
        else 0
    )

    response_times = [
        result.get("response_time")
        for result in results
        if isinstance(
            result.get("response_time"),
            (int, float)
        )
    ]

    average_response_time = (
        sum(response_times) / len(response_times)
        if response_times
        else 0
    )

    request_success_rate = (
        (successful_requests / total) * 100
        if total > 0
        else 0
    )

    return {
        "total_tests": total,

        "tests_passed": tests_passed,

        "tests_failed": tests_failed,

        "request_failures": request_failures,

        "detected_tests": detected_tests,

        "detection_rate": round(
            detection_rate,
            2
        ),

        "successful_requests": successful_requests,

        "failed_requests": failed_requests,

        "request_success_rate": round(
            request_success_rate,
            2
        ),

        "average_response_time": round(
            average_response_time,
            4
        ),

        "generated_at": datetime.now(
            timezone.utc
        ).isoformat(),
    }


# =========================================================
# JSON Report
# =========================================================

def save_json(
    results,
    summary,
    category_metrics
):
    """
    Save complete security test results as JSON.
    """

    report_directory = create_report_directory()

    file_path = os.path.join(
        report_directory,
        "security_test_results.json"
    )

    report = {
        "project": "Wotmed-Net",

        "report_type":
            "Security Test Report",

        "summary": summary,

        "category_metrics":
            category_metrics,

        "results": results,
    }

    with open(
        file_path,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            report,
            file,
            indent=4,
            ensure_ascii=False
        )

    return file_path


# =========================================================
# CSV Report
# =========================================================

def save_csv(results):
    """
    Save detailed security test results as CSV.
    """

    report_directory = create_report_directory()

    file_path = os.path.join(
        report_directory,
        "security_test_results.csv"
    )

    preferred_fields = [
        "test_name",
        "category",
        "payload",
        "attempt",
        "success",
        "status_code",
        "response_time",
        "test_status",
        "detection_result",
        "defense_action",
        "blocking_status",
        "url",
        "error",
        "timestamp",
    ]

    existing_fields = set()

    for result in results:

        existing_fields.update(
            result.keys()
        )

    fieldnames = [
        field
        for field in preferred_fields
        if field in existing_fields
    ]

    # Add unexpected fields at the end.
    for field in sorted(existing_fields):

        if field not in fieldnames:

            fieldnames.append(field)

    with open(
        file_path,
        "w",
        newline="",
        encoding="utf-8"
    ) as file:

        writer = csv.DictWriter(
            file,
            fieldnames=fieldnames,
            extrasaction="ignore"
        )

        writer.writeheader()

        for result in results:

            writer.writerow({
                field: result.get(
                    field,
                    ""
                )
                for field in fieldnames
            })

    return file_path


# =========================================================
# Print Security Summary
# =========================================================

def print_security_summary(
    summary,
    category_metrics
):
    """
    Print security metrics in a presentation-friendly format.
    """

    print("\n" + "=" * 60)
    print("WOTMED-NET SECURITY TEST REPORT")
    print("=" * 60)

    print(
        f"\nTotal Security Tests : "
        f"{summary['total_tests']}"
    )

    print(
        f"Tests Passed         : "
        f"{summary['tests_passed']}"
    )

    print(
        f"Tests Failed         : "
        f"{summary['tests_failed']}"
    )

    print(
        f"Request Failures     : "
        f"{summary['request_failures']}"
    )

    print(
        f"Detected Tests       : "
        f"{summary['detected_tests']}"
    )

    print(
        f"Detection Rate       : "
        f"{summary['detection_rate']:.2f}%"
    )

    print(
        f"Request Success Rate : "
        f"{summary['request_success_rate']:.2f}%"
    )

    print(
        f"Average Response     : "
        f"{summary['average_response_time']}s"
    )

    print("\n" + "-" * 60)
    print("CATEGORY RESULTS")
    print("-" * 60)

    for category, metrics in category_metrics.items():

        category_result = (
            "PASS"
            if metrics["failed"] == 0
            and metrics["request_failures"] == 0
            else "FAIL"
        )

        print(f"\n{category}")

        print(
            f"  Tests          : "
            f"{metrics['total_tests']}"
        )

        print(
            f"  Detected       : "
            f"{metrics['detected']}"
        )

        print(
            f"  Passed         : "
            f"{metrics['passed']}"
        )

        print(
            f"  Failed         : "
            f"{metrics['failed']}"
        )

        print(
            f"  Detection Rate : "
            f"{metrics['detection_rate']:.2f}%"
        )

        print(
            f"  Result         : "
            f"{category_result}"
        )


# =========================================================
# Main Report Generator
# =========================================================

def generate_report(results):
    """
    Generate JSON and CSV security test reports.
    """

    results = add_timestamp(results)

    summary = create_summary(
        results
    )

    category_metrics = create_category_metrics(
        results
    )

    json_file = save_json(
        results,
        summary,
        category_metrics
    )

    csv_file = save_csv(
        results
    )

    print("\nReports Generated:")
    print("-" * 40)

    print(
        f"JSON: {json_file}"
    )

    print(
        f"CSV : {csv_file}"
    )

    print_security_summary(
        summary,
        category_metrics
    )

    return {
        "json": json_file,
        "csv": csv_file,
        "summary": summary,
        "category_metrics": category_metrics,
    }