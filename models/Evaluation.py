from models.shared import db
from datetime import datetime
import json
import base64
import requests

class Evaluation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    market_area_type = db.Column(db.String)  # Area, County, or EntireMarketArea
    market_area_id = db.Column(db.Integer, db.ForeignKey('area.id'), nullable=True)
    market_area = db.relationship('Area', uselist=False, lazy='subquery')
    market_area_county_id = db.Column(db.Integer, db.ForeignKey('county.id'), nullable=True)
    market_area_county = db.relationship('County', uselist=False, lazy='subquery')
    current_listing = db.Column(db.Boolean)
    current_listing_price = db.Column(db.Integer)
    property_sold_last_three_years = db.Column(db.Boolean)
    sale_price_string = db.Column(db.String)
    sale_price = db.Column(db.Integer)
    date_sold = db.Column(db.DateTime)
    current_use = db.Column(db.String)
    highest_and_best_use = db.Column(db.String)
    marketing_exposure_time = db.Column(db.String)
    land_assessment_tax_assessor = db.Column(db.Integer)
    building_assessment_tax_assessor = db.Column(db.Integer)
    owner = db.Column(db.String)
    property_address_id = db.Column(db.Integer, db.ForeignKey('address.id'))
    property_address = db.relationship('Address', uselist=False, lazy='subquery')
    map_parcel_number = db.Column(db.String)
    legal_physical_access = db.Column(db.Boolean)
    zoning = db.Column(db.String)
    utilities = db.Column(db.String)
    sewer = db.Column(db.String)
    gas = db.Column(db.String)
    power = db.Column(db.String)
    property_rights = db.Column(db.String)
    property_type = db.Column(db.String)
    tillable = db.Column(db.Float)
    non_tillable = db.Column(db.Float)
    irrigation_percentage = db.Column(db.Float)
    acres = db.Column(db.Float)
    evaluator = db.Column(db.String)
    date_of_inspection = db.Column(db.DateTime)
    property_rating_id = db.Column(db.Integer, db.ForeignKey('property_rating.id'))
    property_rating = db.relationship('PropertyRating', uselist=False, lazy='subquery')
    statistical_parameters_id = db.Column(db.Integer, db.ForeignKey('statistical_parameters.id'))
    statistical_parameters = db.relationship('StatisticalParameters', uselist=False, lazy='subquery')
    max = db.Column(db.Float)
    mod_max = db.Column(db.Float)
    mod_min_max = db.Column(db.Float)
    min = db.Column(db.Float)
    mod_min = db.Column(db.Float)
    stnd_deviation = db.Column(db.Float)
    median = db.Column(db.Float)
    sqrt_data_count = db.Column(db.Float)
    stnd_error = db.Column(db.Float)
    total_data_points_property = db.Column(db.Integer)
    num_properties_before_cal = db.Column(db.Integer)
    average = db.Column(db.Float)
    multiplier = db.Column(db.Float)
    value_unit_concluded = db.Column(db.Float)
    reconciled_per_unit = db.Column(db.Float)
    pdf = db.Column(db.String)
    market_trend_graph_id = db.Column(db.Integer, db.ForeignKey('market_trend_graph.id'))
    market_trend_graph = db.relationship('MarketTrendGraph', uselist=False, lazy='subquery')
    org_id = db.Column(db.Integer, db.ForeignKey('organization.id'))
    organization = db.relationship('Organization', uselist=False, lazy='subquery', backref=db.backref('evaluations', lazy='dynamic'))
    pdf_images_id = db.Column(db.Integer, db.ForeignKey('pdf_images.id'))
    pdf_images = db.relationship('PDFImages', uselist=False, lazy='subquery')
    improvements_id = db.Column(db.Integer, db.ForeignKey('improvements.id'))
    improvements = db.relationship('Improvements', uselist=False, lazy='subquery')
    custom_certification = db.Column(db.String)
    did_you_physically_inspect_property = db.Column(db.Boolean)
    tax_overhead_notes = db.Column(db.String)
    additional_exhibits_notes = db.Column(db.String)
    soils_notes = db.Column(db.String)
    flood_map_notes= db.Column(db.String)

    createdAt = db.Column(db.DateTime, nullable=False)
    updatedAt = db.Column(db.DateTime, nullable=False)

    def __init__(self, **kwargs):
        super(Evaluation, self).__init__(**kwargs)
        self.createdAt = datetime.now()
        self.updatedAt = datetime.now()

    def save(self):
        self.updatedAt = datetime.now()
        db.session.add(self)
        db.session.commit()
    
    @property
    def small_serialize(self):
        return {
            'id': self.id,
            'improvements': self.improvements.serialize if self.improvements is not None else None,
            'valueUnitConcluded': self.value_unit_concluded,
            'mapParcelNumber': self.map_parcel_number,
            'name': self.name,
            'propertyAddress': self.property_address.serialize if self.property_address is not None else None,
            'reconciledPerUnit': self.reconciled_per_unit,
            'updatedAt': self.updatedAt,
            'pdf': self.pdf
        }

    @property
    def serialize(self):
        return {
            'id': self.id,
            'name': self.name,
            'marketAreaType': self.market_area_type,
            'marketArea': self.market_area.serialize if self.market_area_type == 'Area' else
            self.market_area_county.serialize if self.market_area_type == 'County' else '',
            'currentListing': self.current_listing,
            'currentListingPrice': self.current_listing_price,
            'propertySoldLastThreeYears': self.property_sold_last_three_years,
            'salePriceString': self.sale_price_string,
            'salePrice': self.sale_price,
            'dateSold': self.date_sold,
            'currentUse': self.current_use,
            'highestAndBestUse': self.highest_and_best_use,
            'marketingExposureTime': self.marketing_exposure_time,
            'landAssessmentTaxAssessor': self.land_assessment_tax_assessor,
            'buildingAssessmentTaxAssessor': self.building_assessment_tax_assessor,
            'owner': self.owner,
            'propertyAddress': self.property_address.serialize,
            'mapParcelNumber': self.map_parcel_number,
            'legalPhysicalAccess': self.legal_physical_access,
            'zoning': self.zoning,
            'utilities': self.utilities,
            'sewer': self.sewer,
            'gas': self.gas,
            'power': self.power,
            'propertyRights': self.property_rights,
            'propertyType': self.property_type,
            'tillable': self.tillable,
            'nonTillable': self.non_tillable,
            'irrigationPercentage': self.irrigation_percentage,
            'acres': self.acres,
            'evaluator': self.evaluator,
            'dateOfInspection': self.date_of_inspection,
            'propertyRating': self.property_rating.serialize,
            'statisticalParameters': self.statistical_parameters.serialize,
            'max': self.max,
            'modMax': self.mod_max,
            'modMinMax': self.mod_min_max,
            'min': self.min,
            'modMin': self.mod_min,
            'stndDeviation': self.stnd_deviation,
            'median': self.median,
            'sqrtDataCount': self.sqrt_data_count,
            'stndError': self.stnd_error,
            'totalDataPointsProperty': self.total_data_points_property,
            'numPropertiesBeforeCal': self.num_properties_before_cal,
            'average': self.average,
            'multiplier': self.multiplier,
            'valueUnitConcluded': self.value_unit_concluded,
            'reconciledPerUnit': self.reconciled_per_unit,
            'pdf': self.pdf,
            'marketTrendGraph': self.market_trend_graph.serialize,
            'orgId': self.org_id,
            'pdfImages': self.pdf_images.serialize if self.pdf_images is not None else None,
            'improvements': self.improvements.serialize if self.improvements is not None else None,
            'customCertification': self.custom_certification,
            'didYouPhysicallyInspectProperty': self.did_you_physically_inspect_property,
            'taxOverheadNotes': self.tax_overhead_notes,
            'additionalExhibitsNotes': self.additional_exhibits_notes,
            'soilsNotes': self.soils_notes,
            'floodMapNotes': self.flood_map_notes,
            'createdAt': self.createdAt,
            'updatedAt': self.updatedAt
        }


