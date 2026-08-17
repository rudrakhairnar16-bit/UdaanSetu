"""Unit tests for utility functions."""
import re
import hashlib
from datetime import datetime, timedelta, timezone

import pytest

from app.main import (
    words, similarity, compute_risk, token_hash,
    validate_password_strength, sanitize_input, RECORD_KINDS,
)


class TestWords:
    def test_basic_extraction(self):
        result = words("Hello World from Python")
        assert result == {"hello", "world", "from", "python"}

    def test_short_words_filtered(self):
        result = words("I am a test of an API")
        assert "am" not in result
        assert "of" not in result
        assert "api" in result

    def test_empty_string(self):
        assert words("") == set()

    def test_numbers_filtered(self):
        result = words("test123 value42 real")
        assert "real" in result
        assert "test123" not in result

    def test_special_chars(self):
        result = words("hello-world test_data")
        assert "hello" in result
        assert "world" in result
        assert "test" in result
        assert "data" in result


class TestSimilarity:
    def test_identical_text(self):
        assert similarity("hello world", "hello world") == 100.0

    def test_no_overlap(self):
        assert similarity("cat dog", "fish bird") == 0.0

    def test_partial_overlap(self):
        score = similarity("hello world test", "hello earth test")
        assert 0 < score < 100

    def test_empty_text(self):
        assert similarity("", "hello") == 0.0

    def test_both_empty(self):
        assert similarity("", "") == 0.0

    def test_case_insensitive(self):
        assert similarity("HELLO World", "hello world") == 100.0

    def test_symmetry(self):
        a = "cold storage farms innovative"
        b = "farms innovative cold storage"
        assert similarity(a, b) == similarity(b, a)


class TestComputeRisk:
    class MockRecord:
        def __init__(self, stage, meta):
            self.stage = stage
            self.meta = meta

    class MockMilestone:
        def __init__(self, stage, meta):
            self.stage = stage
            self.meta = meta

    def test_no_risk(self):
        r = self.MockRecord("Prototype", {"progress": 90})
        m = [self.MockMilestone("Done", {"due_date": "2026-12-31"})]
        result = compute_risk(r, m)
        assert result["level"] == "Low"
        assert result["score"] < 30

    def test_high_risk_overdue(self):
        r = self.MockRecord("Prototype", {"progress": 10})
        m = [
            self.MockMilestone("In Progress", {"due_date": "2020-01-01"}),
            self.MockMilestone("In Progress", {"due_date": "2020-06-01"}),
            self.MockMilestone("In Progress", {"due_date": "2021-01-01"}),
        ]
        result = compute_risk(r, m)
        assert result["level"] == "High"
        assert result["score"] >= 60

    def test_stage_penalty(self):
        r = self.MockRecord("Stalled", {"progress": 50})
        result = compute_risk(r, [])
        assert any("Stalled" in reason for reason in result["reasons"])

    def test_low_progress_penalty(self):
        r = self.MockRecord("Prototype", {"progress": 20})
        result = compute_risk(r, [])
        assert any("Low reported progress" in reason for reason in result["reasons"])

    def test_empty_milestones(self):
        r = self.MockRecord("Prototype", {"progress": 100})
        result = compute_risk(r, [])
        assert result["level"] == "Low"
        assert result["reasons"] == ["On track"]

    def test_done_milestone_not_counted(self):
        r = self.MockRecord("Prototype", {"progress": 50})
        m = [self.MockMilestone("Done", {"due_date": "2020-01-01"})]
        result = compute_risk(r, m)
        assert "0 overdue milestone(s)" not in str(result["reasons"])


class TestTokenHash:
    def test_consistency(self):
        t = "test.token.value"
        assert token_hash(t) == hashlib.sha256(t.encode()).hexdigest()

    def test_different_tokens(self):
        assert token_hash("token1") != token_hash("token2")

    def test_empty_token(self):
        result = token_hash("")
        assert result == hashlib.sha256(b"").hexdigest()


class TestPasswordValidation:
    def test_valid_password(self):
        errors = validate_password_strength("StrongPass1")
        assert len(errors) == 0

    def test_too_short(self):
        errors = validate_password_strength("Ab1")
        assert any("8 characters" in e for e in errors)

    def test_no_uppercase(self):
        errors = validate_password_strength("strongpass1")
        assert any("uppercase" in e for e in errors)

    def test_no_lowercase(self):
        errors = validate_password_strength("STRONGPASS1")
        assert any("lowercase" in e for e in errors)

    def test_no_digit(self):
        errors = validate_password_strength("StrongPassword")
        assert any("digit" in e for e in errors)

    def test_minimal_valid(self):
        errors = validate_password_strength("Abcd1234")
        assert len(errors) == 0


class TestSanitizeInput:
    def test_strip_html(self):
        assert sanitize_input("<script>alert('xss')</script>") == "alert('xss')"

    def test_strip_null_bytes(self):
        assert sanitize_input("test\x00value") == "testvalue"

    def test_strip_whitespace(self):
        assert sanitize_input("  hello  ") == "hello"

    def test_normal_text(self):
        assert sanitize_input("Normal text") == "Normal text"

    def test_nested_html(self):
        result = sanitize_input("<div><b>bold</b></div>")
        assert "<" not in result
        assert "bold" in result


class TestRecordKinds:
    def test_all_kinds_present(self):
        expected = {"research", "milestone", "innovation", "ipr", "startup",
                    "funding_request", "mentor", "scheme", "incubator"}
        assert RECORD_KINDS == expected

    def test_no_empty_strings(self):
        for kind in RECORD_KINDS:
            assert len(kind) > 0
            assert kind.strip() == kind
