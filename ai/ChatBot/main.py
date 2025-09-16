from db.LoadTermDictionary import get_term_dictionary
from embeddings.embed_utils import get_embedding, vector_to_bytes
from embeddings.vector_store import save_vector, search_vector

for t in get_term_dictionary():
    id = t["id"]
    term = t["term"]
    save_vector(id, vector_to_bytes(get_embedding(term)))
