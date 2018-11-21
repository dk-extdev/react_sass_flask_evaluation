from models.shared import db
from datetime import datetime


class Address(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    address1 = db.Column(db.String(), nullable=False)
    address2 = db.Column(db.String(), nullable=True)
    city = db.Column(db.String(), nullable=False)
    state = db.Column(db.String(), nullable=False)
    country = db.Column(db.String(), nullable=False)
    postal_code = db.Column(db.String(), nullable=False)
    createdAt = db.Column(db.DateTime, nullable=False)
    updatedAt = db.Column(db.DateTime, nullable=False)

    def __init__(self, **kwargs):
        super(Address, self).__init__(**kwargs)
        self.createdAt = datetime.now()
        self.updatedAt = datetime.now()

    def save(self):
        self.updatedAt = datetime.now()
        db.session.add(self)
        db.session.commit()

    @property
    def serialize(self):
        return {
            'id': self.id,
            'address1': self.address1,
            'address2': self.address2,
            'city': self.city,
            'state': self.state,
            'country': self.country,
            'postalCode': self.postal_code
        }


class County(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    county = db.Column(db.String, nullable=False)
    state = db.Column(db.String, nullable=False)

    createdAt = db.Column(db.DateTime, nullable=False)
    updatedAt = db.Column(db.DateTime, nullable=False)

    def __init__(self, **kwargs):
        super(County, self).__init__(**kwargs)
        self.createdAt = datetime.now()
        self.updatedAt = datetime.now()

    def save(self):
        self.updatedAt = datetime.now()
        self.createdAt = datetime.now()

    @property
    def serialize(self):
        return {
            'id': self.id,
            'county': self.county,
            'state': self.state
        }
