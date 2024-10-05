import re
import uuid

KEY_WORDS = [
    "TABLE", "BLOCKS", "EXTENSION_BLOCKS", "COLUMNS", "OPERATOR", "AS", "GROUP_BY", "GROUPING_OPERATORS",
    "GROUPING_BLOCK", "FILTER_BLOCK", "COMPARISON_OPERATOR", "VALUE", "SCALAR_BLOCK", "VERSION", "DESCRIPTION", "NAME"
]

REQUIRED_KEYS = [
    "TABLE", "BLOCKS", "SCALAR_BLOCK", "VERSION", "DESCRIPTION", "NAME"
]

BLOCK_KEYS = [
    "GROUPING_BLOCK", "FILTER_BLOCK", "EXTENSION_BLOCK", "SCALAR_BLOCK"
]

OPERATORS = [
    "ROW_MULTIPLY", "ROW_SUM", "ROW_AVERAGE", "COLUMN_COUNT", "COLUMN_SUM", "COLUMN_AVERAGE", "COLUMN_MIN", 
    "COLUMN_MAX", "COLUMN_MODE", "COLUMN_STANDARD_DEVIATION", "COLUMN_CONVERT_YEAR", "COLUMN_CONVERT_MONTH",
    "COLUMN_CONVERT_DAY", "COLUMN_CONVERT_FLOOR", "COLUMN_CONVERT_CEILING", "COLUMN_CONVERT_ABSOLUTE"
]

ROW_OPERATORS = [
    "ROW_MULTIPLY", "ROW_SUM", "ROW_AVERAGE"
]

COMPARISON_OPERATORS = [
    "=", "!=", ">", "<", ">=", "<=", "IS NULL", "IS NOT NULL"
]

OPERATOR_CLASS_MAP = {
    "ROW_SUM": "RowSum",

    "COLUMN_AVERAGE": "ColumnAverage",
    "COLUMN_SUM": "ColumnSum",
    "COLUMN_COUNT": "ColumnCount",
    "COLUMN_MIN": "ColumnMin",
    "COLUMN_MAX": "ColumnMax",
    "COLUMN_MODE": "ColumnMode",
    "COLUMN_STANDARD_DEVIATION": "ColumnStandardDeviation",

    "COLUMN_CONVERT_YEAR": "ColumnConvertYear",
    "COLUMN_CONVERT_MONTH": "ColumnConvertMonth",
    "COLUMN_CONVERT_DAY": "ColumnConvertDay",
    "COLUMN_CONVERT_FLOOR": "ColumnConvertFloor",
    "COLUMN_CONVERT_CEILING": "ColumnConvertCeiling",
    "COLUMN_CONVERT_ABSOLUTE": "ColumnConvertAbsolute"

}


def get_data_type(mysql_type):
    mysql_type = mysql_type.lower()

    if 'int' in mysql_type:
       return 'INTEGER'
    elif any([elem in mysql_type for elem in['decimal', 'numeric', 'real', 'double', 'float', 'bit']]):
        return 'FLOAT'
    elif 'date' in mysql_type:
        return 'DATE'
    else:
        return 'STRING'


def extract_full_keys(nested_dict, parent_key=''):
    '''
    extract keys from a nested dictionary 
    return:
        - list of dictionaries with keys 'path' and 'key'
            - path is the full path to the key
            - key is the key name
    '''
    keys = []
    for key, value in nested_dict.items():
        full_key = f"{parent_key}.{key}" if parent_key else key
        keys.append({'path': full_key, 'key': key})
        if isinstance(value, dict):
            keys.extend(extract_full_keys(value, full_key))
        if isinstance(value, list):
            for i, item in enumerate(value):
                if isinstance(item, dict):
                    keys.extend(extract_full_keys(item, f"{full_key}[{i}]"))
    return keys

def get_value_from_path(d, path):
    '''
    get value from a nested dictionary using a path
    '''
    # Split the path by '.' but also capture any list indices using regex
    parts = re.split(r'\.|\[|\]', path)

    # Filter out any empty strings from the split result
    parts = [part for part in parts if part]
    
    value = d
    for part in parts:
        if part.isdigit():
            # If the part is a digit, it's an index for a list
            value = value[int(part)]
        else:
            # Otherwise, it's a dictionary key
            value = value[part]
    
    return value

def create_latest_table_name():
    return f"latest_table_{uuid.uuid4().hex}"

if __name__ == '__main__':
    pass