# data type variables
COMMON_DATETIME_FORMAT = "%Y-%m-%d %H:%M:%S" # 2021-01-01 00:00:00, AKA the SQL Datetime format
COMMON_DATE_FORMAT = "%Y-%m-%d %H:%M:%S"

# Database variables
SUPPORTED_COLUMN_DATATYPES = ["string", "number", "boolean", "datetime"] # UUID is not supported because it AI Copilot does not differentiate between proper use case for UUID and string
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

# function_calling variables
STRING_COMPARISON_OPERATORS = ["contains"]
NUMERIC_COMPARISON_OPERATORS = [">", ">=", "<", "<=", "="]
BOOLEAN_COMPARISON_OPERATORS = ["="]
DATE_COMPARISON_OPERATORS = [">", ">=", "<", "<=", "="]
GROUP_BY_AGGREGATORS = ["sum", "average", "count"]
TIME_SERIES_PERIODS = ["day", "week", "day of week", "month", "year"]


# AI Copilot variables
FUNCTION_DECLARATIONS = {
    "function_declarations": [
        # descriptive analytics
        {
            "name": "descriptive_analytics",
            "description": "Performs statistical operations such as mean, median, mode, etc., on data retrieved from a specified table. It supports optional filtering and grouping to refine the analysis.",
            "parameters": {
                "type_": "OBJECT",
                "properties": {
                    "tenant_id": {
                        "type_": "STRING",
                        "description": "Unique identifier for the tenant to ensure data isolation."
                    },
                    "table_name": {
                        "type_": "STRING",
                        "description": "Name of the table from which data is to be retrieved and analyzed."
                    },
                    "filter": {
                        "type_": "OBJECT",
                        "description": "Optional filtering parameters. Requires column, condition, and value.",
                        "properties": {
                            "column": {"type_": "STRING"},
                            "condition": {"type_": "STRING", "enum": STRING_COMPARISON_OPERATORS + NUMERIC_COMPARISON_OPERATORS},
                            "value": {"type_": "STRING"}
                        }
                    },
                    "group": {
                        "type_": "OBJECT",
                        "description": "Optional grouping parameters. Requires column and aggregation type.",
                        "properties": {
                            "column": {"type_": "STRING"},
                            "aggregation": {"type_": "STRING", "enum": ["sum", "average", "count"]}
                        }
                    },
                    "column": {
                        "type_": "STRING",
                        "description": "The specific column to perform the operation on. Required."
                    },
                    "operation": {
                        "type_": "STRING",
                        "enum": ["mean", "median", "mode", "sum", "count", "range", "frequency_distribution", "relative_frequency_distribution"],
                        "description": "The statistical operation to perform. Required."
                    }
                },
                "required": ["tenant_id", "table_name", "column", "operation"]
            }
        },
        {
            "name": "proportion_analytics",
            "description": "Calculates the percentage of occurrences of a specified value within a given column of a table, optionally within a defined time period.",
            "parameters": {
                "type_": "OBJECT",
                "properties": {
                    "tenant_id": {
                        "type_": "STRING",
                        "description": "Unique identifier for the tenant to ensure data isolation."
                    },
                    "table_name": {
                        "type_": "STRING",
                        "description": "Name of the table from which data is to be retrieved and analyzed."
                    },
                    "column": {
                        "type_": "STRING",
                        "description": "The column to analyze for the specified value. Required."
                    },
                    "value": {
                        "type_": "STRING",
                        "description": "The value to calculate the percentage occurrence of. Required."
                    },
                    "period": {
                        "type_": "STRING",
                        "enum": TIME_SERIES_PERIODS,
                        "description": "Optional time period to consider for the analysis."
                    },
                    "operation": {
                        "type_": "STRING",
                        "enum": ["percentage"],
                        "description": "The operation to perform. Currently, only 'percentage' is supported."
                    }
                },
                "required": ["tenant_id", "table_name", "column", "value", "operation"]
            }
        },
        {
            "name": "time_series_analytics",
            "description": "Performs time series analysis operations like rate of change over a specified period on a date column within data retrieved from a specified table.",
            "parameters": {
                "type_": "OBJECT",
                "properties": {
                    "tenant_id": {
                        "type_": "STRING",
                        "description": "Unique identifier for the tenant to ensure data isolation."
                    },
                    "table_name": {
                        "type_": "STRING",
                        "description": "Name of the table from which data is to be retrieved and analyzed."
                    },
                    "number_column": {
                        "type_": "STRING",
                        "description": "The numeric column in the dataset to calculate the rate of change on. Required."
                    },
                    "date_column": {
                        "type_": "STRING",
                        "description": "The date column in the dataset to base the time series analysis on. Required."
                    },
                    "period": {
                        "type_": "STRING",
                        "enum": ["day", "week", "day of week", "month", "year"],
                        "description": "The time period over which to calculate the rate of change. Required."
                    },
                    "operation": {
                        "type_": "STRING",
                        "enum": ["average_rate_of_change"],
                        "description": "The operation to perform. Currently, only 'average_rate_of_change' is supported."
                    }
                },
                "required": ["tenant_id", "table_name", "number_column", "date_column", "period", "operation"]
            }
        },

        
        # process
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
                            "enum": SUPPORTED_COLUMN_DATATYPES
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

GENERAL_COPILOT_SYSTEM_INSTRUCTIONS = """
You are an assistant in a business management system.
Your formality level should be professional, helpful, and moderately friendly.
Your verbal communication should be clear and concise.
"""

# Analysis variables
ANALYSIS_COPILOT_SYSTEM_INSTRUCTIONS = GENERAL_COPILOT_SYSTEM_INSTRUCTIONS+f"""
You help users analyze their data.
You use provided functions when neccesary to fetch data from the database, do calculations, and provide insights to the user.
For dates use the format {COMMON_DATETIME_FORMAT} or {COMMON_DATE_FORMAT}.
"""
ANALYSIS_COPILOT_USER_MESSAGE_ENHANCEMENT =f"""
Do not make any assumptions, only provide insights based on the data provided.
"""
ANALYSIS_COPILOT_ALLOWED_FUNCTIONS = ['descriptive_analytics', 'proportion_analytics', 'time_series_analytics']

# Process variables
PROCESS_COPILOT_SYSTEM_INSTRUCTIONS = GENERAL_COPILOT_SYSTEM_INSTRUCTIONS+"""
You help users organize their tables under processes.
You use provided functions when neccesary to create tables and add tables to processes.
Before creating a table or adding a table to a process, confirm with the user.
"""
PROCESS_COPILOT_USER_MESSAGE_ENHANCEMENT =f"""
Do not make any assumptions, only provide insights based on the data provided.
"""
PROCESS_COPILOT_ALLOWED_FUNCTIONS = ['create_table', 'add_tables_to_process']

# How-to variables
HOW_TO_COPILOT_SYSTEM_INSTRUCTIONS = GENERAL_COPILOT_SYSTEM_INSTRUCTIONS+"""
You help users understand how to do manipulate the tables in the system to perform actions.
Tables are organized under processes, tables in one process are related to each other, and one table can be used in multiple processes.
If fields are not provided, feel free to leave them empty.
"""
HOW_TO_COPILOT_USER_MESSAGE_ENHANCEMENT =f"""
Do not make any assumptions, only provide insights based on the data provided.
"""