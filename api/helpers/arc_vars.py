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
COPILOT_USER_USER_TYPE = "user"
COPILOT_CHAT_TABLE_NAME = "copilot__chat"
COPILOT_MESSAGE_TABLE_NAME = "copilot__message"
INTERNAL_TABLES = [
    "column__column",
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
    "_id",
    "__",
    "view_"
]

# AI variables
ANALYSIS_COPILOT_SYSTEM_INSTRUCTIONS = """You are a data analysis assistant to help users analyze their data.
You use provided functions when neccesary to fetch data from the database and provide insights to the user.
Your formality level should be professional, helpful, but friendly.
Your verbal communication should be clear and concise.
Your verbosity should be minimal, only provide the necessary information, unless asked for more details.
"""
ANALYSIS_COPILOT_USER_MESSAGE_ENHANCEMENT = """Do not make any assumptions, only provide insights based on the data provided.
Ask clarifying questions if you need more information to provide an accurate analysis.
If the use provides a table name or column names, and you need to use them, you can use some of the provided functions to get the correect names first, before using them in your analysis or to call other functions.
"""