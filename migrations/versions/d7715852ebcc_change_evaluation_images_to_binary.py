"""Change Evaluation Images to Binary

Revision ID: d7715852ebcc
Revises: de63d87fc621
Create Date: 2018-04-16 11:34:56.737473

"""
from alembic import op
import sqlalchemy as sa
import base64
import json
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker


# revision identifiers, used by Alembic.
revision = 'd7715852ebcc'
down_revision = 'de63d87fc621'
branch_labels = None
depends_on = None

Session = sessionmaker()

Base = declarative_base()

class PDFImages(Base):
    __tablename__ = 'pdf_images'

    id = sa.Column(sa.Integer, primary_key=True)
    additional_exhibits = sa.Column(sa.String)
    signature = sa.Column(sa.String)
    property_pictures = sa.Column(sa.String)
    property_picture_1 = sa.Column(sa.LargeBinary)
    property_picture_1_file_name = sa.Column(sa.String)
    property_picture_1_file_type = sa.Column(sa.String)
    property_picture_2 = sa.Column(sa.LargeBinary)
    property_picture_2_file_name = sa.Column(sa.String)
    property_picture_2_file_type = sa.Column(sa.String)
    property_picture_3 = sa.Column(sa.LargeBinary)
    property_picture_3_file_name = sa.Column(sa.String)
    property_picture_3_file_type = sa.Column(sa.String)
    signature_binary = sa.Column(sa.LargeBinary)
    signature_file_type = sa.Column(sa.String)
    signature_file_name = sa.Column(sa.String)
    additional_exhibit_1_page_name = sa.Column(sa.String)
    additional_exhibit_1 = sa.Column(sa.LargeBinary)
    additional_exhibit_1_file_name = sa.Column(sa.String)
    additional_exhibit_1_file_type = sa.Column(sa.String)
    additional_exhibit_2_page_name = sa.Column(sa.String)
    additional_exhibit_2 = sa.Column(sa.LargeBinary)
    additional_exhibit_2_file_name = sa.Column(sa.String)
    additional_exhibit_2_file_type = sa.Column(sa.String)
    additional_exhibit_3_page_name = sa.Column(sa.String)
    additional_exhibit_3 = sa.Column(sa.LargeBinary)
    additional_exhibit_3_file_name = sa.Column(sa.String)
    additional_exhibit_3_file_type = sa.Column(sa.String)


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    # op.drop_index('area_org_id_idx', table_name='area')
    # op.drop_index('evaluation_org_id_idx', table_name='evaluation')
    op.add_column('pdf_images', sa.Column('additional_exhibit_1', sa.LargeBinary(), nullable=True))
    op.add_column('pdf_images', sa.Column('additional_exhibit_1_file_name', sa.String(), nullable=True))
    op.add_column('pdf_images', sa.Column('additional_exhibit_1_file_type', sa.String(), nullable=True))
    op.add_column('pdf_images', sa.Column('additional_exhibit_1_page_name', sa.String(), nullable=True))
    op.add_column('pdf_images', sa.Column('additional_exhibit_2', sa.LargeBinary(), nullable=True))
    op.add_column('pdf_images', sa.Column('additional_exhibit_2_file_name', sa.String(), nullable=True))
    op.add_column('pdf_images', sa.Column('additional_exhibit_2_file_type', sa.String(), nullable=True))
    op.add_column('pdf_images', sa.Column('additional_exhibit_2_page_name', sa.String(), nullable=True))
    op.add_column('pdf_images', sa.Column('additional_exhibit_3', sa.LargeBinary(), nullable=True))
    op.add_column('pdf_images', sa.Column('additional_exhibit_3_file_name', sa.String(), nullable=True))
    op.add_column('pdf_images', sa.Column('additional_exhibit_3_file_type', sa.String(), nullable=True))
    op.add_column('pdf_images', sa.Column('additional_exhibit_3_page_name', sa.String(), nullable=True))
    op.add_column('pdf_images', sa.Column('property_picture_1', sa.LargeBinary(), nullable=True))
    op.add_column('pdf_images', sa.Column('property_picture_1_file_name', sa.String(), nullable=True))
    op.add_column('pdf_images', sa.Column('property_picture_1_file_type', sa.String(), nullable=True))
    op.add_column('pdf_images', sa.Column('property_picture_2', sa.LargeBinary(), nullable=True))
    op.add_column('pdf_images', sa.Column('property_picture_2_file_name', sa.String(), nullable=True))
    op.add_column('pdf_images', sa.Column('property_picture_2_file_type', sa.String(), nullable=True))
    op.add_column('pdf_images', sa.Column('property_picture_3', sa.LargeBinary(), nullable=True))
    op.add_column('pdf_images', sa.Column('property_picture_3_file_name', sa.String(), nullable=True))
    op.add_column('pdf_images', sa.Column('property_picture_3_file_type', sa.String(), nullable=True))
    op.add_column('pdf_images', sa.Column('signature_binary', sa.LargeBinary(), nullable=True))
    op.add_column('pdf_images', sa.Column('signature_file_name', sa.String(), nullable=True))
    op.add_column('pdf_images', sa.Column('signature_file_type', sa.String(), nullable=True))
    # ### end Alembic commands ###
    bind = op.get_bind()
    session = Session(bind=bind)
    for pdf_image in session.query(PDFImages).yield_per(1):
        if pdf_image.property_pictures is not None:
            prop_pics = json.loads(pdf_image.property_pictures)
            for index, pic in enumerate(prop_pics):
                if isinstance(pic, dict) and 'fileURI' in pic and pic['fileURI'] is not None:
                    file_name = pic['file']['name'] if 'file' in pic and 'name' in pic['file'] else 'property picture ' + str(index + 1)
                    file_type, b64_image = pic['fileURI'].split(',')
                    prop_name = 'property_picture_' + str(index + 1)
                    setattr(pdf_image, prop_name, base64.b64decode(b64_image))
                    setattr(pdf_image, prop_name + '_file_name', file_name)
                    setattr(pdf_image, prop_name + '_file_type', file_type)
            
        if pdf_image.additional_exhibits is not None:
            additional_pics = json.loads(pdf_image.additional_exhibits)
            for index, pic in enumerate(additional_pics):
                if isinstance(pic, dict) and 'fileURI' in pic and pic['fileURI'] is not None:  
                    file_name = pic['file']['name'] if 'file' in pic and 'name' in pic['file'] else 'additional exhibit ' + str(index + 1)
                    page_name = pic['pageName']
                    file_type, b64_image = pic['fileURI'].split(',')
                    additional_name = 'additional_exhibit_' + str(index + 1)
                    setattr(pdf_image, additional_name, base64.b64decode(b64_image))
                    setattr(pdf_image, additional_name + '_file_type', file_type)
                    setattr(pdf_image, additional_name + '_file_name', file_name)
                    setattr(pdf_image, additional_name + '_page_name', page_name)
        
        if pdf_image.signature is not None:
            signature_json = json.loads(pdf_image.signature)
            if isinstance(signature_json, dict) and 'fileURI' in signature_json and signature_json['fileURI'] is not None:
                file_name = signature_json['file']['name'] if 'file' in signature_json and 'name' in signature_json['file'] else 'signature picture'
                file_type, b64_image = signature_json['fileURI'].split(',')
                setattr(pdf_image, 'signature_binary', base64.b64decode(b64_image))
                setattr(pdf_image, 'signature_file_type', file_type)
                setattr(pdf_image, 'signature_file_name', file_name)
        
        session.commit()

