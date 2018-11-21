from models import *
from functools import wraps
from flask import redirect, session, jsonify, url_for
import os
from sparkpost import SparkPost
import re
from cache import cache
from time import time
from alembic import command

def initialize_db(db, app, migrate):
    with app.app_context():
        #print(Organization.__table__.columns)
        
        if len(db.engine.table_names()) == 0:
            print('I should not be running.')
            db.create_all()
            command.stamp(migrate.get_config(), 'head')
            # Check roles and create if they don't exist
            # App Admin
            app_admin = Role.query.filter_by(name='AppAdmin').first()
            if app_admin is None:
                app_admin = Role(name='AppAdmin')
                db.session.add(app_admin)

            # Root Admin
            root_admin = Role.query.filter_by(name='RootAdmin').first()
            if root_admin is None:
                root_admin = Role(name='RootAdmin')
                db.session.add(root_admin)

            # Org Admin
            org_admin = Role.query.filter_by(name='OrgAdmin').first()
            if org_admin is None:
                org_admin = Role(name='OrgAdmin')
                db.session.add(org_admin)

            # Org User
            org_user = Role.query.filter_by(name='OrgUser').first()
            if org_user is None:
                org_user = Role(name='OrgUser')
                db.session.add(org_user)
            ag_value_org = Organization.query.filter_by(name='AG Value').first()
            if ag_value_org is None:
                address = Address(address1='P.O. Box 1546', city='Rome', state='GA', country='USA', postal_code='30162')
                db.session.add(address)
                ag_value_org = Organization(name='AG Value', address=address)
                db.session.add(ag_value_org)

            # Check for Curt's account and create if it doesn't exist.
            curts_account = User.query.filter_by(email='curt@agvalueconsulting.com').first()
            if curts_account is None:
                curts_account = User(email='curt@agvalueconsulting.com',
                                     password=User.hash_password(os.getenv('CURTS_INITIAL_PASSWORD', 'password')),
                                     name='Curt Bearden')
                curts_account.roles.append(root_admin)
                curts_account.organization = ag_value_org
                db.session.add(curts_account)
            geoffs_account = User.query.filter_by(email='geoffreyrgross@gmail.com').first()
            if geoffs_account is None:
                geoffs_account = User(email='geoffreyrgross@gmail.com',
                                      password=User.hash_password(os.getenv('GEOFFS_PASSWORD', 'password')),
                                      name='Geoffrey Gross')
                geoffs_account.roles.append(root_admin)
                geoffs_account.organization = ag_value_org
                db.session.add(geoffs_account)
            # if len(ag_value_org.counties.all()) == 0:
            #     counties = County.query.all()
            #     ag_value_org.counties = counties
            #     db.session.add(ag_value_org)
            # if len(ag_value_org.areas.all()) == 0:
            #     # org_counties = ag_value_org.counties.all()
            #     area1List = ['chesterfield', 'darlington', 'dillon', 'marlboro']
            #     area2List = ['clarendon', 'sumter', 'williamsburg']
            #     area3List = ['florence', 'lee', 'marion']
            #     area4List = ['georgetown', 'horry']
            #     area1 = Area(name='Area 1', organization=ag_value_org, state='GA')
            #     area1.counties = [x for x in ag_value_org.counties if x.county in area1List]
            #     db.session.add(area1)

            #     area2 = Area(name='Area 2', organization=ag_value_org, state='GA')
            #     area2.counties = [x for x in ag_value_org.counties if x.county in area2List]
            #     db.session.add(area2)

            #     area3 = Area(name='Area 3', organization=ag_value_org, state='GA')
            #     area3.counties = [x for x in ag_value_org.counties if x.county in area3List]
            #     db.session.add(area3)

            #     area4 = Area(name='Area 4', organization=ag_value_org, state='GA')
            #     area4.counties = [x for x in ag_value_org.counties if x.county in area4List]
            #     db.session.add(area4)

            # land_data = LandData.query.all()
            # county_lookup = {}
            # for ld in land_data:
            #     if ld.county_reference not in county_lookup:
            #         county_lookup[ld.county_reference] = [ld]
            #     else:
            #         county_lookup[ld.county_reference].append(ld)
            #
            # county_strings = list(set(county_lookup.keys()))

            # for x in county_strings:
            #     county = County(county=x.lower())
            #     db.session.add(county)
            #     ag_value_org.counties.append(county)
            #     for y in county_lookup[x]:
            #         y.county = county
            #         db.session.add(y)
            # land_data = LandData.query.all()
            # counties = County.query.filter(County.id.in_(range(1, 13))).all()
            # ag_value_org.counties = counties
            # db.session.add(ag_value_org)
            # county_lookup = {}
            # for x in counties:
            #     county_lookup[x.county.capitalize()] = x
            # for ld in land_data:
            #     ld.county = county_lookup[ld.county_reference]
            #     db.session.add(ld)
            # delete_counties = County.query.filter(County.id.in_(range(13, 25))).all()
            # for x in delete_counties:
            #     db.session.delete(x)

            db.session.commit()


@cache.memoize(172800)
def get_session_by_token(session_token):
    session_instance = SessionToken.query.filter_by(session_token=session_token).first()
    return session_instance


def requires_login():
    def requires_login_decorator(f):
        @wraps(f)
        def wrap(*args, **kwargs):
            if 'session_token' not in session:
                return redirect('/login')
            session_instance = get_session_by_token(session['session_token'])
            user = session_instance.user
            organization = user.organization
            is_disabled = user.disabled or organization.disabled
            if session_instance is None or not session_instance.valid or session_instance.expiration_date < datetime.now() or is_disabled:
                cache.delete_memoized(get_session_by_token, session['session_token'])
                cache.delete_memoized(get_user_by_session_token, session['session_token'])
                session.pop('session_token', None)
                if session_instance is not None and (session_instance.expiration_date < datetime.now() or is_disabled):
                    session_instance.valid = False
                    session_instance.save()
                return redirect(url_for('login'))
            return f(*args, **kwargs)
        return wrap
    return requires_login_decorator


@cache.memoize(172800)
def get_user_by_session_token(session_token):
    user = User.query.join(SessionToken).filter(SessionToken.session_token ==
                                                   session_token).first()
    return user


def requires_role(roles):
    def requires_role_decorator(f):
        @wraps(f)
        def wrap(*args, **kwargs):

            user = get_user_by_session_token(session['session_token'])
            # role = user.roles.filter(Role.name.in_(roles)).first()
            #role_names = set([x.name for x in user.roles]) # I should query the
            #  user_roles table myself instead of making this a subquery/joined
            users_role = Role.query.join(user_roles).filter_by(user_id=user.id).all()
            role_names = set([x.name for x in users_role])
            if role_names.isdisjoint(set(roles)):
                resp = jsonify({'error': True, 'message': 'You do not have the required Role'})
                return resp
            return f(*args, **kwargs)
        return wrap
    return requires_role_decorator


def send_email(recipient, subject, message):
    sp = SparkPost(os.getenv('SPARKPOST_API_KEY', 'aa3d30ff0b5d5d759a17a6d14d1ecbf30ab04544'))
    response = sp.transmission.send(
        use_sandbox=False,
        recipients=recipient,
        subject=subject,
        html='<p>' + message + '</p>',
        from_email='no-reply@' + os.getenv('EMAIL_SENDING_DOMAIN', 'e-valuereport.com')
    )
    return response


def underscore_to_camel(word):
    words = word.split('_')
    camel = ''
    for index, w in enumerate(words):
        if index == 0:
            camel += w
        else:
            camel += w.capitalize()
    return camel


def camel_to_underscore(name):
    s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
    return re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()
