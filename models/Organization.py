from models.shared import db
from datetime import datetime
import json
import base64

org_counties = db.Table('org_counties',
                        db.Column('county_id', db.Integer, db.ForeignKey('county.id'), primary_key=True),
                        db.Column('org_id', db.Integer, db.ForeignKey('organization.id'), primary_key=True))


class Organization(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(), nullable=False)
    createdAt = db.Column(db.DateTime, nullable=False)
    updatedAt = db.Column(db.DateTime, nullable=False)
    address_id = db.Column(db.Integer, db.ForeignKey('address.id'))
    address = db.relationship('Address', uselist=False, lazy='joined') # Maybe change this back to joined
    counties = db.relationship('County', secondary=org_counties, lazy='dynamic')
    farmable_factor = db.Column(db.Float)
    nonfarmable_factor = db.Column(db.Float)
    irrigation_factor = db.Column(db.Float)
    disabled = db.Column(db.Boolean)
    primary_color = db.Column(db.String) # dict of rgba values.
    logo = db.Column(db.String)  # dict with a base 64 data URI (key: fileURI), and fileName
    # logo_file_name = db.Column(db.String)
    # logo_binary = db.Column(db.LargeBinary)
    # logo_file_type = db.Column(db.String)

    def __init__(self, **kwargs):
        super(Organization, self).__init__(**kwargs)
        self.disabled = False
        self.createdAt = datetime.now()
        self.updatedAt = datetime.now()

    def save(self):
        self.updatedAt = datetime.now()
        db.session.add(self)
        db.session.commit()

    @property
    def serialize(self):
        # logo_json = {'file':{'name': self.logo_file_name}, 
        # 'fileURI': self.logo_file_type+ ',' + str(base64.b64encode(self.logo_binary), 'utf-8')} if self.logo_binary is not None \
        # else (json.loads(self.logo) if self.logo is not None else None) 
        return {
            'id': self.id,
            'name': self.name,
            'address': self.address.serialize,
            'farmableFactor': self.farmable_factor,
            'nonfarmableFactor': self.nonfarmable_factor,
            'irrigationFactor': self.irrigation_factor,
            'disabled': self.disabled,
            'primaryColor': json.loads(self.primary_color) if self.primary_color is not None else None,
            'logo': json.loads(self.logo) if self.logo is not None else None
        }


area_counties = db.Table('area_counties',
                         db.Column('county_id', db.Integer, db.ForeignKey('county.id'), primary_key=True),
                         db.Column('area_id', db.Integer, db.ForeignKey('area.id'), primary_key=True))


class Area(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    counties = db.relationship('County', secondary=area_counties, lazy='subquery')
    state = db.Column(db.String)
    name = db.Column(db.String)
    updatedAt = db.Column(db.DateTime, nullable=False)
    createdAt = db.Column(db.DateTime, nullable=False)

    org_id = db.Column(db.Integer, db.ForeignKey('organization.id'))
    organization = db.relationship('Organization', uselist=False, lazy='select',
                                   backref=db.backref('areas', lazy='dynamic'))

    def __init__(self, **kwargs):
        super(Area, self).__init__(**kwargs)
        self.createdAt = datetime.now()
        self.updatedAt = datetime.now()

    def save(self):
        db.session.add(self)
        db.session.commit()

    @property
    def serialize(self):
        return {
            'id': self.id,
            'counties': [x.serialize for x in self.counties],
            'state': self.state,
            'name': self.name
        }
