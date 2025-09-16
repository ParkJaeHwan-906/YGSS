import requests
from config import SPRING_API_URL

def get_term_dictionary():
    response = requests.get(SPRING_API_URL+"/chatbot/term/list")
    return response.json()