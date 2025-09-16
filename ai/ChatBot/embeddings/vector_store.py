import redis
from config import REDIS_HOST, REDIS_PORT

r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=False)

def save_vector(id, embedding):
    r.hset(f"term:{id}", mapping={"embedding": embedding})

def search_vector(query_embedding, k=1):
    return r.execute_command(
        "FT.SEARCH",
        "idx:terms",
        "*=>[KNN {} @embedding $vec AS score]".format(k),
        "PARAMS", 2, "vec", query_embedding,
        "RETURN", 1, "id",
        "SORTBY", "score",
        "LIMIT", 0, k
    )