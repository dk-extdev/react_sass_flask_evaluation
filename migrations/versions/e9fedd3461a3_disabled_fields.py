"""Disabled fields

Revision ID: e9fedd3461a3
Revises: c783c4b4bbaa
Create Date: 2018-03-13 12:10:00.352825

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'e9fedd3461a3'
down_revision = 'c783c4b4bbaa'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('organization', sa.Column('disabled', sa.Boolean(), nullable=True))
    op.add_column('user', sa.Column('disabled', sa.Boolean(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('user', 'disabled')
    op.drop_column('organization', 'disabled')
    # ### end Alembic commands ###
