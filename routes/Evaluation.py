from flask import Blueprint, request, jsonify, session, Response, stream_with_context
from helpers import requires_login, requires_role, underscore_to_camel, camel_to_underscore, get_user_by_session_token
from models.Evaluation import Evaluation, StatisticalParameters, PropertyRating, MarketTrendGraph, PDFImages, Improvements, EvaluationSaveLog
from models.Organization import Organization, Area
from models.Address import County, Address
from models.User import User, SessionToken
from models.shared import db
import boto3
import uuid
import json
import re
from time import time
from cache import cache
import base64
import os
import requests


eval_blueprint = Blueprint('Evaluation', __name__)

# @cache.memoize(7200)
def get_eval_by_id(org_id):
    eval_query = Evaluation.query.filter_by(org_id=int(org_id)).order_by(Evaluation.createdAt.desc())
    evals = eval_query.all()
    return evals

@eval_blueprint.route('/', methods=['GET', 'POST'])
@requires_login()
def evals_endpoint():
    if request.method == 'GET':
        if request.args.get('orgId') is None:
            return jsonify(error=True, message='Missing required parameter - orgId')
        evals = get_eval_by_id(int(request.args.get('orgId')))
        # I need to shrink the size of the payload that is given back to the browser.
        resp = {'error': False, 'evaluations': [x.small_serialize for x in evals]}
        resp_str = json.dumps(resp, default=str)
        return Response(response=resp_str, status=200, mimetype="application/json")
    if request.method == 'POST':
        tic = time()
        data = request.get_json()
        # check for basic required params
        if 'orgId' not in data or 'valuation' not in data or 'propertyRatingParams' not in data or \
                        'parameters' not in data or 'marketTrendGraph' not in data:
            return jsonify(error=True, message='Missing required parameter(s)')
        check_none = lambda obj, field: obj[field] if field in obj and type(obj[field]) is not str else obj[field] if field in obj and obj[field].strip() != '' else None
        parameters = data['parameters']
        evaluation = Evaluation()
        evaluation.org_id = data['orgId']
        if parameters['marketArea'] == 'entireMarketArea':
            evaluation.market_area_type = 'EntireMarketArea'
        elif 'county' in parameters['marketArea']:
            evaluation.market_area_type = 'County'
            evaluation.market_area_county_id = parameters['marketArea'].split('-')[1]
        elif 'area' in parameters['marketArea']:
            evaluation.market_area_type = 'Area'
            evaluation.market_area_id = parameters['marketArea'].split('-')[1]
        evaluation.current_listing = check_none(parameters, 'currentListing')
        evaluation.current_listing_price = check_none(parameters, 'currentListingPrice')
        evaluation.property_sold_last_three_years = parameters['propertySoldLastThreeYears']
        evaluation.sale_price = check_none(parameters ,'salePrice')
        evaluation.date_sold = check_none(parameters, 'dateSold')
        evaluation.current_use = check_none(parameters, 'currentUse')
        evaluation.highest_and_best_use = check_none(parameters, 'highestAndBestUse')
        evaluation.marketing_exposure_time = check_none(parameters, 'marketingExposureTime')
        evaluation.land_assessment_tax_assessor = check_none(parameters, 'landAssessment')
        evaluation.building_assessment_tax_assessor = check_none(parameters, 'buildingAssessment')
        evaluation.owner = check_none(parameters, 'ownerBorrower')
        evaluation.map_parcel_number = parameters['mapParcelNumber']
        evaluation.legal_physical_access = parameters['legalPhysicalAccess']
        evaluation.zoning = check_none(parameters, 'zoning')
        evaluation.utilities = check_none(parameters, 'utilities')
        evaluation.sewer = check_none(parameters, 'sewer')
        evaluation.gas = check_none(parameters, 'gas')
        evaluation.power = check_none(parameters, 'power')
        evaluation.property_rights = check_none(parameters, 'propertyRights')
        evaluation.property_type = check_none(parameters, 'propertyType')
      #  evaluation.property_type = 'Agricultural'
        evaluation.tillable = parameters['tillable'] if type(parameters['tillable']) == float else 0 if parameters['tillable'] == '' else float(parameters['tillable'])
        evaluation.non_tillable = parameters['unTillable'] if type(parameters['unTillable']) == float else 0 if parameters['unTillable'] == '' else float(parameters['unTillable'])
        evaluation.irrigation_percentage = parameters['irrigationPercentage'] if type(parameters['irrigationPercentage']) == float else 0 if parameters['irrigationPercentage'] == '' else float(parameters['irrigationPercentage'])
        evaluation.acres = parameters['acres']
        evaluation.evaluator = check_none(parameters, 'evaluator')
        evaluation.date_of_inspection = check_none(parameters, 'dateOfInspection')
        evaluation.custom_certification = check_none(parameters, 'customCertification')
        evaluation.did_you_physically_inspect_property = parameters['didYouPhysicallyInspectProperty']
        evaluation.tax_overhead_notes = check_none(parameters, 'taxOverheadNotes')
        evaluation.additional_exhibits_notes = check_none(parameters, 'additionalExhibitsNotes')
        evaluation.soils_notes = check_none(parameters, 'soilsNotes')
        evaluation.flood_map_notes = check_none(parameters, 'floodMapNotes')
        evaluation.name = check_none(parameters, 'name')

        valuation = data['valuation']

        evaluation.max = valuation['max']
        evaluation.mod_max = valuation['modMax']
        evaluation.mod_min_max = valuation['modMinMax']
        evaluation.min = valuation['min']
        evaluation.mod_min = valuation['modMin']
        evaluation.stnd_deviation = valuation['stndDeviation']
        evaluation.stnd_error = valuation['stndError']
        evaluation.median = valuation['median']
        evaluation.sqrt_data_count = valuation['sqrtDataCount']
        evaluation.total_data_points_property = len(data['statisticalFilteredLandData'])
        evaluation.num_properties_before_cal = len(data['areaFilteredLandData'])
        evaluation.average = valuation['average']
        evaluation.multiplier = valuation['multiplier']
        evaluation.value_unit_concluded = valuation['valueUnitConcluded']
        evaluation.reconciled_per_unit = valuation['reconciledPerUnit']

        if 'pdf' in data and data['pdf'] is not None:
            evaluation.pdf = data['pdf']


        property_rating_params = data['propertyRatingParams']
        property_rating = PropertyRating(road_frontage=parameters['roadFrontage'],
                                         access_frontage_easement=parameters['accessFrontageEasement'],
                                         access_ingress_egress_quality=parameters['accessIngressEgressQuality'],
                                         contiguous_parcels=parameters['contiguousParcels'],
                                         topography=parameters['topography'],
                                         soils=parameters['soils'], drainage=parameters['drainage'],
                                         tillable=parameters['tillable'] if type(parameters['tillable']) == float else 0 if parameters['tillable'] == '' else float(parameters['tillable']),
                                         non_tillable=parameters['unTillable'] if type(parameters['unTillable']) == float else 0 if parameters['unTillable'] == '' else float(parameters['unTillable']),
                                         irrigation_percentage=parameters['irrigationPercentage'] if type(parameters['irrigationPercentage']) == float else 0 if parameters['irrigationPercentage'] == '' else float(parameters['irrigationPercentage']),
                                         blended_result=property_rating_params['blendedResult'],
                                         total_subject_score=property_rating_params['totalSubjectScore'],
                                         percentage_above_below=property_rating_params['percentageAboveBelow'],
                                         reconciled_overall_rating=property_rating_params['reconciledOverallRating'])
        if 'additionalField1' in parameters and 'value' in parameters['additionalField1'] and parameters['additionalField1']['value'] is not None:
            property_rating.additional_field_1 = json.dumps(parameters['additionalField1'])
        if 'additionalField2' in parameters and 'value' in parameters['additionalField2'] and parameters['additionalField2']['value'] is not None:
            property_rating.additional_field_2 = json.dumps(parameters['additionalField2'])
        if 'additionalField3' in parameters and 'value' in parameters['additionalField3'] and parameters['additionalField3']['value'] is not None:
            property_rating.additional_field_3 = json.dumps(parameters['additionalField3'])

        evaluation.property_rating = property_rating

        statistical_parameters = StatisticalParameters()
        if parameters['acreageMin'] != '':
            statistical_parameters.acreage_min = parameters['acreageMin']
        if parameters['acreageMax'] != '':
            statistical_parameters.acreage_max = parameters['acreageMax']
        if 'dateOfSaleMin' in parameters:
            statistical_parameters.date_of_sale_min = parameters['dateOfSaleMin']
        if 'dateOfSaleMax' in parameters:
            statistical_parameters.date_of_sale_max = parameters['dateOfSaleMax']
        if parameters['outlierPercentageExclusion'] == '0':
            statistical_parameters.outlier_percentage_exclusion = 0
        else:
            statistical_parameters.outlier_percentage_exclusion = parameters['outlierPercentageExclusion']

        evaluation.statistical_parameters = statistical_parameters

        property_address = Address(address1=parameters['propertyAddress'],
                                   city=parameters['propertyCity'], state=parameters['propertyState'],
                                   postal_code=parameters['propertyPostalCode'], country=parameters['propertyCountry'])
        evaluation.property_address = property_address

        market_trend_data = data['marketTrendGraph']
        market_trend_graph = MarketTrendGraph(scatter_data=market_trend_data['scatterData'],
                                              trend_data=market_trend_data['trendData'],
                                              m=float(market_trend_data['m']),
                                              b=float(market_trend_data['b']),
                                              R2=float(market_trend_data['R2']))
        evaluation.market_trend_graph = market_trend_graph

        pdf_images_data = data['pdfImages'] if 'pdfImages' in data else {}

        pdf_images = PDFImages()
        # Handle Upload to AWS on this side instead.
        if 'propertyPictures' in pdf_images_data and len(pdf_images_data['propertyPictures']) > 0:
            property_pictures = []
            for x in pdf_images_data['propertyPictures']:
                if 'fileURI' in x and 'file' in x and 'name' in x['file']:
                    file_url = s3_picture_upload(x['fileURI'], x['file']['name'])
                    x['fileURL'] = file_url
                    x.pop('fileURI', None)
                    x.pop('updated', None)
                    property_pictures.append(x)
            pdf_images.property_pictures = json.dumps(property_pictures) if len(property_pictures) > 0 else None
            # for index, pic in enumerate(pdf_images_data['propertyPictures']):
            #     file_name = pic['file']['name'] if 'file' in pic and 'name' in pic['file'] else 'property picture ' + str(index + 1)
            #     file_type, b64_image = pic['fileURI'].split(',')
            #     setattr(pdf_images, 'property_picture_' + str(index + 1), base64.b64decode(b64_image))
            #     setattr(pdf_images, 'property_picture_'+str(index + 1)+'_file_type', file_type)
            #     setattr(pdf_images, 'property_picture_'+str(index + 1)+'_file_name', file_name)
        if 'signature' in pdf_images_data and pdf_images_data['signature'] is not None and 'fileURI' in pdf_images_data['signature']:
            signature = pdf_images_data['signature']
            file_url = s3_picture_upload(signature['fileURI'], signature['file']['name'])
            signature['fileURL'] = file_url
            signature.pop('fileURI', None)
            signature.pop('updated', None)
            pdf_images.signature = json.dumps(signature)
            # file_name = pdf_images_data['signature']['file']['name'] if 'file' in pdf_images_data['signature'] and \
            # 'name' in pdf_images_data['signature']['file'] else 'signature picture'
            # file_type, b64_image = pdf_images_data['signature']['fileURI'].split(',')
            # pdf_images.signature_binary = base64.b64decode(b64_image)
            # pdf_images.signature_file_name = file_name
            # pdf_images.signature_file_type = file_type
        if 'additionalExhibits' in pdf_images_data and len(pdf_images_data['additionalExhibits']) > 0:
            additional_exhibits = []
            for x in pdf_images_data['additionalExhibits']:
                if 'fileURI' in x and 'file' in x and 'name' in x['file']: 
                    file_url = s3_picture_upload(x['fileURI'], x['file']['name'])
                    x['fileURL'] = file_url
                    x.pop('fileURI', None)
                    x.pop('updated', None)
                    additional_exhibits.append(x)
            pdf_images.additional_exhibits = json.dumps(additional_exhibits) if len(additional_exhibits) > 0 else None
            # for index, pic in enumerate(pdf_images_data['additionalExhibits']):
            #     file_name = pic['file']['name'] if 'file' in pic and 'name' in pic['file'] else 'additional exhibit' + str(index + 1)
            #     file_type, b64_image = pic['fileURI'].split(',')
            #     setattr(pdf_images, 'additional_exhibit_' + str(index + 1), base64.b64decode(b64_image))
            #     setattr(pdf_images, 'additional_exhibit_' + str(index + 1) + '_page_name', pic['pageName'])
            #     setattr(pdf_images, 'additional_exhibit_' + str(index + 1) + '_file_type', file_type)
            #     setattr(pdf_images, 'additional_exhibit_' + str(index + 1) + '_file_name', file_name)

        evaluation.pdf_images = pdf_images

        improvements_data = parameters['improvements']

        improvements = Improvements()
        if improvements_data is not None and 'totalImprovementsValue' in improvements_data and 'improvements' in improvements_data:
            improvements.total_improvements_value = improvements_data['totalImprovementsValue']
            improvements.improvements = json.dumps(improvements_data['improvements'])
        else:
            improvements.total_improvements_value = 0
            improvements.improvements = '[]'
        evaluation.improvements = improvements

        db.session.add(evaluation)
        # cache.delete_memoized(get_eval_by_id, int(data['orgId']))
        if 'pdf' in data and data['pdf'] is not None:
            user = get_user_by_session_token(session['session_token'])
            eval_save_log = EvaluationSaveLog(user_id=user.id, evaluation=evaluation, org_id=data['orgId'],
            save_criteria="PDF generated on initial save.", has_pdf=True, eval_id_perm=evaluation.id)
            db.session.add(eval_save_log)
            # cache.delete_memoized(get_saves_by_org_id, int(data['orgId']))
            # cache.delete_memoized(get_saves_by_eval_id, int(evaluation.id))
        db.session.commit()
        toc = time()
        print('Evaluation Create Time: ', toc-tic)
        return jsonify(error=False, evaluation=evaluation.serialize)


