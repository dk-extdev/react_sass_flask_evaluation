"""Add PDF Images

Revision ID: 25cf5b7285cc
Revises: a8cbb9f5679e
Create Date: 2018-03-06 20:41:47.627642

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '25cf5b7285cc'
down_revision = 'a8cbb9f5679e'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('pdf_images',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('property_pictures', sa.String(), nullable=True),
    sa.Column('additional_exhibits', sa.String(), nullable=True),
    sa.Column('signature', sa.String(), nullable=True),
    sa.Column('updatedAt', sa.DateTime(), nullable=False),
    sa.Column('createdAt', sa.DateTime(), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.add_column('evaluation', sa.Column('pdf_images_id', sa.Integer(), nullable=True))
    op.create_foreign_key(None, 'evaluation', 'pdf_images', ['pdf_images_id'], ['id'])
    op.add_column('market_trend_graph', sa.Column('createdAt', sa.DateTime(), nullable=True))
    op.add_column('market_trend_graph', sa.Column('updatedAt', sa.DateTime(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('market_trend_graph', 'updatedAt')
    op.drop_column('market_trend_graph', 'createdAt')
    op.drop_constraint(None, 'evaluation', type_='foreignkey')
    op.drop_column('evaluation', 'pdf_images_id')
    op.drop_table('pdf_images')
    # ### end Alembic commands ###
