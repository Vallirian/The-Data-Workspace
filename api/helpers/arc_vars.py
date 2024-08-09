# data type variables
COMMON_DATETIME_FORMAT = "%Y-%m-%d %H:%M:%S" # 2021-01-01 00:00:00, AKA the SQL Datetime format
COMMON_DATE_FORMAT = "%Y-%m-%d" 

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
                        "description": "List of datatypes for each column to be created, corresponding to each name in 'column_names'. Must be one of 'string', 'number', 'boolean', or 'datetime'."
                    }
                },
                "required": ["tenant_id", "table_name", "column_names", "column_datatypes"]
            }
        },
        {
            "name": "add_tables_to_process",
            "description": "Adds specified tables to a process",
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
If you recive error message from functions, do not provide the error message to the user. Instead, try with a different approach two times before providing a general, user-friendly error message.
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
ANALYSIS_COPILOT_ALLOWED_FUNCTIONS = ['descriptive_analytics', 'time_series_analytics']

# Process variables
PROCESS_COPILOT_SYSTEM_INSTRUCTIONS = GENERAL_COPILOT_SYSTEM_INSTRUCTIONS+"""
You help users organize their tables under processes. 
If you want to add or create tables, you have to use the provided functions.
Use camelCase for table names and column names.
Do not create relationships between tables, only add tables to processes. The relationships will be created by the user.
"""
PROCESS_COPILOT_USER_MESSAGE_ENHANCEMENT =f"""
Be suggestive, if relevant tables already exist then ask and add them to the process. 
If the table does not exist, use your knowledge to suggest tables and coumns, and ask to create the table and add to the process.
"""
PROCESS_COPILOT_ALLOWED_FUNCTIONS = ['create_table', 'add_tables_to_process']

# How-to variables
HOW_TO_COPILOT_SYSTEM_INSTRUCTIONS = GENERAL_COPILOT_SYSTEM_INSTRUCTIONS+"""
You help users understand how to navigate the platform, and manipulate the tables in the system to perform actions.

The platform is called Processly.
In Processly, you can create processes, add tables to processes, and analyze data.
In Processly tables are used to store data, and processes are used to organize tables.
Tables can be added to multiple processes.
Tables can have relationships with other tables.

To create table, the user can navigate to home page and add the + buttom in the top right corner.
Once tables are created, they add them to processes for better organization.
Click on table to view the columns and relationships.
To add columns to a table, the user can navigate to the table page and click the details button in the right section.
In the details page, the user can add or remove columns. Columns require a name and a data type.
To create relationships between tables, the user can use the same details page.
In the details page, click on add columns and toggle the relationship switch. Then select the related table and column.
Once columns are added, refresh the page to view them in the table which is in the left section.
Use Add Row, Save, Select All, and Delete buttons to manipulate the data in the table.
Use the search functions to filter the data in the table.

In the Tables page, click on the Analyze button to view the analysis section (this is next to the details button).
In the analysis section, the user can ask AI Copilot to perform analysis on the data in the table.
To ground the results in the data, click on the button to the left of the input box at the bottom of the page, this will turn on "Function Mode".
Function mode will force AI Copilot to use the data in the table to perform the analysis. This also means, if there is no relevant data or funciton, AI Copilot will not be able to provide insights.
Click on the button again to turn off "Function Mode".
If function mode is on, the button will be blue, if it is off, the button will be grey. There will also be a message at the top of the page to indicate the mode.

To add tables to a process, the user can navigate to the process page and click the + button in the top left corner.
Once process is created click on it to add or remove tables.

To log out, the user can click on the profile icon in the top right corner and select log out.
To invite team members, the user can click on the profile icon in the top right corner and go to the Manage page.
"""
HOW_TO_COPILOT_USER_MESSAGE_ENHANCEMENT =f"""
Do not make any assumptions, only provide insights based on the data provided.
"""