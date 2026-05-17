#!/usr/bin/env python3
"""
Development commands runner.
Usage:
  python commands.py --test          Run tests with coverage
  python commands.py --fullcheck     Run lint, typecheck, test, and format
  python commands.py --dev           Run FastAPI dev server
  python commands.py --lint          Run linting
  python commands.py --format        Run formatting
  python commands.py --typecheck     Run type checking
"""

import argparse
import subprocess
import sys


def run_command(cmd: list[str], description: str) -> bool:
    """Run a shell command and return True if successful."""
    print(f"\n{'=' * 60}")
    print(f"Running: {description}")
    print(f"Command: {' '.join(cmd)}")
    print(f"{'=' * 60}\n")

    try:
        result = subprocess.run(cmd, check=False)

        # pytest exit code 5 means "no tests collected" - not a real failure
        if result.returncode == 5 and cmd[2] == "pytest":
            print("\n[WARN] No tests collected (exit code 5) - skipping.")
            return True

        if result.returncode != 0:
            print(f"\n[FAIL] {description} failed with exit code {result.returncode}")
            return False

        return True
    except FileNotFoundError:
        print("\n[FAIL] Command not found. Make sure you have 'uv' installed.")
        return False


def run_test() -> bool:
    """Run tests with coverage."""
    return run_command(
        ["uv", "run", "pytest", "--cov=src", "--cov-report=term-missing"], "Tests"
    )


def run_lint() -> bool:
    """Run linting."""
    return run_command(["uv", "run", "ruff", "check", "src"], "Linting")


def run_format() -> bool:
    """Run code formatting."""
    return run_command(["uv", "run", "ruff", "format", "src"], "Formatting")


def run_typecheck() -> bool:
    """Run type checking."""
    return run_command(["uv", "run", "basedpyright", "src"], "Type checking")


def run_dev() -> bool:
    """Run FastAPI dev server."""
    return run_command(
        ["uv", "run", "fastapi", "dev", "src/main.py"], "FastAPI dev server"
    )


def run_fullcheck() -> bool:
    """Run full check: lint, typecheck, test, and format."""
    print("\n" + "=" * 60)
    print("Running FULLCHECK (lint -> typecheck -> test -> format)")
    print("=" * 60)

    checks = [
        ("Linting", run_lint),
        ("Type checking", run_typecheck),
        ("Tests", run_test),
        ("Formatting", run_format),
    ]

    results: dict[str, bool] = {}
    for name, func in checks:
        results[name] = func()
        if not results[name]:
            print(f"\n[WARN] Stopping fullcheck: {name} failed")
            break

    # Print summary
    print("\n" + "=" * 60)
    print("FULLCHECK SUMMARY")
    print("=" * 60)
    for name, success in results.items():
        status = "[OK] PASSED" if success else "[FAIL] FAILED"
        print(f"{name}: {status}")

    all_passed = all(results.values())
    if all_passed:
        print("\n[OK] All checks passed!")
    else:
        print("\n[FAIL] Some checks failed.")

    return all_passed


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Development commands runner",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python commands.py --test          Run tests with coverage
  python commands.py --fullcheck     Run full quality checks
  python commands.py --dev           Start FastAPI dev server
        """,
    )

    parser.add_argument("--test", action="store_true", help="Run tests with coverage")
    parser.add_argument(
        "--fullcheck", action="store_true", help="Run lint, typecheck, test, and format"
    )
    parser.add_argument("--dev", action="store_true", help="Run FastAPI dev server")
    parser.add_argument("--lint", action="store_true", help="Run linting")
    parser.add_argument("--format", action="store_true", help="Run code formatting")
    parser.add_argument("--typecheck", action="store_true", help="Run type checking")

    args = parser.parse_args()

    # If no arguments provided, show help
    if not any(
        [args.test, args.fullcheck, args.dev, args.lint, args.format, args.typecheck]
    ):
        parser.print_help()
        sys.exit(0)

    success = True

    if args.fullcheck:
        success = run_fullcheck()
    elif args.test:
        success = run_test()
    elif args.dev:
        success = run_dev()
    elif args.lint:
        success = run_lint()
    elif args.format:
        success = run_format()
    elif args.typecheck:
        success = run_typecheck()

    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
