STANDARD_MESSAGE_ENHANCEMENT_TEXT = """"""

ANALYSIS_MESSAGE_ENHANCEMENT_TEXT = """Please provide me with a PQL in JSON format that can answer this question, keep it in one JSON and do not add any other text:"""


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