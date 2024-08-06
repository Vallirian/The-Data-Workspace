# Database variables
DATA_TYPE_MAP = {
    "UUID": "VARCHAR(128)",
    "string": "TEXT", 
    "number": "NUMERIC",
    "boolean": "BOOLEAN",
    "datetime": "TIMESTAMP"
}

COLUMN_TABLE = "column__column"
PROCESSES_TABLE_NAME = "process__process"
PROCESS_TABLE_RELATIONSHIP_TABLE_NAME = "process__table"
COPILOT_CHAT_TABLE_NAME = "copilot__chat"
COPILOT_MESSAGE_TABLE_NAME = "copilot__message"
COPILOT_MODEL_USER_TYPE = "model"
COPILOT_MODEL_USER_NAME = "model"
COPILOT_USER_USER_TYPE = "user"
COPILOT_CHAT_TYPES = ["analysis", "process", "howTo"]

INTERNAL_TABLES = [
    COLUMN_TABLE,
    PROCESSES_TABLE_NAME,
    PROCESS_TABLE_RELATIONSHIP_TABLE_NAME,
    COPILOT_CHAT_TABLE_NAME,
    COPILOT_MESSAGE_TABLE_NAME
]

NOT_ALLOWED_OBJECT_NAMES = [
    "table", 
    "column", 
    "relationship", 
    "raw_table", 
    "raw_column", 
    "raw_relationship", 
    "`",
    ".",
    "_id",
    "__",
    "view_",
    # " ",
]


# AI Copilot variables
FUNCTION_DECLARATIONS = {
    "function_declarations": [
        {
            "name": "get_descriptive_analytics_for_table",
            "description": "Retrieve descriptive analytics for a specified table with options for filtering by a column and applying arithmetic operations on another column. For example, filter 'employees' table by 'department' with a value of 'Sales' using an 'equal to' operator and then apply a 'count' arithmetic operation on 'employee_id'.",
            "parameters": {
                "type_": "OBJECT",
                "properties": {
                    "tenant_id": {
                        "type_": "STRING",
                        "description": "Unique identifier for the tenant to ensure data isolation."
                    },
                    "table_name": {
                        "type_": "STRING",
                        "description": "Name of the table to analyze."
                    },
                    "filter_column": {
                        "type_": "STRING",
                        "description": "Column name to apply the filter on. Optional. Required if 'filter_value' and 'filter_operator' are specified.",
                        "nullable": True
                    },
                    "filter_value": {
                        "type_": "STRING",
                        "description": "Value to filter the column by, accommodating both numeric and string values. Optional. Required if 'filter_operator' is specified.",
                        "nullable": True
                    },
                    "filter_operator": {
                        "type_": "STRING",
                        "format_": "enum",
                        "enum": ["greater than", "less than", "equal to", "contains", "not equal"],
                        "description": "Operator to apply for the filtering. Options include 'greater than', 'less than', 'equal to', 'contains', 'not equal'. Optional.",
                        "nullable": True
                    },
                    "arithmetic_column": {
                        "type_": "STRING",
                        "description": "Column name on which to perform the arithmetic operation. Optional. Required if 'arithmetic_operator' is specified.",
                        "nullable": True
                    },
                    "arithmetic_operator": {
                        "type_": "STRING",
                        "format_": "enum",
                        "enum": ["sum", "average", "count", "ratio"],
                        "description": "Arithmetic operation to perform on the specified arithmetic column. Options include 'sum', 'average', 'count', 'ratio'. Optional.",
                        "nullable": True
                    }
                },
                "required": ["tenant_id", "table_name"]
            }
        },
        {
            "name": "create_table",
            "description": "Creates a new table in the database with specified columns and datatypes. Validates the table name, column names, and column datatypes, and then attempts to create the table and add columns.",
            "parameters": {
                "type_": "OBJECT",
                "properties": {
                    "tenant_id": {
                        "type_": "STRING",
                        "description": "Unique identifier for the tenant to ensure data isolation."
                    },
                    "table_name": {
                        "type_": "STRING",
                        "description": "Name of the table to be created."
                    },
                    "column_names": {
                        "type_": "ARRAY",
                        "items": {
                            "type_": "STRING"
                        },
                        "description": "List of names for the columns to be created in the table."
                    },
                    "column_datatypes": {
                        "type_": "ARRAY",
                        "items": {
                            "type_": "STRING",
                            "enum": ["UUID", "string", "number", "boolean", "datetime"]
                        },
                        "description": "List of datatypes for each column to be created, corresponding to each name in 'column_names'. Valid options include 'UUID', 'string', 'number', 'boolean', 'datetime'."
                    }
                },
                "required": ["tenant_id", "table_name", "column_names", "column_datatypes"]
            }
        },
        {
            "name": "add_tables_to_process",
            "description": "Adds specified tables to a process. Tables must exist in the database.",
            "parameters": {
                "type_": "OBJECT",
                "properties": {
                    "table_names": {
                        "type_": "ARRAY",
                        "items": {
                            "type_": "STRING"
                        },
                        "description": "List of table names to be added to the process."
                    },
                    "tenant_id": {
                        "type_": "STRING",
                        "description": "Unique identifier for the tenant to ensure data isolation."
                    },
                    "process_name": {
                        "type_": "STRING",
                        "description": "Name of the process to which the tables are to be added."
                    }
                },
                "required": ["table_names", "tenant_id", "process_name"]
            }
        }
    ]
}

# Analysis variables
ANALYSIS_COPILOT_SYSTEM_INSTRUCTIONS = """
You are an assistant in a business management system, you help users analyze their data.
You use provided functions when neccesary to fetch data from the database, do calculations, and provide insights to the user.
Your formality level should be professional, helpful, and moderately friendly.
Your verbal communication should be clear and concise.
"""
ANALYSIS_COPILOT_USER_MESSAGE_ENHANCEMENT =f"""
Do not make any assumptions, only provide insights based on the data provided.
"""
ANALYSIS_COPILOT_ALLOWED_FUNCTIONS = ['get_descriptive_analytics_for_table']

# Process variables
PROCESS_COPILOT_SYSTEM_INSTRUCTIONS = """
You are an assistant in a business management system, you help users organize their tables under processes.
You use provided functions when neccesary to create tables and add tables to processes.
Your formality level should be professional, helpful, and moderately friendly.
Before creating a table or adding a table to a process, confirm with the user.
"""
PROCESS_COPILOT_USER_MESSAGE_ENHANCEMENT =f"""
Do not make any assumptions, only provide insights based on the data provided.
"""
PROCESS_COPILOT_ALLOWED_FUNCTIONS = ['create_table', 'add_tables_to_process']

# How-to variables
HOW_TO_COPILOT_SYSTEM_INSTRUCTIONS = """
You are an assistant in a business management system and you are talking to the user directly, you help users understand how to do manipulate the tables in the system to perform actions.
Tables are organized under processes, tables in one process are related to each other, and one table can be used in multiple processes.
Your formality level should be professional, helpful, and moderately friendly.
Your verbal communication should be clear and concise.
If fields are not provided, feel free to leave them empty.
"""
HOW_TO_COPILOT_USER_MESSAGE_ENHANCEMENT =f"""
Do not make any assumptions, only provide insights based on the data provided.
"""