@eval_blueprint.route('/<eval_id>', methods=['GET', 'PUT', 'DELETE'])
@requires_login()
def eval_endpoint(eval_id):
    if request.method == 'GET':
        evaluation = Evaluation.query.get(int(eval_id))
        if evaluation is None:
            return jsonify(error=True, message='Evaluation does not exist')
        return jsonify(error=False, evaluation=evaluation.serialize)
    if request.method == 'PUT':
        evaluation = Evaluation.query.get(int(eval_id))
        # I am just getting fields that need to be updated. I am assuming they are in the format of the Model. Not the state on the container.
        immutable_fields = ['updatedAt', 'createdAt', 'org_id', 'id']
        eval_columns_unfiltered = [str(x).split('.')[1] for x in Evaluation.__table__.columns]
        eval_columns = [x if 'id' not in x or x in ['market_area_id', 'market_area_count_id'] 
        else x.replace('_id', '') for x in eval_columns_unfiltered]
        data = request.get_json()
        should_log_eval_save = False
        save_criteria = ''
        meet_eval_save_criteria = 'name' in data or 'propertyAddress' in data or 'mapParcelNumber' in data
        if 'pdf' in data and data['pdf'] is not None and data['pdf'] != 'null':
            # You need to save a pdf in both remaining cases.
            if evaluation.pdf is None:
                # This means that you are adding a PDF for the first time.
                should_log_eval_save = True
                save_criteria = 'PDF created for the first time.'
            elif meet_eval_save_criteria:
                # On PDF download you are saving things that match criteria.
                should_log_eval_save = True
                save_criteria = 'Saved new PDF with changes that matched criteria.'
            else:
                last_save_logs = get_saves_by_eval_id(int(eval_id))
                if len(last_save_logs) == 0:
                    should_log_eval_save = True
                    save_criteria = 'There is a previous PDF but no Save Logs. This is to handle backwards compatiblity'
                else:
                    last_save_log = last_save_logs[0]
                    if last_save_log.has_pdf:
                        should_log_eval_save = True
                        save_criteria = 'The Last save met the criteria but no PDF was generated then'
        elif 'pdf' not in data or data['pdf'] is None or data['pdf'] == 'null':
            if meet_eval_save_criteria:
                should_log_eval_save = True
                save_criteria = 'Meets criteria but is not downloading a PDF'
        for key, value in data.items():
            underscore_field = camel_to_underscore(key)
            if underscore_field not in immutable_fields and underscore_field in eval_columns and \
                            underscore_field != 'pdf_images':
                if type(value) == dict:
                    print(underscore_field)
                    obj = getattr(evaluation, underscore_field)
                    print(obj)
                    if underscore_field == 'improvements' and obj is None:
                        obj = Improvements()
                        evaluation.improvements = obj
                    obj_columns = [str(x).split('.')[1] for x in obj.__table__.columns]
                    for key2, value2 in value.items():
                        underscore_field2 = camel_to_underscore(key2)
                        if underscore_field2 == 'r2':
                            underscore_field2 = 'R2'
                        if 'additional_field' in underscore_field2:
                            num = re.search(r'\d', underscore_field2)[0]
                            underscore_field2 = underscore_field2.replace(str(num), '_' + str(num))
                        if underscore_field2 in obj_columns and underscore_field2 not in immutable_fields \
                                and underscore_field2 not in ['additional_field_1', 'additional_field_2',
                                                              'additional_field_3', 'improvements']:
                            setattr(obj, underscore_field2, value2 if value2 != 'null' else None)
                        elif underscore_field2 in ['additional_field_1', 'additional_field_2', 'additional_field_3', 'improvements']:
                            setattr(obj, underscore_field2, json.dumps(value2) if value2 != 'null' else None)
                else:
                    setattr(evaluation, underscore_field, value if value != 'null' else None)
            elif underscore_field == 'pdf_images':
                pdf_images = evaluation.pdf_images
                if pdf_images is None:
                    pdf_images = PDFImages()
                    evaluation.pdf_images = pdf_images
                pdf_image_data = data['pdfImages']
                cur_pdf_images_json = pdf_images.serialize # Need to change this to store base64 images as binary.
                property_pictures = []
                for index, pic in enumerate(pdf_image_data['propertyPictures']):
                    if ('propertyPictures' not in cur_pdf_images_json or cur_pdf_images_json['propertyPictures'] is None) and pic != 'null' and 'fileURI' in pic:
                    #if (not hasattr(pdf_images, 'property_picture_' + str(index + 1)) or getattr(pdf_images, 'property_picture_'+str(index + 1)) is None) and pic != 'null':
                        file_url = s3_picture_upload(pic['fileURI'], pic['file']['name'])
                        pic['fileURL'] = file_url
                        pic.pop('fileURI', None)
                        pic.pop('updated', None)
                        property_pictures.append(pic)
                        # file_name = pic['file']['name'] if 'file' in pic and 'name' in pic['file'] else 'property picture ' + str(index + 1)
                        # file_type, b64_image = pic['fileURI'].split(',')
                        # setattr(pdf_images, 'property_picture_' + str(index + 1), base64.b64decode(b64_image))
                        # setattr(pdf_images, 'property_picture_'+str(index + 1)+'_file_type', file_type)
                        # setattr(pdf_images, 'property_picture_'+str(index + 1)+'_file_name', file_name)
                        # pdf_images.property_pictures = None
                    elif pic != 'null' and pic['updated'] and 'fileURI' in pic:
                        file_url = s3_picture_upload(pic['fileURI'], pic['file']['name'])
                        pic['fileURL'] = file_url
                        pic.pop('fileURI', None)
                        pic.pop('updated', None)
                        property_pictures.append(pic)
                        # file_name = pic['file']['name'] if 'file' in pic and 'name' in pic['file'] else 'property picture ' + str(index + 1)
                        # file_type, b64_image = pic['fileURI'].split(',')
                        # setattr(pdf_images, 'property_picture_' + str(index + 1), base64.b64decode(b64_image))
                        # setattr(pdf_images, 'property_picture_'+str(index + 1)+'_file_type', file_type)
                        # setattr(pdf_images, 'property_picture_'+str(index + 1)+'_file_name', file_name)
                        # pdf_images.property_pictures = None
                    elif pic != 'null' and 'propertyPictures' in cur_pdf_images_json and cur_pdf_images_json['propertyPictures'] is not None and not pic['updated'] and index < len(cur_pdf_images_json['propertyPictures']):
                        property_pictures.append(cur_pdf_images_json['propertyPictures'][index])

                pdf_images.property_pictures = json.dumps(property_pictures) if len(property_pictures) > 0 else None

                if 'signature' in pdf_image_data and pdf_image_data['signature'] is not None and pdf_image_data['signature'] != 'null' and pdf_image_data['signature']['updated']:
                    new_sig = pdf_image_data['signature']
                    file_url = s3_picture_upload(new_sig['fileURI'], new_sig['file']['name'])
                    new_sig['fileURL'] = file_url
                    new_sig.pop('fileURI', None)
                    new_sig.pop('updated', None)
                    pdf_images.signature = json.dumps(new_sig)
                    # pdf_images.signature = json.dumps({'fileURI': pdf_image_data['signature']['fileURI']})
                    # file_name = pdf_image_data['signature']['file']['name'] if 'file' in pdf_image_data['signature'] and \
                    # 'name' in pdf_image_data['signature']['file'] else 'signature picture'
                    # file_type, b64_image = pdf_image_data['signature']['fileURI'].split(',')
                    # pdf_images.signature_binary = base64.b64decode(b64_image)
                    # pdf_images.signature_file_name = file_name
                    # pdf_images.signature_file_type = file_type
                    # pdf_images.signature = None
                elif 'signature' in pdf_image_data and pdf_image_data['signature'] == 'null':
                    pdf_images.signature = None
                    # pdf_images.signature_binary = None
                    # pdf_images.signature_file_name = None
                    # pdf_images.signature_file_type = None
                    # pdf_images.signature = None

                additional_exhibits = []
                for index, pic in enumerate(pdf_image_data['additionalExhibits']):
                    if pic != 'null':
                        if 'fileURI' in pic and ('additionalExhibits' not in cur_pdf_images_json or cur_pdf_images_json['additionalExhibits'] is None):
                        # if not hasattr(pdf_images, 'additional_exhibit_' + str(index + 1)) or getattr(pdf_images, 'additional_exhibit_' + str(index + 1)) is None:
                            file_url = s3_picture_upload(pic['fileURI'], pic['file']['name'])
                            pic['fileURL'] = file_url
                            pic.pop('fileURI', None)
                            pic.pop('udpated', None)
                            additional_exhibits.append(pic)
                            # additional_exhibits.append({'pageName': x['pageName'], 'file': x['file'], 'fileURI': x['fileURI']})
                            # file_name = pic['file']['name'] if 'file' in pic and 'name' in pic['file'] else 'additional exhibit' + str(index + 1)
                            # file_type, b64_image = pic['fileURI'].split(',')
                            # setattr(pdf_images, 'additional_exhibit_' + str(index + 1), base64.b64decode(b64_image))
                            # setattr(pdf_images, 'additional_exhibit_' + str(index + 1) + '_page_name', pic['pageName'])
                            # setattr(pdf_images, 'additional_exhibit_' + str(index + 1) + '_file_type', file_type)
                            # setattr(pdf_images, 'additional_exhibit_' + str(index + 1) + '_file_name', file_name)
                            # setattr(pdf_images, 'additional_exhibits', None)
                        elif pic['updated'] and 'file' in pic:
                            file_url = s3_picture_upload(pic['fileURI'], pic['file']['name'])
                            pic['fileURL'] = file_url
                            pic.pop('fileURI', None)
                            pic.pop('udpated', None)
                            additional_exhibits.append(pic)
                            # additional_exhibits.append({'pageName': x['pageName'], 'file': x['file'], 'fileURI': x['fileURI']})
                            # file_name = pic['file']['name'] if 'file' in pic and 'name' in pic['file'] else 'additional exhibit' + str(index + 1)
                            # file_type, b64_image = pic['fileURI'].split(',')
                            # setattr(pdf_images, 'additional_exhibit_' + str(index + 1), base64.b64decode(b64_image))
                            # setattr(pdf_images, 'additional_exhibit_' + str(index + 1) + '_page_name', pic['pageName'])
                            # setattr(pdf_images, 'additional_exhibit_' + str(index + 1) + '_file_type', file_type)
                            # setattr(pdf_images, 'additional_exhibit_' + str(index + 1) + '_file_name', file_name)
                            # setattr(pdf_images, 'additional_exhibits', None)
                        elif not pic['updated'] and 'additionalExhibits' in cur_pdf_images_json and cur_pdf_images_json['additionalExhibits'] is not None and index < len(cur_pdf_images_json['additionalExhibits']):
                            additional_exhibits.append(cur_pdf_images_json['additionalExhibits'][index])
                pdf_images.additional_exhibits = json.dumps(additional_exhibits) if len(additional_exhibits) > 0 else None

        evaluation.save()
        # cache.delete_memoized(get_eval_by_id, int(evaluation.org_id))
        if should_log_eval_save:
            user = get_user_by_session_token(session['session_token'])
            eval_save_log = EvaluationSaveLog(user_id=user.id, evaluation=evaluation, organization=evaluation.organization,
                has_pdf='pdf' in data and data['pdf'] is not None, save_criteria=save_criteria, eval_id_perm=evaluation.id)
            eval_save_log.save()
            # cache.delete_memoized(get_saves_by_org_id, int(evaluation.org_id))
            # cache.delete_memoized(get_saves_by_eval_id, int(evaluation.id))
        return jsonify(error=False, evaluation=evaluation.serialize)
    if request.method == 'DELETE':
        evaluation = Evaluation.query.get(int(eval_id))
        # cache.delete_memoized(get_eval_by_id, int(evaluation.org_id))
        db.session.delete(evaluation)
        db.session.commit()
        return jsonify(error=False)


