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
COPILOT_CHAT_TYPES = ["analysis", "process", "extraction"]

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
    "view_"
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
        },
        {
            "name": "get_data_from_table_and_columns",
            "description": "Retrieves data from a specified table and selected columns, if provided. If no columns are specified, data from all columns is returned. The function returns the data in a dictionary format.",
            "parameters": {
                "type_": "OBJECT",
                "properties": {
                    "tenant_id": {
                        "type_": "STRING",
                        "description": "Unique identifier for the tenant to ensure data isolation."
                    },
                    "table_name": {
                        "type_": "STRING",
                        "description": "Name of the table from which data is to be retrieved."
                    },
                    "columns_list": {
                        "type_": "ARRAY",
                        "items": {
                            "type_": "STRING"
                        },
                        "description": "List of column names to retrieve data from. Optional. If not specified, data from all columns will be retrieved."
                    }
                },
                "required": ["tenant_id", "table_name"]
            }
        },
        {
            "name": "update_row_in_table",
            "description": "Updates specific columns of a designated row in a specified table. Validates column existence and matches new values to column data types, then updates the row identified by a unique row ID.",
            "parameters": {
                "type_": "OBJECT",
                "properties": {
                    "tenant_id": {
                        "type_": "STRING",
                        "description": "Unique identifier for the tenant to ensure data isolation."
                    },
                    "table_name": {
                        "type_": "STRING",
                        "description": "Name of the table where the row is to be updated."
                    },
                    "row_id": {
                        "type_": "INTEGER",
                        "description": "Unique identifier of the row to update (id field)."
                    },
                    "column_names": {
                        "type_": "ARRAY",
                        "items": {
                            "type_": "STRING"
                        },
                        "description": "List of column names where the updates will be applied."
                    },
                    "new_values": {
                        "type_": "ARRAY",
                        "items": {
                            "type_": "STRING"
                        },
                        "description": "List of new values corresponding to the column names."
                    }
                },
                "required": ["tenant_id", "table_name", "row_id", "column_names", "new_values"]
            }
        },
        {
            "name": "add_new_row_in_table",
            "description": "Adds a new row to a specified table with values for each column. Excludes the addition of rows with 'id' or 'updatedAt' columns directly.",
            "parameters": {
                "type_": "OBJECT",
                "properties": {
                    "tenant_id": {
                        "type_": "STRING",
                        "description": "Unique identifier for the tenant to ensure data isolation."
                    },
                    "table_name": {
                        "type_": "STRING",
                        "description": "Name of the table where the new row is to be added."
                    },
                    "column_names": {
                        "type_": "ARRAY",
                        "items": {
                            "type_": "STRING"
                        },
                        "description": "List of column names for which values will be inserted. 'id' and 'updatedAt' should not be included as they are managed automatically."
                    },
                    "new_values": {
                        "type_": "ARRAY",
                        "items": {
                            "type_": "STRING"
                        },
                        "description": "List of new values corresponding to the column names.The length must match the number of column names provided."
                    }
                },
                "required": ["tenant_id", "table_name", "column_names", "new_values"]
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

# Extraction variables
EXTRACTION_COPILOT_SYSTEM_INSTRUCTIONS = """
You are an assistant in a business management system and you are talking to the user directly, you help users create new rows or update existing rows.
Your formality level should be professional, helpful, and moderately friendly.
Your verbal communication should be clear and concise.
If fields are not provided, feel free to leave them empty.
"""
EXTRACTION_COPILOT_USER_MESSAGE_ENHANCEMENT =f"""
Do not make any assumptions, only provide insights based on the data provided.
"""
EXTRACTION_COPILOT_ALLOWED_FUNCTIONS = ['get_data_from_table_and_columns', 'update_row_in_table', 'add_new_row_in_table']




# """
# Here is your recommended workflow, some of which you can do from the prodided message and instructions and some you have to responde with the right function:
# 1. The user types in a message what they want to do (ex: "I need a 3-day PTO starting next week")
#     - If unclear, ask clarifying questions.
# 2. Each user request has a process it is being done uder. A process is a collection of tables that are relevant to a task. For example, 'customer', 'vendor', 'orders' tables might be under 'Order Management" process.
#     - The process name will be provided to you.
#     - You use the information about the process they are doing it under to determine what table to update and what columns to update.
#     - If the process does not support the action or task, you should inform the user. 
# 3. After you figure out the tables and column that are relevant, get data from those tables and columns.
#     - This is done to determine what data is already in the database, and what data needs to be added or updated.
# 4. If there are rows that have mostly similar information as the user's request, that means you should likely update the data in those rows instead of adding new rows.
#     - to find relevance, you should compare the data in the rows with the data in the user's request.
# 5. If you think you should update the data in the rows instead of adding a new row, you should confirm with the user and let them decide.
# 6. If the user says you should update the data in the rows, you should update the data in the rows.
#     - Every row has a unique identifier which is the 'id' field, you should use that when asked for the id or row_id by functions
# 7. If the user says you should add new rows, you should add new rows.
# 8. Once done, Let the user know the result of the action, if it was successful or not and how many rows were updated or added.
# 9. If you belive you should do neither, you should inform the user.
# 
# A new employee named Anderson Cuomo started yesterday. Can you update the appropriate table with this information? 
# """