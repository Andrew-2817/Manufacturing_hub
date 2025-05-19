"""rollback last migration

Revision ID: 3d165f029b39
Revises: dbf26f12855c
Create Date: 2025-05-14 15:49:49.229193

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3d165f029b39'
down_revision: Union[str, None] = 'dbf26f12855c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # 1) Добавляем столбец id (nullable)
    op.add_column('resource', sa.Column('id', sa.Integer(), nullable=True))

    # 2) Создаём sequence и default
    op.execute("CREATE SEQUENCE resource_id_seq OWNED BY resource.id")
    op.execute("ALTER TABLE resource ALTER COLUMN id SET DEFAULT nextval('resource_id_seq')")

    # 3) Заполняем id для существующих строк
    op.execute("UPDATE resource SET id = nextval('resource_id_seq')")

    # 4) Делаем id NOT NULL
    op.alter_column('resource', 'id', nullable=False)

    # 5) Снимаем старый PK безопасно через IF EXISTS
    op.execute("ALTER TABLE resource DROP CONSTRAINT IF EXISTS resource_pkey")

    # 6) Создаём новый PK по id
    op.create_primary_key('pk_resource', 'resource', ['id'])


def downgrade():
    op.drop_constraint('pk_resource', 'resource', type_='primary')
    op.drop_column('resource', 'id')
    op.execute("DROP SEQUENCE IF EXISTS resource_id_seq")
    op.create_primary_key('resource_pkey', 'resource', ['type_resource', 'ready_time'])