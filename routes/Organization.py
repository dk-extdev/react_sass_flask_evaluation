from flask import Blueprint, request, jsonify, session
from helpers import requires_login, requires_role, underscore_to_camel, get_user_by_session_token, get_session_by_token
from models.Organization import Organization, Area
from models.Address import Address, County
from models.User import User, SessionToken
from models.shared import db
import json
from cache import cache
from time import time
import base64
import os
import uuid 
import boto3
from routes.Evaluation import s3_picture_upload

org_blueprint = Blueprint('organization', __name__)

@cache.memoize(172800)
def get_all_orgs():
    organizations = Organization.query.all()
    orgs = []
    for x in organizations:
        org = x.serialize
        counties = x.counties.all()
        org['counties'] = [y.serialize for y in counties]
        areas = x.areas.all()
        org['areas'] = [y.serialize for y in areas]
        orgs.append(org)
    return orgs

@org_blueprint.route('/', methods=['GET', 'POST'])
@org_blueprint.route('/<org_id>', methods=['PUT', 'DELETE'])
@requires_login()
@requires_role(['RootAdmin', 'AppAdmin'])
def org_endpoint(org_id=None):
    if request.method == 'GET':
        orgs = get_all_orgs()
        return jsonify(error=False, organizations=orgs)
    if request.method == 'POST':
        data = request.get_json()
        if 'name' not in data or 'address' not in data or 'areas' not in data or ('counties' not in data
                                                                                  and 'newCounties' not in data):
            return jsonify(error=True, message='Missing Parameters')
        organization = Organization(name=data['name'])
        if 'farmableFactor' in data:
            organization.farmable_factor = data['farmableFactor']
        if 'nonfarmableFactor' in data:
            organization.nonfarmable_factor = data['nonfarmableFactor']
        if 'irrigationFactor' in data:
            organization.irrigation_factor = data['irrigationFactor']
        if 'primaryColor' in data and data['primaryColor'] is not None:
            organization.primary_color = json.dumps(data['primaryColor'])
        if 'logo' in data and data['logo'] is not None:
            s3 = boto3.client('s3', #1121
            aws_access_key_id='',
            aws_secret_access_key=''
            )
            filename = str(uuid.uuid1()) + '-' + data['logo']['fileName']
            tmp_filename = 'tmp-' + filename
            with open(tmp_filename, 'wb') as pic_blob:
                pic_blob.write(base64.b64decode(str(data['logo']['fileURI'], 'utf-8').split(','[1])))
            with open(tmp_filename, 'rb') as pic_blob:
                s3.upload_fileobj(ExtraArgs={'ACL': 'public-read'}, Fileobj=pic_blob, Bucket='evaluation-photos', Key=filename)
            try:
                os.remove(tmp_filename)
            except OSError:
                pass
            logo = {'fileURL': 'https://s3.amazonaws.com/evaluation-photos/'+filename, 'fileName': data['logo']['fileName'], 'file': data['logo']['file']}
            organization.logo = json.dumps(logo)
            # file_name = data['logo']['file']['name'] if 'name' in data['logo']['file'] else organization.name + ' logo'
            # img_type, b64_string = data['logo']['fileURI'].split(',')
            # organization.logo_file_name = file_name,
            # organization.logo_file_type = img_type
            # organization.logo_binary = base64.b64decode(b64_string)
            # organization.logo = None
        address = Address(address1=data['address']['address1'], city=data['address']['city'],
                          state=data['address']['state'], country=data['address']['country'],
                          postal_code=data['address']['postalCode'])
        if 'address2' in data:
            address.address2 = data['address2']
        organization.address = address
        counties = {}
        for x in data['counties']:
            county = County.query.get(x)
            organization.counties.append(county)
            counties[x] = county
        if 'newCounties' in data:
            for x in data['newCounties']:
                county_lookup = County.query.filter_by(
                    county=x['county'].lower(), state=x['state']).first()
                if county_lookup is not None:
                    organization.counties.append(county_lookup)
                    counties[x['county']] = county_lookup
                else:
                    county = County(
                        county=x['county'].lower(), state=x['state'])
                    organization.counties.append(county)
                    counties[x['county']] = county
        for x in data['areas']:
            area = Area(name=x['name'], state=x['state']
                        if 'state' in x else '')
            if 'counties' in x:
                for y in data['counties']:
                    area.counties.append(counties[y])
            if 'newCounties' in x:
                for y in data['newCounties']:
                    area.counties.append(counties[y])
        organization.save()
        cache.delete_memoized(get_all_orgs)
        cache.delete_memoized(get_session_by_token, session['session_token'])
        cache.delete_memoized(get_user_by_session_token, session['session_token'])
        return jsonify(error=False, organization=organization.serialize,
                       counties=[
                           x.serialize for x in organization.counties.all()],
                       areas=[x.serialize for x in organization.areas.all()])
    if request.method == 'PUT':
        organization = Organization.query.get(org_id)

        if organization is None:
            return jsonify(error=True, message='Organization does not exist')

        data = request.get_json()
        # Get the exisiting fields
        # I made this more complicated than it has to be so hopefully it will just work when I add new fields (unless they are relationships)
        org_columns = Organization.__table__.columns
        columns = [str(x).split('.')[1] for x in org_columns if str(x).split(
            '.')[1] not in ['id', 'updatedAt', 'createdAt', 'address_id']]
        for col in columns:
            camel_col = underscore_to_camel(col)
            if camel_col in data:
                setattr(organization, col, data[camel_col]
                        if data[camel_col] != 'null' else None)
        if 'address' in data:
            address = organization.address
            addr_columns_unfiltered = Address.__table__.columns
            addr_columns = [str(x).split('.')[1] for x in addr_columns_unfiltered if str(x).split('.')[1] not in ['id', 'updatedAt', 'createdAt']]
            for col in addr_columns:
                camel_col = underscore_to_camel(col)
                print(camel_col)
                if camel_col in data['address']:
                    setattr(address, col, data['address'][camel_col] if data['address'][camel_col] != 'null' else None)
            organization.address = address
        organization.save()
        cache.delete_memoized(get_all_orgs)
        cache.delete_memoized(get_session_by_token, session['session_token'])
        cache.delete_memoized(get_user_by_session_token, session['session_token'])
        json_org = organization.serialize
        counties = organization.counties.all()
        json_org['counties'] = [ x.serialize for x in counties]
        areas = organization.areas.all()
        json_org['areas'] = [x.serialize for x in areas]

        return jsonify(error=False, organization=json_org)


