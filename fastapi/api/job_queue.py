import os

from dotenv import load_dotenv
from redis import Redis
from rq import Queue

##

load_dotenv()

REDIS_URL = os.environ["REDIS_URL"]

redis_connection = Redis.from_url(
    REDIS_URL
)

document_queue = Queue(
    "documents",
    connection=redis_connection,
    default_timeout=600
)

