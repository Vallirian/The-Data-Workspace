def extract_json_from_md(md: str) -> dict:
    import re
    import json

    '''
    Extracts JSON from a markdown string
    returns: 
        - (bool, str| dict): (True, dict) if successful, (False, error message) if not
    '''

    try:
        non_greedy_json_patetrn = r'```json\n(.*?)```'
        json_strings = re.findall(non_greedy_json_patetrn, md, re.DOTALL)

        if len(json_strings) != 1:
            return (False, f'Expected only one json string got {len(json_strings)}')
    
        return (True, json.loads(json_strings[0]))
    except Exception as e:
        print(f'Error extracting JSON: {md}')
        return (False, f"Error parsing JSON {str(e)}")


if __name__ == '__main__':
    pass