# @cache.memoize(7200)
def get_saves_by_org_id(org_id):
    save_query = EvaluationSaveLog.query.filter_by(org_id=int(request.args.get('orgId'))).order_by(EvaluationSaveLog.timestamp.desc())
    evaluation_save_logs = save_query.all()
    return evaluation_save_logs


@eval_blueprint.route('/saves', methods=['GET'])
@requires_login()
@requires_role(['RootAdmin', 'AppAdmin'])
def get_evaluation_save_log():
    if request.args.get('orgId') is None:
        return jsonify(error=True, message='Missing required parameter - orgId')
    # save_query = EvaluationSaveLog.query.filter_by(org_id=int(request.args.get('orgId'))).order_by(EvaluationSaveLog.timestamp.desc())
    evaluation_save_logs = get_saves_by_org_id(int(request.args.get('orgId')))
    return jsonify(error=False, saves=[x.serialize for x in evaluation_save_logs])

# @cache.memoize(172800)
def get_saves_by_eval_id(eval_id):
    evaluation = Evaluation.query.get(int(eval_id))
    evaluation_save_logs = evaluation.evaluation_save_logs.order_by(EvaluationSaveLog.timestamp.desc()).all()
    return evaluation_save_logs

@eval_blueprint.route('/<eval_id>/saves', methods=['GET'])
@requires_login()
@requires_role(['RootAdmin', 'AppAdmin'])
def get_evaluation_save_log_by_eval(eval_id):
    evaluation_save_logs = get_saves_by_eval_id(int(eval_id))
    return jsonify(error=False, saves=[x.serialize for x in evaluation_save_logs])


