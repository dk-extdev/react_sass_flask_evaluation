"""Add Has PDF to Log

Revision ID: 23e678269d67
Revises: 6481c5a98065
Create Date: 2018-04-02 09:57:40.869342

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '23e678269d67'
down_revision = '6481c5a98065'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('evaluation_save_log', sa.Column('has_pdf', sa.Boolean(), nullable=False))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('evaluation_save_log', 'has_pdf')
    # ### end Alembic commands ###
