# Arc SQL
SQL_RESERVED_KEYWORDS = ['SELECT', 'FROM', 'WHERE', 'GROUP BY', 'HAVING', 'ORDER BY', 'LIMIT', 'JOIN', 'ON', 'IN', 'EXISTS', 'LIKE', 'BETWEEN', 'UNION', 'INTERSECT', 'EXCEPT']
SQL_DDL_KEYWORDS = ['DROP', 'TRUNCATE', 'DELETE', 'INSERT', 'UPDATE', 'CREATE', 'ALTER', 'GRANT', 'REVOKE']

# SQL execution
DEFAULT_SCHEMA = 'app_common'
DATA_TABLE_COLUMN_META = 'data_table_column_meta'
DATA_TABLE_META = 'data_table_meta'
FORMULA_MESSAGE = 'formula_message'

DATA_TYPE_MAP = {
    'string': 'TEXT',
    'integer': 'INTEGER',
    'float': 'FLOAT',
    'date': 'DATE',
}
INVALID_CHARACTERS_IN_NAME = [
    ' ', '-', '.', ',', ';', ':', '__'
]
ALLOWED_DATE_FORMATS = [
     'MM/DD/YYYY', 'DD/MM/YYYY', 'MM-DD-YYYY', 'DD-MM-YYYY'
]

MAX_COLUMNS = 50