@org_blueprint.route('/me', methods=['GET', 'PUT'])  # If someone wants to update their own organization.
@requires_login()
@requires_role(['RootAdmin', 'AppAdmin', 'OrgAdmin'])
def own_org_endpoint():
    if request.method == 'PUT':
        user = User.query.join(SessionToken).filter(SessionToken.session_token == session['session_token'])\
            .first()
        organization = user.organization

        data = request.get_json()

        if 'logo' in data and data['logo'] is not None:
            if data['logo'] == 'null':
                organization.logo = None
            else:
                # logo is dict containing keys: file (dict with key name), fileURI (base64 data uri), and fileName
                # Need to go to AWS here.
                # s3 = boto3.client('s3',
                # aws_access_key_id='AKIAJVEMVB2ZUIKSMGBA',
                # aws_secret_access_key='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'
                # )
                # filename = str(uuid.uuid1()) + '-' + data['logo']['fileName']
                # tmp_filename = 'tmp-' + filename
                # with open(tmp_filename, 'wb') as pic_blob:
                #     pic_blob.write(base64.b64decode(str(data['logo']['fileURI'],'utf-8').split(','[1])))
                # with open(tmp_filename, 'rb') as pic_blob:
                #     s3.upload_fileobj(ExtraArgs={'ACL': 'public-read'}, Fileobj=pic_blob, Bucket='evaluation-photos', Key=filename)
                # try:
                #     os.remove(tmp_filename)
                # except OSError:
                #     pass
                file_url = s3_picture_upload(data['logo']['fileURI'], data['logo']['fileName'])
                logo = {'fileURL': file_url, 'fileName': data['logo']['fileName'], 'file': data['logo']['file']}
                organization.logo = json.dumps(logo)
                # file_name = data['logo']['file']['name']
                # img_type, b64_string = data['logo']['fileURI'].split(',')
                # organization.logo_file_name = file_name,
                # organization.logo_file_type = img_type
                # organization.logo_binary = base64.b64decode(b64_string)
                # organization.logo = None
        if 'primaryColor' in data and data['primaryColor'] is not None:
            if data['primaryColor'] == 'null':
                organization.primary_color = None
            else:
                organization.primary_color = json.dumps(data['primaryColor'])
        organization.save()
        cache.delete_memoized(get_all_orgs)
        cache.delete_memoized(get_session_by_token, session['session_token'])
        cache.delete_memoized(get_user_by_session_token, session['session_token'])
        return jsonify(error=False, organization=organization.serialize)

@org_blueprint.route('/<org_id>/user', methods=['GET'])
@requires_login()
@requires_role(['RootAdmin', 'AppAdmin', 'OrgAdmin'])
def org_user(org_id):
    organization = Organization.query.get(org_id)
    users = User.query.filter_by(organization=organization).all()
    serialized_users = []
    for x in users:
        serialized_user = x.serialize
        roles = x.roles
        serialized_user['roles'] = [y.serialize for y in roles]
        serialized_users.append(serialized_user)
    return jsonify(error=False, users=serialized_users)


