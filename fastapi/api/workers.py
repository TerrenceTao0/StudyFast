from rq import Queue, SimpleWorker
from rq.timeouts import TimerDeathPenalty

from job_queue import redis_connection

##

class WindowsSimpleWorker(SimpleWorker):
    death_penalty_class = TimerDeathPenalty

##

if (__name__ == "__main__"):
    queue = Queue(
        "documents",
        connection=redis_connection
    )

    worker = WindowsSimpleWorker(
        [queue],
        connection=redis_connection
    )

    worker.work(
        with_scheduler=True
    )