class PropertyRating(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    road_frontage = db.Column(db.Integer)
    access_frontage_easement = db.Column(db.Integer)
    access_ingress_egress_quality = db.Column(db.Integer)
    contiguous_parcels = db.Column(db.Integer)
    topography = db.Column(db.Integer)
    soils = db.Column(db.Integer)
    drainage = db.Column(db.Integer)
    # irrigation = db.Column(db.Integer)
    # rivers_creeks_ponds = db.Column(db.Integer)
    # marketable_timber = db.Column(db.Integer)
    additional_field_1 = db.Column(db.String)
    additional_field_2 = db.Column(db.String)
    additional_field_3 = db.Column(db.String)
    tillable = db.Column(db.Float)
    non_tillable = db.Column(db.Float)
    irrigation_percentage = db.Column(db.Float)
    blended_result = db.Column(db.Float)
    total_subject_score = db.Column(db.Integer)
    percentage_above_below = db.Column(db.Float)
    reconciled_overall_rating = db.Column(db.String)

    createdAt = db.Column(db.DateTime, nullable=False)
    updatedAt = db.Column(db.DateTime, nullable=False)

    def __init__(self, **kwargs):
        super(PropertyRating, self).__init__(**kwargs)
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
            'roadFrontage': self.road_frontage,
            'accessFrontageEasement': self.access_frontage_easement,
            'accessIngressEgressQuality': self.access_ingress_egress_quality,
            'contiguousParcels': self.contiguous_parcels,
            'topography': self.topography,
            'soils': self.soils,
            'drainage': self.drainage,
            'additionalField1': json.loads(self.additional_field_1) if self.additional_field_1 is not None else None,
            'additionalField2': json.loads(self.additional_field_2) if self.additional_field_2 is not None else None,
            'additionalField3': json.loads(self.additional_field_3) if self.additional_field_3 is not None else None,
            'tillable': self.tillable,
            'nonTillable': self.non_tillable,
            'irrigationPercentage': self.irrigation_percentage,
            'blendedResult': self.blended_result,
            'totalSubjectScore': self.total_subject_score,
            'percentageAboveBelow': self.percentage_above_below,
            'reconciledOverallRating': self.reconciled_overall_rating
        }


