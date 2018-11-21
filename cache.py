from flask_caching import Cache
import os

config = {
    'CACHE_TYPE': os.getenv('CACHE_TYPE', 'simple')
}

if config['CACHE_TYPE'] != 'simple':
    if config['CACHE_TYPE'] == 'redis':
        config['CACHE_REDIS_URL'] = os.getenv('REDISCLOUD_URL', 'redis://user:password@localhost:6379/2')
    elif config['CACHE_TYPE'] == 'memcached':
        pass
    else:
        # Don't recognize it so set it to simple
        config['CACHE_TYPE'] = 'simple'

cache = Cache(config=config)
