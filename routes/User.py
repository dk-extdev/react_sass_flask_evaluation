from flask import Blueprint, request, jsonify, g, session, url_for
from helpers import requires_login, requires_role, send_email, get_user_by_session_token, get_session_by_token
from models.User import User, UserInvite, SessionToken, Role, user_roles
from models.Organization import Organization, org_counties, Area
from models.shared import db
from models.Address import County
from cache import cache

user_blueprint = Blueprint('user', __name__)


@user_blueprint.route('/me', methods=['GET'])
@requires_login()
def get_user():
    user = get_user_by_session_token(session['session_token'])
    county_join = db.session.query(org_counties).filter_by(org_id=user.org_id).all()
    counties = County.query.filter(County.id.in_([x[0] for x in county_join])).all()

    areas = Area.query.filter_by(org_id=user.org_id).all()
    roles = Role.query.join(user_roles).filter_by(user_id=user.id).all()
    return jsonify(user=user.serialize, roles=[x.serialize for x in roles],
                   organization=user.organization.serialize, error=False,
                   counties=[x.serialize for x in counties],
                   areas=[x.serialize for x in areas])


@user_blueprint.route('/invite', methods=['POST', 'GET'])
@requires_login()
@requires_role(['RootAdmin', 'AppAdmin', 'OrgAdmin'])
def user_invite(invite_id=None):
    if request.method == 'POST':
        data = request.get_json()
        if 'orgId' not in data or 'name' not in data or 'email' not in data or 'role' not in data:
            return jsonify(error=True, message='Missing parameter(s)')
        # look up user invite and user.
        existing_user = User.query.filter_by(email=data['email'].lower()).first()
        if existing_user is not None:
            if data['orgId'] != existing_user.org_id:
                return jsonify(error=True, message='User with email, ' + data['email'] +
                                                   ' already exists for a different Organization.')
            else:
                return jsonify(error=True, message='User with email, ' + data['email'] + ' already exists.')
        existing_invite = UserInvite.query.filter_by(email=data['email'].lower()).first()
        if existing_invite is not None:
            if existing_invite.org_id != data['orgId']:
                return jsonify(error=True, message=data['email'] + ' has been invited by another organization.')
        org = Organization.query.get(data['orgId'])
        role = Role.query.filter_by(name=data['role']).first()
        invite = UserInvite(
            email=data['email'],
            name=data['name']
        )
        invite.organization = org
        invite.role = role
        resp = send_email([{'address': {'name': data['name'], 'email': data['email']}}],
                          "You've been invited to use E-Value!",
                          "You have been invited to use the E-Value Solutions Evaluation Software. " +
                          "Please follow the link to finishing setting up your acccount: " +
                          url_for('sign_up', token=invite.token, _external=True))

        if 'error' in resp and resp.error:
            return jsonify(error=True, message='Error Sending Email')
        invite.save()
        return jsonify(error=False, userInvite=invite.serialize)

    if request.method == 'GET':
        if request.args.get('orgId') is None:
            return jsonify(error=True, message='Missing Parameter(s)')
        invites = UserInvite.query.filter_by(org_id=request.args.get('orgId')).all()
        return jsonify(error=False, userInvites=[i.serialize for i in invites])



@user_blueprint.route('/invite/<invite_id>', methods=['DELETE'])
@requires_login()
@requires_role(['RootAdmin', 'AppAdmin', 'OrgAdmin'])
def user_invite_by_id(invite_id):
    if request.method == 'DELETE':
        print("Im here")
        user_invite = UserInvite.query.get(int(invite_id))
        db.session.delete(user_invite)
        db.session.commit()
        return jsonify(error=False)


@user_blueprint.route('/<user_id>/disable', methods=['POST'])
@requires_login()
@requires_role(['RootAdmin', 'AppAdmin'])
def disable_enable_user(user_id):
    user = User.query.get(int(user_id))
    roles = user.roles
    is_root_admin = 'RootAdmin' in [x.name for x in roles]
    if is_root_admin:
        return jsonify(error=True, message='You cannot disable a Root Admin account')
    user.disabled = not user.disabled
    user.save()
    cache.delete_memoized(get_session_by_token, session['session_token'])
    cache.delete_memoized(get_user_by_session_token, session['session_token'])
    serialized_user = user.serialize
    serialized_user['roles'] = [x.serialize for x in roles]
    return jsonify(error=False, user=serialized_user)
