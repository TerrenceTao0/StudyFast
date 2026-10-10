"""add Topic lesson

Revision ID: a3f1c9d27b40
Revises: 1710ee34b555
Create Date: 2026-10-10 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a3f1c9d27b40'
down_revision: Union[str, Sequence[str], None] = '1710ee34b555'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('topics', sa.Column('lesson', sa.Text(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('topics', 'lesson')
