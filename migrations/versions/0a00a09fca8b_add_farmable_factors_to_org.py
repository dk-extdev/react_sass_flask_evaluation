"""Add Farmable factors to org

Revision ID: 0a00a09fca8b
Revises: bacad9bf9f62
Create Date: 2018-02-23 10:27:02.514772

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0a00a09fca8b'
down_revision = 'bacad9bf9f62'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('organization', sa.Column('farmable_factor', sa.Float(), nullable=True))
    op.add_column('organization', sa.Column('nonfarmable_factor', sa.Float(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('organization', 'nonfarmable_factor')
    op.drop_column('organization', 'farmable_factor')
    # ### end Alembic commands ###