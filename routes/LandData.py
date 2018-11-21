from flask import Blueprint, request, jsonify, session
from helpers import requires_login, requires_role, send_email
from models import LandData, County, User, SessionToken
import pandas as pd
from models.shared import db
from helpers import get_user_by_session_token
from re import sub
import sys
import json

land_data_blueprint = Blueprint('landData', __name__)


@land_data_blueprint.route('/', methods=['GET'])
@requires_login()
def get_land_data():
    ld_query = LandData.query
    if request.args.get('counties') is not None:
        county_ids = [int(x) for x in request.args.get('counties').split(',')]
        ld = ld_query.filter(LandData.county_id.in_(county_ids)).all()
    else:
        ld = ld_query.all()
    print(len(ld))
    return jsonify(error=False, landData=[l.serialize for l in ld])


@land_data_blueprint.route('/import', methods=['POST'])
@requires_login()
@requires_role(['RootAdmin', 'AppAdmin'])
def data_import():
    if 'file' not in request.files:
        return jsonify(error=True, message='No File')
    df = pd.ExcelFile(request.files['file']).parse()
    count = 0
    counties = {}
    errors = []
    # user = User.query.join(SessionToken).filter(SessionToken.session_token ==
    #                                                session['session_token']).first()
    user = get_user_by_session_token(session['session_token'])
    header_mapping = json.loads(request.form['headerMapping']) 
    for index, row in df.iterrows():
        try:
            if row[header_mapping['Reconciled Property Type']] == 'Vacant Ag':  # Temp
                fields = ['Sale Date', 'Reconciled Property Type','Parcel Number', 'Sale Price', 'Acres', 'Current Use', 'County Reference']
                for x in fields:
                    field = header_mapping[x]
                    if pd.isnull(row[field]):
                        raise Exception(field + ' is missing.')  # Misisng Data.
                ld = LandData.query.filter_by(parcel_number=str(row[header_mapping['Parcel Number']])).first()
                if ld is None:
                    ld = LandData(parcel_number=str(row[header_mapping['Parcel Number']]), county_reference=row[header_mapping['County Reference']])
                state = None
                if 'state' in request.form or ('State' in row and not pd.isnull(row['State'])):
                    state = request.form['state'] if 'state' in request.form else row['State']
                    ld.state = state
                ld.sale_date = row[header_mapping['Sale Date']]
                ld.sale_price = row[header_mapping['Sale Price']]
                ld.sale_price_num = float(sub(r'[^\d.]', '', str(row[header_mapping['Sale Price']])))
                ld.acres = float(row[header_mapping['Acres']])
                ld.current_use = row[header_mapping['Current Use']]
                ld.property_type = row[header_mapping['Reconciled Property Type']]
                if row[header_mapping['County Reference']] in counties:
                    ld.county = counties[row[header_mapping['County Reference']]]
                else:
                    if state is not None:
                        county_lookup = County.query.filter_by(state=state, county=row[header_mapping['County Reference']].lower()).first()
                    else:
                        county_lookup = County.query.filter_by(county=row[header_mapping['County Reference']].lower()).first()
                    if county_lookup is not None:
                        ld.county = county_lookup
                        counties[row[header_mapping['County Reference']]] = county_lookup
                    else:
                        county = County(state=state if state is not None else '', county=row[header_mapping['County Reference']].lower())
                        counties[row[header_mapping['County Reference']]] = county
                        ld.county = county

                db.session.add(ld)
        except Exception as e:
            errors.append({
                'row': index + 1,
                'message': str(e)
            })
    db.session.commit()
    message = "Data Imported Properly"
    if len(errors) > 0:
        message = "Finished import land data with errors. Errors will be emailed to you. Please check your Spam folder."
        recipients = [{'address': {'name': user.name, 'email': user.email}}]
        if 'additional_emails' in request.form and len(request.form['additional_emails']) > 0:
            recipients.extend([{'address': {'email': x}} for x in data['additional_emails']])
        subject = 'Errors In E-Value Land Data Import'
        email_message = 'Some errors occurred in your E-Value Land Data Import. Here is a list of the errors:\n'
        for x in errors:
            email_message += 'Row Number: ' + str(x['row']) + ', Error Message: ' + x['message']
        send_email(recipients, subject, email_message)

    return jsonify(error=False, message=message)
