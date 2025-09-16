import numpy as np
import requests
from db.LoadTermDictionary import get_term_dictionary
from config import OPENAI_API_URL, OPENAI_API_KEY, OPENAI_MODEL

def get_embedding(term):
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer {}".format(OPENAI_API_KEY)
    }
    payload = {
        "model": OPENAI_MODEL,
        "input": term
    }

    response = requests.post(OPENAI_API_URL, headers=headers, json=payload)
    response.raise_for_status()
    data=response.json()

    vector = np.array(data['data'][0]['embedding'], dtype=np.float32)
    return vector

def vector_to_bytes(vector):
    return vector.tobytes()
