"""Change Land Data.acres to float

Revision ID: 426372c49414
Revises: 88e176b2288a
Create Date: 2018-01-15 17:27:07.704823

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '426372c49414'
down_revision = '88e176b2288a'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('land_data', 'acres')
    op.add_column('land_data', sa.Column('acres', sa.Float(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('land_data', 'acres')
    op.add_column('land_data', sa.Column('acres', sa.Integer(), nullable=True))
    # ### end Alembic commands ###
