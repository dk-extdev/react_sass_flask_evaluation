"""Organization.logo is now binary

Revision ID: de63d87fc621
Revises: 2a7740e5a2e0
Create Date: 2018-04-12 12:08:23.313715

"""
from alembic import op
import sqlalchemy as sa
import base64
import json
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# revision identifiers, used by Alembic.
revision = 'de63d87fc621'
down_revision = '2a7740e5a2e0'
branch_labels = None
depends_on = None

Session = sessionmaker()

Base = declarative_base()

class Organization(Base):
    __tablename__ = 'organization'

    id = sa.Column(sa.Integer, primary_key=True)
    name = sa.Column(sa.String())
    logo = sa.Column(sa.String())
    logo_file_name = sa.Column(sa.String())
    logo_binary = sa.Column(sa.LargeBinary())
    logo_file_type = sa.Column(sa.String())

def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    # op.drop_index('area_org_id_idx', table_name='area')
    # op.drop_index('evaluation_org_id_idx', table_name='evaluation')
    op.add_column('organization', sa.Column('logo_binary', sa.LargeBinary(), nullable=True))
    op.add_column('organization', sa.Column('logo_file_name', sa.String(), nullable=True))
    op.add_column('organization', sa.Column('logo_file_type', sa.String(), nullable=True))
    # ### end Alembic commands ###
    bind = op.get_bind()
    session = Session(bind=bind)
    for org in session.query(Organization):
        if org.logo is not None and org.logo_binary is None:
            logo_dict = json.loads(org.logo)
            org.logo_file_name = logo_dict['file']['name'] if 'name' in logo_dict['file'] else org.name + ' logo'
            file_type, b64_string = logo_dict['fileURI'].split(',')
            org.logo_file_type = file_type
            org.logo_binary = base64.b64decode(b64_string)
    session.commit()



def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('organization', 'logo_file_name')
    op.drop_column('organization', 'logo_binary')
    op.drop_column('organization', 'logo_file_type')
    # op.create_index('evaluation_org_id_idx', 'evaluation', ['org_id'], unique=False)
    # op.create_index('area_org_id_idx', 'area', ['org_id'], unique=False)
    # ### end Alembic commands ###
