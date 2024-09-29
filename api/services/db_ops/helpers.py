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
    'YYYY-MM-DD', 'MM/DD/YYYY', 'DD/MM/YYYY'
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
    """
    Validate the value based on the data type.

    Parameters:
    - value: The value to be validated.
    - data_type (str): The type of the value ('string', 'integer', 'float', 'date').

    Returns:
    - bool: True if valid, False otherwise.
    """
    # Validate based on the data type
    if data_type == 'string':
        return isinstance(value, str)
    
    elif data_type == 'integer':
        try:
            int(value)  
            return True
        except ValueError:
            return False
    
    elif data_type == 'float':
        try:
            float(value)  
            return True
        except ValueError:
            return False
    
    elif data_type == 'date':
        return is_valid_date(value, data_format)
    else:
        return False

def is_valid_date(date_str, data_format):
    if data_format not in ALLOWED_DATE_FORMATS:
        return False
    
    try:
        # Try to parse the date string into a datetime object
        datetime.strptime(date_str, data_format)
        return True
    except ValueError:
        return False

if __name__ == '__main__':
    pass