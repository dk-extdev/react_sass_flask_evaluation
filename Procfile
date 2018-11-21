web: gunicorn server:app  --worker-class gevent --worker-connections 1000 --max-requests 250
release: python -m flask db upgrade