class StatisticalParameters(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    acreage_min = db.Column(db.Float)
    acreage_max = db.Column(db.Float)
    date_of_sale_min = db.Column(db.DateTime)
    date_of_sale_max = db.Column(db.DateTime)
    outlier_percentage_exclusion = db.Column(db.Float)

    createdAt = db.Column(db.DateTime, nullable=False)
    updatedAt = db.Column(db.DateTime, nullable=False)

    def __init__(self, **kwargs):
        super(StatisticalParameters, self).__init__(**kwargs)
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
            'acreageMin': self.acreage_min,
            'acreageMax': self.acreage_max,
            'dateOfSaleMin': self.date_of_sale_min,
            'dateOfSaleMax': self.date_of_sale_max,
            'outlierPercentageExclusion': self.outlier_percentage_exclusion
        }


class MarketTrendGraph(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    scatter_data = db.Column(db.String)
    trend_data = db.Column(db.String)
    m = db.Column(db.Float)
    b = db.Column(db.Float)
    R2 = db.Column(db.Float)

    updatedAt = db.Column(db.DateTime)
    createdAt = db.Column(db.DateTime)

    def __init__(self, **kwargs):
        super(MarketTrendGraph, self).__init__(**kwargs)
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
            'scatterData': self.scatter_data,
            'trendData': self.trend_data,
            'm': self.m,
            'b': self.b,
            'R2': self.R2
        }


