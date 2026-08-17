"""Shared test fixtures for UdaanSetu backend tests."""
import os, sys
os.environ["DATABASE_URL"] = "sqlite:///test.db"
os.environ["SECRET_KEY"] = "test-secret-key-for-testing-only"
os.environ["OLLAMA_ENABLED"] = "false"

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.main import (
    app, Base, User, Record, AuditLog, Notification, TokenBlacklist,
    pwd, create_token, token_hash, settings,
)

TEST_DB_URL = "sqlite:///test.db"
test_engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestSessionLocal = sessionmaker(bind=test_engine, autoflush=False)


@pytest.fixture(scope="session", autouse=True)
def setup_db():
    Base.metadata.create_all(test_engine)
    yield
    Base.metadata.drop_all(test_engine)
    try:
        os.remove("test.db")
    except Exception:
        pass


@pytest.fixture(autouse=True)
def clean_db(setup_db):
    """Delete all data between tests but keep schema."""
    conn = test_engine.connect()
    trans = conn.begin()
    for table in reversed(Base.metadata.sorted_tables):
        conn.execute(table.delete())
    trans.commit()
    conn.close()
    yield


@pytest.fixture
def db_session():
    s = TestSessionLocal()
    try:
        yield s
    finally:
        s.rollback()
        s.close()


@pytest.fixture
def client(db_session):
    def _override():
        try:
            yield db_session
        finally:
            pass

    from app.main import db as db_dep
    app.dependency_overrides[db_dep] = _override
    with TestClient(app, raise_server_exceptions=False) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def seed_users(db_session):
    users = {
        "admin": User(name="Test Admin", email="admin@test.demo",
            password_hash=pwd.hash("TestPass1"), role="admin",
            district="TestCity", organization="TestOrg"),
        "researcher": User(name="Test Researcher", email="researcher@test.demo",
            password_hash=pwd.hash("TestPass1"), role="researcher",
            district="TestCity", organization="TestUni"),
        "mentor": User(name="Test Mentor", email="mentor@test.demo",
            password_hash=pwd.hash("TestPass1"), role="mentor",
            district="TestCity", organization="TestOrg"),
        "investor": User(name="Test Investor", email="investor@test.demo",
            password_hash=pwd.hash("TestPass1"), role="investor",
            district="TestCity", organization="TestFund"),
        "incubator": User(name="Test Incubator", email="incubator@test.demo",
            password_hash=pwd.hash("TestPass1"), role="incubator",
            district="TestCity", organization="TestHub"),
    }
    for u in users.values():
        db_session.add(u)
    db_session.flush()
    return users


@pytest.fixture
def tokens(seed_users):
    return {role: create_token(user) for role, user in seed_users.items()}


@pytest.fixture
def seed_records(db_session, seed_users):
    r = Record(kind="research", title="Test Research", description="Test desc",
        stage="Prototype", district="TestCity", sector="AgriTech",
        owner_id=seed_users["researcher"].id,
        meta={"progress": 60, "funding_required": 500000}, is_demo=True)
    db_session.add(r); db_session.flush()

    m = Record(kind="milestone", title="Test Milestone", description="Test",
        stage="In Progress", parent_id=r.id,
        meta={"due_date": "2026-12-31", "progress": 50}, is_demo=True)
    db_session.add(m); db_session.flush()

    i = Record(kind="innovation", title="Test Innovation", description="Innovation desc",
        stage="Concept", district="TestCity", sector="AgriTech",
        owner_id=seed_users["researcher"].id, parent_id=r.id,
        meta={"readiness_level": "TRL 3"}, is_demo=True)
    db_session.add(i); db_session.flush()

    ipr = Record(kind="ipr", title="Test Patent", description="Patent desc",
        stage="Filed", parent_id=i.id, sector="AgriTech", district="TestCity",
        meta={"filing_date": "2026-01-15", "application_no": "IN/2026/12345"}, is_demo=True)
    db_session.add(ipr)

    st = Record(kind="startup", title="Test Startup", description="Startup desc",
        stage="Seed", parent_id=i.id, sector="AgriTech", district="TestCity",
        meta={"jobs_created": 5, "farmers_reached": 100, "revenue": 200000}, is_demo=True)
    db_session.add(st)

    mentor = Record(kind="mentor", title="Test Mentor Record", description="Mentor desc",
        stage="Available", sector="AgriTech", district="TestCity",
        meta={"expertise": ["IPR", "AgriTech"]}, is_demo=True)
    db_session.add(mentor)

    scheme = Record(kind="scheme", title="Test Grant", description="Grant desc",
        stage="Open", sector="AgriTech", district="TestCity",
        meta={"amount": 500000, "eligibility": "prototype"}, is_demo=True)
    db_session.add(scheme)

    inc = Record(kind="incubator", title="Test Incubator Record", description="Inc desc",
        stage="Open", sector="AgriTech", district="TestCity",
        meta={"capacity": 10, "services": ["lab"]}, is_demo=True)
    db_session.add(inc)

    fr = Record(kind="funding_request", title="Test Funding Request", description="FR desc",
        stage="Submitted", sector="AgriTech", district="TestCity",
        parent_id=st.id, meta={"amount": 500000}, is_demo=True)
    db_session.add(fr)

    db_session.flush()

    n = Notification(user_id=seed_users["researcher"].id, message="Test notification", kind="info")
    db_session.add(n)
    db_session.commit()

    return {
        "research": r, "milestone": m, "innovation": i, "ipr": ipr,
        "startup": st, "mentor": mentor, "scheme": scheme,
        "incubator": inc, "funding_request": fr, "notification": n,
    }
