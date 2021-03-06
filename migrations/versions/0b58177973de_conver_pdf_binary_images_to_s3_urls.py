"""Conver PDF binary images to S3 urls

Revision ID: 0b58177973de
Revises: e3f13cc70efb
Create Date: 2018-04-18 10:27:07.943973

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import base64
import json
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import boto3
import uuid
import os

# revision identifiers, used by Alembic.
revision = '0b58177973de'
down_revision = 'e3f13cc70efb'
branch_labels = None
depends_on = None

Session = sessionmaker()

Base = declarative_base()

class PDFImages(Base):
    __tablename__ = 'pdf_images'

    id = sa.Column(sa.Integer, primary_key=True)
    property_pictures = sa.Column(sa.String)
    additional_exhibits = sa.Column(sa.String)
    signature = sa.Column(sa.String)
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
    bind = op.get_bind()
    session = Session(bind=bind)
    s3 = boto3.client('s3', 
    aws_access_key_id='AKIAJVEMVB2ZUIKSMGBA', 
    aws_secret_access_key='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'
    )
    for pdf_image in session.query(PDFImages).yield_per(1):
        # upload signature, then property picture then additional exhibits
        if pdf_image.signature_binary is not None:
            filename = str(uuid.uuid1()) + '-' + pdf_image.signature_file_name
            file_extension = pdf_image.signature_file_type.split('/')[1].split(';')[0]
            file_name_split = pdf_image.signature_file_name.split('.')
            if len(file_name_split) > 0 and file_name_split[len(file_name_split) - 1] in ['jpg', 'png', 'jpeg']:
                tmp_file_name = 'tmp-' + pdf_image.signature_file_name
            else:
                tmp_file_name = 'tmp-' + pdf_image.signature_file_name + '.' + file_extension
            with open(tmp_file_name, 'wb') as pic_blob:
                pic_blob.write(pdf_image.signature_binary)
            with open(tmp_file_name, 'rb') as pic_blob:
                s3.upload_fileobj(ExtraArgs={'ACL': 'public-read'}, Fileobj=pic_blob, Bucket='evaluation-photos', Key=filename)
            signature = {'fileName': filename, 'file': {'name': filename}, 'fileURL': 'https://s3.amazonaws.com/evaluation-photos/'+filename}
            pdf_image.signature = json.dumps(signature)
            try:
                os.remove(tmp_file_name)
            except OSError:
                pass
        for index in range(1, 4):
            prop_name = 'property_picture_' + str(index)
            property_pictures = []
            if hasattr(pdf_image, prop_name) and getattr(pdf_image, prop_name) is not None:
                filename = str(uuid.uuid1()) + '-' + getattr(pdf_image, prop_name + '_file_name')
                file_extension = getattr(pdf_image, prop_name + '_file_type').split('/')[1].split(';')[0]
                file_name_split = getattr(pdf_image, prop_name + '_file_name').split('.')
                if len(file_name_split) > 0 and file_name_split[len(file_name_split) - 1] in ['jpg', 'png', 'jpeg']:
                    tmp_file_name = 'tmp-' + getattr(pdf_image, prop_name + '_file_name')
                else:
                    tmp_file_name = 'tmp-' + getattr(pdf_image, prop_name + '_file_name') + '.' + file_extension
                with open(tmp_file_name, 'wb') as pic_blob:
                    pic_blob.write(getattr(pdf_image, prop_name))
                with open(tmp_file_name, 'rb') as pic_blob:
                    s3.upload_fileobj(ExtraArgs={'ACL': 'public-read'}, Fileobj=pic_blob, Bucket='evaluation-photos', Key=filename)
                prop = {'fileName': filename, 'file': {'name': filename}, 'fileURL': 'https://s3.amazonaws.com/evaluation-photos/'+filename}
                property_pictures.append(prop)
                try:
                    os.remove(tmp_file_name)
                except OSError:
                    pass
            additional_name = 'additional_exhibit_' + str(index)
            additional_exhibits = []
            if hasattr(pdf_image, additional_name) and getattr(pdf_image, additional_name) is not None:
                filename = str(uuid.uuid1()) + '-' + getattr(pdf_image, additional_name + '_file_name')
                file_extension = getattr(pdf_image, additional_name + '_file_type').split('/')[1].split(';')[0]

                file_name_split = getattr(pdf_image, additional_name + '_file_name').split('.')
                if len(file_name_split) > 0 and file_name_split[len(file_name_split) - 1] in ['jpg', 'png', 'jpeg']:
                    tmp_file_name = 'tmp-' + getattr(pdf_image, additional_name + '_file_name')
                else:
                    tmp_file_name = 'tmp-' + getattr(pdf_image, additional_name + '_file_name') + '.' + file_extension
                with open(tmp_file_name, 'wb') as pic_blob:
                    pic_blob.write(getattr(pdf_image, additional_name))
                with open(tmp_file_name, 'rb') as pic_blob:
                    s3.upload_fileobj(ExtraArgs={'ACL': 'public-read'}, Fileobj=pic_blob, Bucket='evaluation-photos', Key=filename)
                additional = {'pageName': getattr(pdf_image, additional_name + '_page_name'), 'file': {'name': filename}, 'fileName': filename, 'fileURL': 'https://s3.amazonaws.com/evaluation-photos/'+filename}
                additional_exhibits.append(additional)
                try:
                    os.remove(tmp_file_name)
                except OSError:
                    pass
        pdf_image.property_pictures = json.dumps(property_pictures) if len(property_pictures) > 0 else None
        pdf_image.additional_exhibits = json.dumps(additional_exhibits) if len(additional_exhibits) > 0 else None
        session.commit()
                
    op.drop_column('pdf_images', 'additional_exhibit_2_page_name')
    op.drop_column('pdf_images', 'property_picture_2_file_type')
    op.drop_column('pdf_images', 'signature_file_type')
    op.drop_column('pdf_images', 'additional_exhibit_3_file_name')
    op.drop_column('pdf_images', 'signature_file_name')
    op.drop_column('pdf_images', 'property_picture_2_file_name')
    op.drop_column('pdf_images', 'additional_exhibit_1_file_name')
    op.drop_column('pdf_images', 'property_picture_2')
    op.drop_column('pdf_images', 'additional_exhibit_2_file_type')
    op.drop_column('pdf_images', 'property_picture_3')
    op.drop_column('pdf_images', 'additional_exhibit_1_file_type')
    op.drop_column('pdf_images', 'additional_exhibit_2')
    op.drop_column('pdf_images', 'property_picture_3_file_type')
    op.drop_column('pdf_images', 'additional_exhibit_2_file_name')
    op.drop_column('pdf_images', 'property_picture_1')
    op.drop_column('pdf_images', 'property_picture_1_file_name')
    op.drop_column('pdf_images', 'property_picture_1_file_type')
    op.drop_column('pdf_images', 'additional_exhibit_3')
    op.drop_column('pdf_images', 'additional_exhibit_3_file_type')
    op.drop_column('pdf_images', 'additional_exhibit_1')
    op.drop_column('pdf_images', 'additional_exhibit_1_page_name')
    op.drop_column('pdf_images', 'property_picture_3_file_name')
    op.drop_column('pdf_images', 'additional_exhibit_3_page_name')
    op.drop_column('pdf_images', 'signature_binary')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('pdf_images', sa.Column('signature_binary', postgresql.BYTEA(), autoincrement=False, nullable=True))
    op.add_column('pdf_images', sa.Column('additional_exhibit_3_page_name', sa.VARCHAR(), autoincrement=False, nullable=True))
    op.add_column('pdf_images', sa.Column('property_picture_3_file_name', sa.VARCHAR(), autoincrement=False, nullable=True))
    op.add_column('pdf_images', sa.Column('additional_exhibit_1_page_name', sa.VARCHAR(), autoincrement=False, nullable=True))
    op.add_column('pdf_images', sa.Column('additional_exhibit_1', postgresql.BYTEA(), autoincrement=False, nullable=True))
    op.add_column('pdf_images', sa.Column('additional_exhibit_3_file_type', sa.VARCHAR(), autoincrement=False, nullable=True))
    op.add_column('pdf_images', sa.Column('additional_exhibit_3', postgresql.BYTEA(), autoincrement=False, nullable=True))
    op.add_column('pdf_images', sa.Column('property_picture_1_file_type', sa.VARCHAR(), autoincrement=False, nullable=True))
    op.add_column('pdf_images', sa.Column('property_picture_1_file_name', sa.VARCHAR(), autoincrement=False, nullable=True))
    op.add_column('pdf_images', sa.Column('property_picture_1', postgresql.BYTEA(), autoincrement=False, nullable=True))
    op.add_column('pdf_images', sa.Column('additional_exhibit_2_file_name', sa.VARCHAR(), autoincrement=False, nullable=True))
    op.add_column('pdf_images', sa.Column('property_picture_3_file_type', sa.VARCHAR(), autoincrement=False, nullable=True))
    op.add_column('pdf_images', sa.Column('additional_exhibit_2', postgresql.BYTEA(), autoincrement=False, nullable=True))
    op.add_column('pdf_images', sa.Column('additional_exhibit_1_file_type', sa.VARCHAR(), autoincrement=False, nullable=True))
    op.add_column('pdf_images', sa.Column('property_picture_3', postgresql.BYTEA(), autoincrement=False, nullable=True))
    op.add_column('pdf_images', sa.Column('additional_exhibit_2_file_type', sa.VARCHAR(), autoincrement=False, nullable=True))
    op.add_column('pdf_images', sa.Column('property_picture_2', postgresql.BYTEA(), autoincrement=False, nullable=True))
    op.add_column('pdf_images', sa.Column('additional_exhibit_1_file_name', sa.VARCHAR(), autoincrement=False, nullable=True))
    op.add_column('pdf_images', sa.Column('property_picture_2_file_name', sa.VARCHAR(), autoincrement=False, nullable=True))
    op.add_column('pdf_images', sa.Column('signature_file_name', sa.VARCHAR(), autoincrement=False, nullable=True))
    op.add_column('pdf_images', sa.Column('additional_exhibit_3_file_name', sa.VARCHAR(), autoincrement=False, nullable=True))
    op.add_column('pdf_images', sa.Column('signature_file_type', sa.VARCHAR(), autoincrement=False, nullable=True))
    op.add_column('pdf_images', sa.Column('property_picture_2_file_type', sa.VARCHAR(), autoincrement=False, nullable=True))
    op.add_column('pdf_images', sa.Column('additional_exhibit_2_page_name', sa.VARCHAR(), autoincrement=False, nullable=True))
    # op.create_index('evaluation_org_id_idx', 'evaluation', ['org_id'], unique=False)
    # op.create_index('area_org_id_idx', 'area', ['org_id'], unique=False)
    # ### end Alembic commands ###
