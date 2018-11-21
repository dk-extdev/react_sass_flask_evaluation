"""Add Irrigation Percentage

Revision ID: 73d234298e8e
Revises: 71b08f08bfaa
Create Date: 2018-03-09 10:48:22.473082

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '73d234298e8e'
down_revision = '71b08f08bfaa'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('evaluation', sa.Column('irrigation_percentage', sa.Float(), nullable=True))
    op.add_column('property_rating', sa.Column('irrigation_percentage', sa.Float(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('property_rating', 'irrigation_percentage')
    op.drop_column('evaluation', 'irrigation_percentage')
    # ### end Alembic commands ###