@org_blueprint.route('/<org_id>/county', methods=['GET', 'POST'])
@requires_login()
@requires_role(['RootAdmin', 'AppAdmin'])
def county_endpoint(org_id):
    if request.method == 'GET':
        counties = County.query.filter_by(org_id=org_id).all()
        return jsonify(counties=[x.serialize for x in counties], error=False)
    if request.method == 'POST':
        data = request.get_json()
        organization = Organization.query.get(org_id)
        current_counties = organization.counties.all()
        if 'newCounties' in data:
            for x in data['newCounties']:
                county_lookup = County.query.filter_by(county=x['county'].lower(), state=x['state']).first()
                if county_lookup is not None:
                    organization.counties.append(county_lookup)
                else:
                    county = County(county=x['county'].lower(), state=x['state'])
                    organization.counties.append(county)
        if 'counties' in data:
            for x in data['counties']:
                if len([y for y in current_counties if y.id == x]) == 0:
                    county = County.query.get(x)
                    organization.counties.append(county)
        organization.save()
        cache.delete_memoized(get_all_orgs)
        cache.delete_memoized(get_session_by_token, session['session_token'])
        cache.delete_memoized(get_user_by_session_token, session['session_token'])
        counties = organization.counties.all()
        return jsonify(counties=[x.serialize for x in counties], error=False)


@org_blueprint.route('/<org_id>/area', methods=['GET', 'POST', 'DELETE'])
@requires_login()
@requires_role(['RootAdmin', 'AppAdmin'])
def area_endpoint(org_id):
    if request.method == 'GET':
        areas = Area.query.filter_by(org_id=org_id).all()
        return jsonify(areas=[x.serialize for x in areas], error=False)
    if request.method == 'POST':
        data = request.get_json()
        organization = Organization.query.get(org_id)
        for x in data['areas']:
            area = Area(name=x['name'], state=x['state'] if 'state' in x else '')
            if 'counties' in x:
                counties = County.query.filter(County.id.in_([int(y) for y in x['counties']])).all()
                area.counties.extend(counties)
            if 'newCounties' in x:
                for y in data['newCounties']:
                    # This should always be the case because I think I will wait for the new Counties to return before
                    # creating Areas.
                    county_lookup = County.query.filter_by(state=y['state'], county=y['county'].lower()).first()
                    if county_lookup is not None:
                        area.counties.append(county_lookup)
                    else:
                        county = County(state=y['state'], county=y['county'].lower())
                        area.counties.append(county)
            organization.areas.append(area)
        organization.save()
        cache.delete_memoized(get_all_orgs)
        cache.delete_memoized(get_session_by_token, session['session_token'])
        cache.delete_memoized(get_user_by_session_token, session['session_token'])
        areas = organization.areas.all()
        return jsonify(areas=[x.serialize for x in areas], error=False)
    if request.method == 'DELETE':
        data = request.get_json()
        area_ids = [int(x) for x in data['areaIds']]
        areas = Area.query.filter(Area.id.in_(area_ids)).all()
        for x in areas:
            db.session.delete(x)
        db.session.commit()
        cache.delete_memoized(get_all_orgs)
        cache.delete_memoized(get_session_by_token, session['session_token'])
        cache.delete_memoized(get_user_by_session_token, session['session_token'])
        return jsonify(error=False)


@org_blueprint.route('/<org_id>/area/<area_id>', methods=['DELETE', 'PUT'])
@requires_login()
@requires_role(['RootAdmin', 'AppAdmin'])
def area_id_endpoint(org_id, area_id):
    if request.method == 'DELETE':
        area = Area.query.get(int(area_id))
        db.session.delete(area)
        db.session.commit()
        cache.delete_memoized(get_all_orgs)
        cache.delete_memoized(get_session_by_token, session['session_token'])
        cache.delete_memoized(get_user_by_session_token, session['session_token'])
        return jsonify(error=False)


@org_blueprint.route('/<org_id>/disable', methods=['POST'])
@requires_login()
@requires_role(['RootAdmin', 'AppAdmin'])
def disable_enable_org(org_id):
    if int(org_id) == 1:
        return jsonify(error=True, message='You cannot disable the root account.')
    org = Organization.query.get(int(org_id))
    org.disabled = not org.disabled
    org.save()
    cache.delete_memoized(get_all_orgs)
    cache.delete_memoized(get_session_by_token, session['session_token'])
    cache.delete_memoized(get_user_by_session_token, session['session_token'])
    return jsonify(error=False, org=org.serialize)
