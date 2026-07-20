"""merchant_key(estabelecimento) → categoria — memória do WhatsApp bot.

Não é sync entity (não passa por sync_applier / read_*_projection), então
lê/escreve `MerchantCategoryMapping` direto, sem self-call HTTP. Ver
`src/models.py::MerchantCategoryMapping`.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from sqlalchemy import select

from ...database import SessionLocal
from ...models import MerchantCategoryMapping, User


def _normalize(merchant_name: str) -> str:
    return merchant_name.strip().lower()


def lookup_merchant_category(user: User, *, merchant_name: str) -> dict[str, Any]:
    """Devolve a categoria já aprendida pra esse estabelecimento, se houver."""
    key = _normalize(merchant_name)
    with SessionLocal() as db:
        row = db.scalar(
            select(MerchantCategoryMapping).where(
                MerchantCategoryMapping.user_id == user.id,
                MerchantCategoryMapping.merchant_key == key,
            )
        )
        return {"merchant_name": merchant_name, "category_name": row.category_name if row else None}


def set_merchant_category(user: User, *, merchant_name: str, category_name: str) -> dict[str, Any]:
    """Grava/atualiza a categoria aprendida pra esse estabelecimento."""
    key = _normalize(merchant_name)
    if not key:
        raise ValueError("merchant_name must not be empty")
    if not category_name.strip():
        raise ValueError("category_name must not be empty")

    with SessionLocal() as db:
        row = db.scalar(
            select(MerchantCategoryMapping).where(
                MerchantCategoryMapping.user_id == user.id,
                MerchantCategoryMapping.merchant_key == key,
            )
        )
        if row is None:
            row = MerchantCategoryMapping(
                id=str(uuid4()),
                user_id=user.id,
                merchant_key=key,
                category_name=category_name.strip(),
                created_at=datetime.now(timezone.utc),
            )
            db.add(row)
        else:
            row.category_name = category_name.strip()
        db.commit()
        return {"merchant_name": merchant_name, "category_name": category_name.strip(), "status": "saved"}
