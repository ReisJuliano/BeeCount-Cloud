"""merchant_category_mapping — WhatsApp bot 记住的 estabelecimento→categoria

Revision ID: 0018_merchant_category_mapping
Revises: 0017_transaction_exclude_flags
Create Date: 2026-07-20
"""

import sqlalchemy as sa
from alembic import op


revision = "0018_merchant_category_mapping"
down_revision = "0017_transaction_exclude_flags"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "merchant_category_mapping",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column(
            "user_id", sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False, index=True,
        ),
        sa.Column("merchant_key", sa.Text(), nullable=False),
        sa.Column("category_name", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("user_id", "merchant_key", name="uq_merchant_category_user_key"),
    )


def downgrade() -> None:
    op.drop_table("merchant_category_mapping")
