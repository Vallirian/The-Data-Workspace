from datetime import datetime

DATA_EXTRACTION_TYPES = ['csv']
DATA_TYPE_MAP = {
    'string': 'TEXT',
    'integer': 'INTEGER',
    'float': 'FLOAT',
    'date': 'DATE',
}
INVALID_CHARACTERS_IN_TABLE_NAME = [
    ' ', '-', '.', ',', ';', ':', '__'
]

INVALID_CHARACTERS_IN_COLUMN_NAME = [
    ' ', '-', '.', ',', ';', ':', '__'
]

ALLOWED_DATE_FORMATS = [
     'MM/DD/YYYY', 'DD/MM/YYYY', 'MM-DD-YYYY', 'DD-MM-YYYY'
]

MAX_COLUMNS = 50

def dictfetchall(cursor):
    "Return all rows from a cursor as a list of dicts"

    columns = [col[0] for col in cursor.description]
    return [
        dict(zip(columns, row))
        for row in cursor.fetchall()
    ]

def validate_value(value, data_type, data_format=None):
    if (value is None) or (value == ''):
        return True, ''
    
    if data_type == 'string':
        try:
            str(value)  
            return True, ''
        except ValueError as e:
            return False, str(e)
    
    elif data_type == 'integer':
        try:
            int(value)  
            return True, ''
        except ValueError as e:
            return False, str(e)
    
    elif data_type == 'float':
        try:
            float(value)  
            return True, ''
        except ValueError as e:
            return False, str(e)
    
    elif data_type == 'date':
        if not data_format:
            return False, 'Date format not provided'
        return is_valid_date(value, data_format)
    else:
        return False, 'Invalid data type'

def is_valid_date(date_str, data_format: str):
    if data_format not in ALLOWED_DATE_FORMATS:
        return False
    
    try:
        # Try to parse the date string into a datetime object
        _python_date_format = data_format.replace('YYYY', '%Y').replace('MM', '%m').replace('DD', '%d')
        datetime.strptime(date_str, _python_date_format)
        return True, ''
    except ValueError as e:
        return False, str(e)

if __name__ == '__main__':
    pass