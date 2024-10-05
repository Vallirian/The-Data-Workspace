STANDARD_MESSAGE_ENHANCEMENT_TEXT = """"""

# MODELS = {
#     'OPENAI': {
#         'PQL_ASSISTANT_JSON': {
#             # 'model': 'gpt-4o-2024-08-06',
#             'model': 'gpt-4o-mini',
#             'instructions': """You are a business analysis assistant in the Processly platform.
#             You take users' questions and provide them with a PQL that that can answer their questions.""",
#             'name': 'PQLAssistant',
#             'quesiton_enhancement': True,
#             'enhancement_text': 'Please provide me with a PQL in JSON format that can answer this question, keep it in one JSON and do not add any other text:'
#         }
#     }
# }

# USER_MESSAGE_TYPES = ['PQL', 'STANDARD']
# VALID_MODELS = ['OPENAI.PQL_ASSISTANT_JSON']


def extract_json_from_md(md: str) -> dict:
    import re
    import json

    '''
    Extracts JSON from a markdown string
    returns: 
        - (bool, str| dict): (True, dict) if successful, (False, error message) if not
    '''
    non_greedy_json_patetrn = r'```json\n(.*?)```'
    json_strings = re.findall(non_greedy_json_patetrn, md, re.DOTALL)

    if len(json_strings) != 1:
        return (False, f'Expected only one json string got {len(json_strings)}')
    
    return (True, json.loads(json_strings[0]))


if __name__ == '__main__':
    pass