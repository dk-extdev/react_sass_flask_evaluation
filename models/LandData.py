from models.shared import db
from datetime import datetime


class LandData(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    parcel_number = db.Column(db.String, unique=True)
    county_reference = db.Column(db.String)
    county_id = db.Column(db.Integer, db.ForeignKey('county.id'))
    county = db.relationship('County', uselist=False, lazy='subquery')
    sale_date = db.Column(db.DateTime)
    sale_price = db.Column(db.String)
    sale_price_num = db.Column(db.Float)
    acres = db.Column(db.Float)
    current_use = db.Column(db.String)
    property_type = db.Column(db.String)
    state = db.Column(db.String, nullable=True)

    createdAt = db.Column(db.DateTime, nullable=False)
    updatedAt = db.Column(db.DateTime, nullable=False)

    def __init__(self, **kwargs):
        super(LandData, self).__init__(**kwargs)
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
            'parcelNumber': self.parcel_number,
            'countyReference': self.county_reference,
            'state': self.state,
            'saleDate': self.sale_date,
            'salePrice': self.sale_price,
            'salePriceNum': self.sale_price_num,
            'acres': self.acres,
            'currentUse': self.current_use,
            'propertyType': self.property_type,
            'createdAt': self.createdAt,
            'updatedAt': self.updatedAt,
            'county': self.county.serialize
        }
