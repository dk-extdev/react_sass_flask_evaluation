"""Add a Forgot Password table to hold tokens for the request new password flow

Revision ID: bacad9bf9f62
Revises: db52bde3ca2b
Create Date: 2018-02-22 10:56:11.363382

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'bacad9bf9f62'
down_revision = 'db52bde3ca2b'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('forgot_password',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('token', sa.String(), nullable=False),
    sa.Column('expired', sa.Boolean(), nullable=False),
    sa.Column('expirationDate', sa.DateTime(), nullable=False),
    sa.Column('createdAt', sa.DateTime(), nullable=False),
    sa.Column('updatedAt', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('forgot_password')
    # ### end Alembic commands ###