def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('pdf_images', 'signature_file_type')
    op.drop_column('pdf_images', 'signature_file_name')
    op.drop_column('pdf_images', 'signature_binary')
    op.drop_column('pdf_images', 'property_picture_3_file_type')
    op.drop_column('pdf_images', 'property_picture_3_file_name')
    op.drop_column('pdf_images', 'property_picture_3')
    op.drop_column('pdf_images', 'property_picture_2_file_type')
    op.drop_column('pdf_images', 'property_picture_2_file_name')
    op.drop_column('pdf_images', 'property_picture_2')
    op.drop_column('pdf_images', 'property_picture_1_file_type')
    op.drop_column('pdf_images', 'property_picture_1_file_name')
    op.drop_column('pdf_images', 'property_picture_1')
    op.drop_column('pdf_images', 'additional_exhibit_3_page_name')
    op.drop_column('pdf_images', 'additional_exhibit_3_file_type')
    op.drop_column('pdf_images', 'additional_exhibit_3_file_name')
    op.drop_column('pdf_images', 'additional_exhibit_3')
    op.drop_column('pdf_images', 'additional_exhibit_2_page_name')
    op.drop_column('pdf_images', 'additional_exhibit_2_file_type')
    op.drop_column('pdf_images', 'additional_exhibit_2_file_name')
    op.drop_column('pdf_images', 'additional_exhibit_2')
    op.drop_column('pdf_images', 'additional_exhibit_1_page_name')
    op.drop_column('pdf_images', 'additional_exhibit_1_file_type')
    op.drop_column('pdf_images', 'additional_exhibit_1_file_name')
    op.drop_column('pdf_images', 'additional_exhibit_1')
    # op.create_index('evaluation_org_id_idx', 'evaluation', ['org_id'], unique=False)
    # op.create_index('area_org_id_idx', 'area', ['org_id'], unique=False)
    # ### end Alembic commands ###
