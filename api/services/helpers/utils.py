import random
from services.values import RANDOM_NAME_ADJECTIVES, RANDOM_NAME_NOUNS

# Random
def generate_random_workspace_name():
    """
    Generate a random name using an adjective and a noun.
    """

    try:
        adjective = random.choice(RANDOM_NAME_ADJECTIVES)
        noun = random.choice(RANDOM_NAME_NOUNS)
        return f"{adjective} {noun}"
    except Exception as e:
        return "Untitled Workbook"