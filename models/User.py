from models.shared import db
import uuid
import os
from datetime import datetime, timedelta
from passlib.hash import pbkdf2_sha256

user_roles = db.Table('user_roles',
                      db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True),
                      db.Column('role_id', db.Integer, db.ForeignKey('role.id'), primary_key=True)
                      )


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(), nullable=False)
    email = db.Column(db.String(), unique=True, nullable=False)
    password = db.Column(db.String(), nullable=False)
    session_tokens = db.relationship('SessionToken', backref=db.backref('user', lazy='subquery'), lazy='dynamic')
    roles = db.relationship('Role', secondary=user_roles, lazy='select', backref=db.backref('users',
                                                                                             lazy='dynamic'))
    disabled = db.Column(db.Boolean())

    createdAt = db.Column(db.DateTime, nullable=False)
    updatedAt = db.Column(db.DateTime, nullable=False)
    org_id = db.Column(db.Integer, db.ForeignKey('organization.id'), nullable=True)
    organization = db.relationship('Organization', backref=db.backref('users', lazy='dynamic'), uselist=False,
                                   lazy='joined')

    def __init__(self, **kwargs):
        super(User, self).__init__(**kwargs)
        self.disabled = False
        self.email = self.email.lower() if self.email is not None else None
        self.createdAt = datetime.now()
        self.updatedAt = datetime.now()

    @staticmethod
    def hash_password(password):
        return pbkdf2_sha256.hash(password)

    @staticmethod
    def login(username, password, ip_address=None):
        user = User.query.filter_by(email=username.lower()).first()

        if user is None:
            return {'error': True, 'message': 'Username/Password does not exist'}

        if not pbkdf2_sha256.verify(password, user.password):
            return {'error': True, 'message': 'Username/Password does not exist'}

        if user.disabled:
            return {'error': True, 'message': 'Your account has been disabled. Reach out to your admin.'}

        if user.organization.disabled:
            return {'error': True, 'message': 'Your account has been disabled. Contact your account manager.'}

        session_token = SessionToken(user_id=user.id, ip_address=ip_address)
        session_token.save()
        return {'user': user, 'session_token': session_token}

    def save(self):
        self.updatedAt = datetime.now()
        self.email = self.email.lower() if self.email is not None else None
        db.session.add(self)
        db.session.commit()

    @property
    def serialize(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'org_id': self.org_id,
            'organization': self.organization.serialize,
            'disabled': self.disabled
        }


class SessionToken(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    session_token = db.Column(db.String(), unique=True, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    expiration_date = db.Column(db.DateTime)
    createdAt = db.Column(db.DateTime, nullable=False)
    valid = db.Column(db.Boolean, nullable=False)
    ip_address= db.Column(db.String)

    def __init__(self, **kwargs):
        super(SessionToken, self).__init__(**kwargs)
        self.session_token = uuid.UUID(bytes=os.urandom(16))
        self.expiration_date = datetime.now() + timedelta(weeks=2)
        self.createdAt = datetime.now()
        self.valid = True

    def save(self):
        db.session.add(self)
        db.session.commit()

    @property
    def serialize(self):
        return {
            'id': self.id,
            'user': self.user.serialize if self.user is not None else None,
            'expirationDate': self.expiration_date,
            'createdAt': self.createdAt,
            'valid': self.valid,
            'ipAddress': self.ip_address
        }


class Role(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(), nullable=False)
    createdAt = db.Column(db.DateTime, nullable=False)
    updatedAt = db.Column(db.DateTime, nullable=False)

    def __init__(self, **kwargs):
        super(Role, self).__init__(**kwargs)
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
            'name': self.name
        }


class UserInvite(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(), nullable=False)
    email = db.Column(db.String(), nullable=False)
    token = db.Column(db.String(), nullable=False)
    createdAt = db.Column(db.DateTime, nullable=False)
    updatedAt = db.Column(db.DateTime, nullable=False)
    expired = db.Column(db.Boolean, nullable=False),
    expirationDate = db.Column(db.DateTime, nullable=False)
    org_id = db.Column(db.Integer, db.ForeignKey('organization.id'), nullable=False)
    organization = db.relationship('Organization', backref=db.backref('user_invites', lazy='dynamic'), uselist=False,
                                   lazy='select')
    role_id = db.Column(db.Integer, db.ForeignKey('role.id'), nullable=False)
    role = db.relationship('Role', backref=db.backref('user_invites', lazy='dynamic'), uselist=False, lazy='select')

    def __init__(self, **kwargs):
        super(UserInvite, self).__init__(**kwargs)
        self.expired = False
        self.email = self.email.lower() if self.email is not None else None
        self.createdAt = datetime.now()
        self.updatedAt = datetime.now()
        self.expirationDate = datetime.now() + timedelta(weeks=1)
        self.token = uuid.UUID(bytes=os.urandom(16))

    def save(self):
        self.updatedAt = datetime.now()
        self.email = self.email.lower() if self.email is not None else None
        db.session.add(self)
        db.session.commit()

    @property
    def serialize(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role.serialize,
            'expirationDate': self.expirationDate
        }

class ForgotPassword(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user = db.relationship('User', backref=db.backref('user_password_requests', lazy='dynamic'), uselist=False,
                            lazy='select')
    token = db.Column(db.String, nullable=False)
    expired = db.Column(db.Boolean, nullable=False)
    expirationDate = db.Column(db.DateTime, nullable=False)
    createdAt = db.Column(db.DateTime, nullable=False)
    updatedAt = db.Column(db.DateTime, nullable=False)

    def __init__(self, **kwargs):
        super(ForgotPassword, self).__init__(**kwargs)
        self.expired = False
        self.createdAt = datetime.now()
        self.updatedAt = datetime.now()
        self.expirationDate = datetime.now() + timedelta(hours=3)
        self.token = uuid.UUID(bytes=os.urandom(16))

    def save(self):
        self.updatedAt = datetime.now()
        db.session.add(self)
        db.session.commit()

    @property
    def serialize(self):
        return {
            'id': self.id,
            'user': self.user.serialize,
            'token': self.token,
            'expired': self.expired,
            'expirationDate': self.expirationDate
        }