@eval_blueprint.route('/upload_file', methods=['POST'])
@requires_login()
def upload_pdf():
    if 'file' not in request.files:
        return jsonify(error=True, message='No File')
    pdf_blob = request.files['file']

    s3 = boto3.client('s3',
    aws_access_key_id='',#1121
    aws_secret_access_key=''
    )
    filename = str(uuid.uuid1()) + '-' + request.form['filename']
    s3.upload_fileobj(ExtraArgs={'ACL': 'public-read'}, Fileobj=pdf_blob, Bucket='evaluation-pdfs', Key=filename)
    return jsonify(file='https://s3.amazonaws.com/evaluation-pdfs/'+filename, error=False)


def s3_picture_upload(file_uri, file_name):
    s3 = boto3.client('s3',
    aws_access_key_id='',#1121
    aws_secret_access_key=''
    )
    pic_binary = base64.b64decode(file_uri.split(',')[1])
    unique_file_name = str(uuid.uuid1()) + '-' + file_name
    tmp_file_name = 'tmp-' + file_name
    with open(tmp_file_name, 'wb') as pic_blob:
        pic_blob.write(pic_binary)
    with open(tmp_file_name, 'rb') as pic_blob:
        s3.upload_fileobj(ExtraArgs={'ACL': 'public-read'}, Fileobj=pic_blob, Bucket='evaluation-photos', Key=unique_file_name)
    try:
        os.remove(tmp_file_name)
    except OSError:
        pass
    return 'https://s3.amazonaws.com/evaluation-photos/'+unique_file_name

@eval_blueprint.route('/upload_picture', methods=['POST'])
@requires_login()
def upload_picture():
    if 'file' not in request.files:
        return jsonify(error=True, message='No File')
    pic_blob = request.files['file']

    s3 = boto3.client('s3',
    aws_access_key_id='', #1121
    aws_secret_access_key=''
    )
    filename = str(uuid.uuid1()) + '-' + request.form['filename']
    s3.upload_fileobj(ExtraArgs={'ACL': 'public-read'}, Fileobj=pic_blob, Bucket='evaluation-photos', Key=filename)

    return jsonify(file='https://s3.amazonaws.com/evaluation-photos/'+filename, error=False)


@eval_blueprint.route('/file_proxy', methods=['GET'])
@requires_login()
def file_proxy():
    if request.args.get('url') is None:
        print('Misisng parameter.')
        resp = Response('Missing parameter - url', 400)
        return resp 
    print('URL: ', request.args.get('url'))
    req = requests.get(request.args.get('url'), stream=True)
    return Response(stream_with_context(req.iter_content(chunk_size=1024)), content_type=req.headers['content-type'])