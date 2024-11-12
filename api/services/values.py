import datetime

# Arc SQL
SQL_RESERVED_KEYWORDS = ['SELECT', 'FROM', 'WHERE', 'GROUP BY', 'HAVING', 'ORDER BY', 'LIMIT', 'JOIN', 'ON', 'IN', 'EXISTS', 'LIKE', 'BETWEEN', 'UNION', 'INTERSECT', 'EXCEPT']
SQL_DDL_KEYWORDS = ['DROP', 'TRUNCATE', 'DELETE', 'INSERT', 'UPDATE', 'CREATE', 'ALTER', 'GRANT', 'REVOKE', 'SEARCH_PATH']

# SQL execution
DEFAULT_SCHEMA = 'public' # Default schema for PostgreSQL execution
DATA_TABLE_COLUMN_META = 'data_table_column_meta'
DATA_TABLE_META = 'data_table_meta'
FORMULA_MESSAGE = 'formula_message'
ARC_USER = 'arc_user'

DATA_TYPE_MAP = {
    'string': 'TEXT',
    'integer': 'INTEGER',
    'float': 'FLOAT',
    'date': 'DATE',
}
INVALID_CHARACTERS_IN_NAME = [
    '-', '.', ',', ';', ':', '__'
]
ALLOWED_DATE_FORMATS = [
     'MM/DD/YYYY', 'DD/MM/YYYY', 'MM-DD-YYYY', 'DD-MM-YYYY', 'YYYY/MM/DD', 'YYYY-MM-DD'
]

MAX_COLUMNS = 50

# AI Agent
ANALYSIS_AGENT_INSTRUCTION = f"""Write a structured and effective SQL query to derive meaningful insights from the company's data, using one table at a time. Your query will address business questions and be used in the backend to execute and generate final results.
# Important Notes: The result from your query will be executed in Python so: 
- Ensure the syntax is correct, including escaping characters like percent (%) sign.
- always put column names and table names in quotes ("") to avoid PostgreSQL errors. Example: "column_name", "table_name".
"""