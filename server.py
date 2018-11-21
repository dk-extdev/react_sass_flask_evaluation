from flask import (
    Flask,
    render_template,
    request,
    session,
    redirect,
    jsonify,
    url_for,
    Response,
)
import os
from models.shared import db
from helpers import initialize_db, requires_login
from models.User import User, UserInvite, ForgotPassword
from models.Address import County
from routes import user_blueprint, org_blueprint, land_data_blueprint, eval_blueprint
from datetime import datetime
from helpers import send_email
from flask_migrate import Migrate
from flask_sslify import SSLify
from flask_compress import Compress
from cache import cache
from helpers import get_session_by_token, get_user_by_session_token
from gevent.pywsgi import WSGIServer
from html2canvas_proxy import *
from flask_cors import CORS

app = application = Flask(__name__)

# SSLify(app, permanent=True)
ENV = os.getenv("ENV", "DEV")
app.debug = ENV != "PROD"
app.secret_key = "secret_key"
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
    "DATABASE_URL", "postgresql://postgres:password@localhost:5432/agvalue"
)
app.config["SPARKPOST_API_KEY"] = os.getenv(
    "SPARKPOST_API_KEY", "0e041963ec89bcc9732133118f7a1b51f1f31745"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SQLALCHEMY_POOL_SIZE"] = 5
app.config["SQLALCHEMY_POOL_RECYCLE"] = 120
# app.config['SQLALCHEMY_ECHO'] = True
db.init_app(app)
cache.init_app(app)
cache.clear()
migrate = Migrate(app, db)
initialize_db(db, app, migrate)
CORS(app)
# db.session.close_all()

# @app.teardown_request
# def shutdown_session(response_or_exc):
#     if app.config['SQLALCHEMY_COMMIT_ON_TEARDOWN']:
#         if response_or_exc is None:
#             db.session.commit()
#
#     db.session.remove()
#     return response_or_exc

app.register_blueprint(user_blueprint, url_prefix="/user")
app.register_blueprint(org_blueprint, url_prefix="/organization")
app.register_blueprint(land_data_blueprint, url_prefix="/landData")
app.register_blueprint(eval_blueprint, url_prefix="/evaluation")

Compress(app)

h2c = None
real_path = (
    os.path.dirname(os.path.realpath(__file__)) + "/images"
)  # eg.: /home/guilherme/project1/images, in Window Machine use +'\\images'
virtual_path = (
    "/html2canvas/images/"
)  # In browser http://127.0.0.1/test-case/html2canvas/images/*


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "GET":
        return render_template("login.html")
    data = request.get_json()
    ip_address = request.headers.get("X-Forwarded-For", request.remote_addr)
    resp = User.login(data["email"], data["password"], ip_address)
    if "error" in resp and resp["error"]:
        return jsonify(resp)
    if "session_token" in session:
        cache.delete_memoized(get_session_by_token, session["session_token"])
        cache.delete_memoized(get_user_by_session_token, session["session_token"])
    session.pop("session_token", None)
    session["session_token"] = resp["session_token"].session_token

    return jsonify({"error": False, "redirect": url_for("index")})


@app.route("/logOut", methods=["POST"])
def log_out():
    cache.delete_memoized(get_session_by_token, session["session_token"])
    cache.delete_memoized(get_user_by_session_token, session["session_token"])
    session.pop("session_token", None)
    return jsonify(error=False)


# @app.route('/adminLogin', methods=['GET', 'POST'])
# def admin_login():
#     if request.method == 'GET':
#         return render_template('adminLogin.html')


@app.route("/signUp", methods=["GET", "POST", "PUT"])
def sign_up():
    # User Invite flow.
    if request.method == "GET":
        if "session_token" in session:
            return redirect(url_for("index"), code=303)
        user_invite = UserInvite.query.filter_by(
            token=request.args.get("token")
        ).first()
        if user_invite is None or user_invite.expirationDate < datetime.now():
            if user_invite is None:
                return render_template("invalidUserInvite.html")
            return render_template("inviteExpired.html", token=user_invite.token)
        return render_template(
            "signUp.html", email=user_invite.email, token=user_invite.token
        )

    if request.method == "POST":
        data = request.get_json()
        email = data["email"]
        password = data["password"]
        token = data["token"]
        user_invite = UserInvite.query.filter_by(token=token).first()
        user = User(
            name=user_invite.name,
            email=email,
            password=User.hash_password(password),
            organization=user_invite.organization,
        )
        user.roles.append(user_invite.role)
        user.save()
        logged_in_user = User.login(email, password)
        session["session_token"] = logged_in_user["session_token"].session_token
        return jsonify(error=False, redirect=url_for("index"))
    if request.method == "PUT":
        # resend user invite because it expired.
        data = request.get_json()
        token = data["token"]
        user_invite = UserInvite.query.filter_by(token=token).first()
        new_user_invite = UserInvite(
            email=user_invite.email,
            name=user_invite.name,
            organization=user_invite.organization,
            role=user_invite.role,
        )
        resp = send_email(
            {"address": {"name": data["name"], "email": data["email"]}},
            "You've been invited to use AG Value!",
            "You have been invited to use the E-Value Solutions Evaluation Software. "
            + "Please follow the link to finishing setting up your acccount: "
            + url_for("sign_up", token=new_user_invite.token),
        )
        if "error" in resp and resp.error:
            return jsonify(error=True, message="Error Sending Email")
        new_user_invite.save()
        return jsonify(error=False, userInvite=new_user_invite.serialize)


@app.route("/requestForgotPassword", methods=["GET", "POST"])
def request_forgot_password():
    if request.method == "GET":
        expired = (
            request.args.get("expired")
            if request.args.get("expired") is not None
            else False
        )
        if "session_token" in session:
            cache.delete_memoized(get_session_by_token, session["session_token"])
            cache.delete_memoized(get_user_by_session_token, session["session_token"])
        return render_template("requestForgotPassword.html")
    if request.method == "POST":
        data = request.get_json()
        user = User.query.filter_by(email=data["email"].lower()).first()
        if user is None:
            return jsonify(
                error=True,
                message="The email you have entered does not belong any user",
            )
        forgot_password_obj = ForgotPassword(user=user)
        forgot_password_obj.save()
        resp = send_email(
            [{"address": {"name": user.name, "email": data["email"]}}],
            "E-Value - Password Reset",
            "Please follow the link to reset your password: "
            + url_for(
                "forgot_password", token=forgot_password_obj.token, _external=True
            ),
        )
        print(resp)
        if "error" in resp and resp.error:
            return jsonify(error=True, message=resp)
        return jsonify(error=False)


@app.route("/forgotPassword", methods=["GET", "POST"])
def forgot_password():
    if request.method == "GET":
        if "session_token" in session:
            cache.delete_memoized(get_session_by_token, session["session_token"])
            cache.delete_memoized(get_user_by_session_token, session["session_token"])
            session.pop("session_token", None)
        forgot_password_obj = ForgotPassword.query.filter_by(
            token=request.args.get("token")
        ).first()
        if (
            forgot_password_obj is None
            or forgot_password_obj.expired
            or forgot_password_obj.expirationDate < datetime.now()
        ):
            return render_template("requestForgotPassword.html", expired=True)
        return render_template("forgotPassword.html", token=forgot_password_obj.token)
    if request.method == "POST":
        data = request.get_json()
        password = data["password"]
        token = data["token"]

        forgot_password_obj = ForgotPassword.query.filter_by(token=token).first()

        if (
            forgot_password_obj is None
            or forgot_password_obj.expired
            or forgot_password_obj.expirationDate < datetime.now()
        ):
            return jsonify(
                error=True, redirect=url_for("request_forgot_password", expired=True)
            )
        user = forgot_password_obj.user

        user.password = User.hash_password(password)
        user.save()

        logged_in_user = User.login(user.email, password)
        session["session_token"] = logged_in_user["session_token"].session_token

        forgot_password_obj.expired = True

        forgot_password_obj.save()

        return jsonify(error=False, redirect=url_for("index"))


@app.route("/county", methods=["GET"])
@requires_login()
def get_counties():
    counties = County.query.all()
    return jsonify(counties=[x.serialize for x in counties], error=False)


@app.route("/")
@app.route("/<path:path>")
@requires_login()
def index(path=None):
    return render_template("index.html")


@app.route("/html2canvas/proxy")
def pdf_proxy():
    h2c = html2canvasproxy(request.args.get("callback"), request.args.get("url"))
    #  h2c.enable_crossdomain() #Uncomment this line to enable the use of "Data URI scheme"

    h2c.useragent(request.headers["user_agent"])
    h2c.hostname(request.url)

    if request.referrer is not None:
        h2c.referer(request.referrer)

    h2c.route(real_path, virtual_path)

    if request.args.get("debug_vars"):  #
        return Response(str(h2c.debug_vars()), mimetype="text/plain")

    r = h2c.result()

    return Response(r["data"], mimetype=r["mime"])


@app.route("/html2canvas/images/<image>")
def pdf_image(image):
    res = html2canvasproxy.resource(real_path, image)

    if res is None:
        return "", 404
    else:
        return Response(
            res["data"],
            mimetype=res["mime"],
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Request-Method": "*",
                "Access-Control-Allow-Methods": "OPTIONS, GET",
                "Access-Control-Allow-Headers": "*",
            },
        )


# @app.route('/graphTest')
# def graph_test():
#     return render_template('graphTest.html')

if __name__ == "__main__":
    PORT = int(os.getenv("PORT", 5000))
    HOST = os.getenv("HOST", "0.0.0.0")
    if ENV == "PROD":
        print("Running Gevent")
        WSGIServer((HOST, PORT), app).serve_forever()
    else:
        app.run(host=HOST, port=PORT, threaded=True)
