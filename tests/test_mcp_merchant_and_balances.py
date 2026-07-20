"""get_account_balances + merchant_category_mapping round-trip.

Same harness pattern as test_mcp_tools.py (in-memory sqlite via
dependency_overrides + monkeypatch SessionLocal on the tool modules).
"""
from __future__ import annotations

from datetime import datetime, timezone

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from src.database import Base, get_db
from src.main import app
from src.mcp.tools import merchant_tools, read_tools
from src.models import User
from sqlalchemy import select


def _make_client_and_engine(monkeypatch):
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    testing_session = sessionmaker(bind=engine, autocommit=False, autoflush=False)

    def override_get_db():
        db = testing_session()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    monkeypatch.setattr(read_tools, "SessionLocal", testing_session)
    monkeypatch.setattr(merchant_tools, "SessionLocal", testing_session)
    return TestClient(app), testing_session


def _register(client: TestClient, email: str) -> dict:
    res = client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "password": "123456",
            "client_type": "web",
            "device_name": "pytest-web",
            "platform": "web",
        },
    )
    assert res.status_code == 200, res.text
    return res.json()


def _make_ledger(client: TestClient, token: str, name: str = "Main") -> str:
    res = client.post(
        "/api/v1/write/ledgers",
        json={"ledger_name": name, "currency": "BRL"},
        headers={"Authorization": f"Bearer {token}", "X-Device-ID": "d-web"},
    )
    assert res.status_code == 200, res.text
    return res.json()["entity_id"]


def _make_account(client: TestClient, token: str, ledger_id: str, name: str, initial_balance: float) -> None:
    res = client.post(
        f"/api/v1/write/ledgers/{ledger_id}/accounts",
        json={"base_change_id": 0, "name": name, "initial_balance": initial_balance},
        headers={"Authorization": f"Bearer {token}", "X-Device-ID": "d-web"},
    )
    assert res.status_code == 200, res.text


def _make_tx(client: TestClient, token: str, ledger_id: str, **fields) -> None:
    body = {
        "base_change_id": 0,
        "happened_at": datetime.now(timezone.utc).isoformat(),
        **fields,
    }
    res = client.post(
        f"/api/v1/write/ledgers/{ledger_id}/transactions",
        json=body,
        headers={"Authorization": f"Bearer {token}", "X-Device-ID": "d-web"},
    )
    assert res.status_code == 200, res.text


def _fetch_user(session_maker, email: str) -> User:
    with session_maker() as db:
        user = db.scalar(select(User).where(User.email == email))
        assert user is not None
        db.expunge(user)
        return user


def test_get_account_balances_mixes_income_expense_transfer(monkeypatch) -> None:
    client, session_maker = _make_client_and_engine(monkeypatch)
    try:
        u = _register(client, email="balances@example.com")
        token = u["access_token"]
        ledger_id = _make_ledger(client, token, "Wallet")
        _make_account(client, token, ledger_id, "Nubank", 100.0)
        _make_account(client, token, ledger_id, "Caixa", 0.0)

        _make_tx(client, token, ledger_id, tx_type="expense", amount=30, account_name="Nubank")
        _make_tx(client, token, ledger_id, tx_type="income", amount=50, account_name="Nubank")
        _make_tx(
            client, token, ledger_id, tx_type="transfer", amount=20,
            from_account_name="Nubank", to_account_name="Caixa",
        )

        user = _fetch_user(session_maker, "balances@example.com")
        balances = {b["account_name"]: b["balance"] for b in read_tools.get_account_balances(user)}

        assert balances["Nubank"] == 100.0  # 100 - 30 + 50 - 20
        assert balances["Caixa"] == 20.0  # 0 + 20
    finally:
        app.dependency_overrides.clear()


def test_merchant_category_lookup_and_set_roundtrip(monkeypatch) -> None:
    client, session_maker = _make_client_and_engine(monkeypatch)
    try:
        _register(client, email="merchant@example.com")
        user = _fetch_user(session_maker, "merchant@example.com")

        # nunca visto -> None
        before = merchant_tools.lookup_merchant_category(user, merchant_name="Supermercado Bom Preco")
        assert before["category_name"] is None

        merchant_tools.set_merchant_category(
            user, merchant_name="Supermercado Bom Preco", category_name="Mercado",
        )

        # mesmo nome, capitalização/espaço diferente -> normaliza pra mesma chave
        after = merchant_tools.lookup_merchant_category(user, merchant_name="  supermercado bom preco  ")
        assert after["category_name"] == "Mercado"

        # atualizar categoria existente
        merchant_tools.set_merchant_category(
            user, merchant_name="Supermercado Bom Preco", category_name="Compras",
        )
        updated = merchant_tools.lookup_merchant_category(user, merchant_name="Supermercado Bom Preco")
        assert updated["category_name"] == "Compras"
    finally:
        app.dependency_overrides.clear()