class PDFImages(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    property_pictures = db.Column(db.String)
    additional_exhibits = db.Column(db.String)
    signature = db.Column(db.String)
    # property_picture_1 = db.Column(db.LargeBinary)
    # property_picture_1_file_name = db.Column(db.String)
    # property_picture_1_file_type = db.Column(db.String)
    # property_picture_2 = db.Column(db.LargeBinary)
    # property_picture_2_file_name = db.Column(db.String)
    # property_picture_2_file_type = db.Column(db.String)
    # property_picture_3 = db.Column(db.LargeBinary)
    # property_picture_3_file_name = db.Column(db.String)
    # property_picture_3_file_type = db.Column(db.String)
    # signature_binary = db.Column(db.LargeBinary)
    # signature_file_type = db.Column(db.String)
    # signature_file_name = db.Column(db.String)
    # additional_exhibit_1_page_name = db.Column(db.String)
    # additional_exhibit_1 = db.Column(db.LargeBinary)
    # additional_exhibit_1_file_name = db.Column(db.String)
    # additional_exhibit_1_file_type = db.Column(db.String)
    # additional_exhibit_2_page_name = db.Column(db.String)
    # additional_exhibit_2 = db.Column(db.LargeBinary)
    # additional_exhibit_2_file_name = db.Column(db.String)
    # additional_exhibit_2_file_type = db.Column(db.String)
    # additional_exhibit_3_page_name = db.Column(db.String)
    # additional_exhibit_3 = db.Column(db.LargeBinary)
    # additional_exhibit_3_file_name = db.Column(db.String)
    # additional_exhibit_3_file_type = db.Column(db.String)

    updatedAt = db.Column(db.DateTime, nullable=False)
    createdAt = db.Column(db.DateTime, nullable=False)

    def __init__(self, **kwargs):
        super(PDFImages, self).__init__(**kwargs)
        self.createdAt = datetime.now()
        self.updatedAt = datetime.now()

    def save(self):
        self.updatedAt = datetime.now()
        db.session.add(self)
        db.session.commit()

    @property
    def serialize(self):
        # property_pictures_json = []
        # additional_exhibits_json = []
        # for x in range(1, 4):
        #     prop_name = 'property_picture_' + str(x)
        #     if hasattr(self, prop_name) and getattr(self, prop_name) is not None:  #  Check if it is None as well.
        #         property_pictures_json.append({
        #             'fileURI': getattr(self, prop_name + '_file_type') + ',' + str(base64.b64encode(getattr(self, prop_name)), 'utf-8'), 
        #             'file': {'name': getattr(self, prop_name + '_file_name')}, 
        #             'fileName': getattr(self, prop_name + '_file_name')})
        #     additional_name = 'additional_exhibit_' + str(x)
        #     if hasattr(self, additional_name) and getattr(self, additional_name) is not None:
        #         additional_exhibits_json.append({
        #             'pageName': getattr(self, additional_name+'_page_name'),
        #             'fileURI': getattr(self, additional_name + '_file_type') + ',' + str(base64.b64encode(getattr(self, additional_name)), 'utf-8'),
        #             'file': {'name': getattr(self, additional_name + '_file_name')},
        #             'fileName':  getattr(self, additional_name + '_file_name')
        #         })
        # signature_json = {
        #     'fileURI': self.signature_file_type + ',' + str(base64.b64encode(self.signature_binary), 'utf-8'),
        #     'file': {'nane': self.signature_file_name},
        #     'fileName': self.signature_file_name
        #     } if self.signature_binary is not None else None
        
        return {
            'id': self.id,
            'propertyPictures': json.loads(self.property_pictures) if self.property_pictures is not None else None,
            'additionalExhibits': json.loads(self.additional_exhibits) if self.additional_exhibits is not None else None,
            'signature': json.loads(self.signature) if self.signature is not None else None
        }


class Improvements(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    total_improvements_value = db.Column(db.Float)
    improvements = db.Column(db.String)

    updatedAt = db.Column(db.DateTime, nullable=False)
    createdAt = db.Column(db.DateTime, nullable=False)

    def __init__(self, **kwargs):
        super(Improvements, self).__init__(**kwargs)
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
            'totalImprovementsValue': self.total_improvements_value,
            'improvements': json.loads(self.improvements) if self.improvements is not None else None
        }


class EvaluationSaveLog(db.Model):
    ###  This is meant to capture saves/updates to an Evaluation that meet the business logic for a charge.
    ###  Business Logic:
    ###     1. The Evaluation gets a PDF for the first time. (So basically the first time that they clicked
    ##          Save & Download Eval)
    ###     2. The evaluation already has or has had a PDF attached to it and Evaluation name changes and
    ###         then they proceed to Save & Download an Evaluation. (I will need to make sure that it is
    ###         communicated to the client via the web app that Changing the name and downloading a PDF will count towards a charge)
    ###     3.  The evaluation already has or has had a PDF attached to it and the address changes and
    ###         they proceed to Save & Download an Evaluation.

    id = db.Column(db.Integer, primary_key=True)
    eval_id = db.Column(db.Integer, db.ForeignKey('evaluation.id'), nullable=True)
    evaluation = db.relationship('Evaluation', uselist=False, lazy='subquery', backref=db.backref('evaluation_save_logs', lazy='dynamic'))
    eval_id_perm = db.Column(db.Integer, nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user = db.relationship('User', uselist=False, lazy='subquery', backref=db.backref('evaluation_save_logs', lazy='dynamic'))
    timestamp = db.Column(db.DateTime, nullable=False)
    save_criteria = db.Column(db.String, nullable=True)  # don't know If I will use this, but just in case.
    exempted = db.Column(db.Boolean, nullable=False)
    org_id = db.Column(db.Integer, db.ForeignKey('organization.id'), nullable=False)
    organization = db.relationship('Organization', uselist=False, lazy='subquery', backref=db.backref('evaluation_save_logs', lazy='dynamic'))
    has_pdf = db.Column(db.Boolean, nullable=False) # Couldn't think of a better name. If an Eval meets the valid critera, but doesn't have a pdf
    # set this field to False. This will help me if someone saves an Eval that meets the criteria, but doesn't have a PDF
    # then at a later date/time downloads a PDF with a change that doesn't meet critera. Technically since their last PDF download,
    # It will have changed, but I wouldn't say the change on the actual download.

    updatedAt = db.Column(db.DateTime, nullable=False)
    createdAt = db.Column(db.DateTime, nullable=False)

    def __init__(self, **kwargs):
        super(EvaluationSaveLog, self).__init__(**kwargs)
        self.exempted = False
        self.timestamp = datetime.now()
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
            'user': self.user.serialize,
            'timestamp': self.timestamp,
            'saveCriteria': self.save_criteria,
            'exempted': self.exempted,
            'has_pdf': self.has_pdf,
            'evaluation': {
                'id': self.evaluation.id if self.evaluation is not None else None
            },
            'evalId': self.eval_id_perm
        }
