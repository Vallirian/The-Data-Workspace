data_type_map = {
    "UUID": "VARCHAR(128)",
    "string": "TEXT", 
    "number": "NUMERIC",
    "boolean": "BOOLEAN",
    "datetime": "TIMESTAMP"
}

# Database variables
column_table = "column__column"
COPILOT_MODEL_USER_TYPE = "model"
COPILOT_MODEL_USER_NAME = "model"
COPILOT_USER_USER_TYPE = "user"
COPILOT_CHAT_TABLE_NAME = "copilot__chat"
COPILOT_MESSAGE_TABLE_NAME = "copilot__message"
INTERNAL_TABLES = [
    "column__column",
    "copilot__chat",
    "copilot__message",
]



# validortor variables
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



ANALYSIS_COPILOT_SYSTEM_INSTRUCTIONS = """
You are a data analysis assistant to help users analyze their data.
You use provided functions when neccesary to fetch data from the database, do calculations, and provide insights to the user.
Your formality level should be professional, helpful, and moderately friendly.
Your verbal communication should be clear and concise.
"""
ANALYSIS_COPILOT_USER_MESSAGE_ENHANCEMENT =f"""
Do not make any assumptions, only provide insights based on the data provided.
"""

ANALYSIS_ACTION_COPILOT_ALLOWED_FUNCTION_NAMES = [
    'get_descriptive_analytics_for_table',
]

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
        }
    ]
}