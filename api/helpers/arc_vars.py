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

# AI variables
# ANALYSIS_COPILOT_SYSTEM_INSTRUCTIONS = """You are a data analysis assistant to help users analyze their data.
# You use provided functions when neccesary to fetch data from the database and provide insights to the user.
# Your formality level should be professional, helpful, but friendly.
# Your verbal communication should be clear and concise.
# Your verbosity should be minimal, only provide the necessary information, unless asked for more details.
# """
# ANALYSIS_COPILOT_USER_MESSAGE_ENHANCEMENT = """Do not make any assumptions, only provide insights based on the data provided.
# Ask clarifying questions if you need more information to provide an accurate analysis.
# If the user provides a table name or column names, and you need to use them, you can use some of the provided functions to get the correect names first, before using them in your analysis or to call other functions.
# """

FUNCITON_NAME_MAP = {
    "get_info_about_all_available_tables": "get_info_about_all_available_tables",
    "get_info_about_all_columns_for_table": "get_info_about_all_columns_for_table",
    "get_data_in_table_for_all_columns": "get_data_in_table_for_all_columns",
    "get_data_in_table_for_specific_columns": "get_data_in_table_for_specific_columns",
    "get_descriptive_statistics_for_table": "get_descriptive_statistics_for_table",
    "get_total_count_of_rows_in_table": "get_total_count_of_rows_in_table",
    "get_sum_for_column_in_table": "get_sum_for_column_in_table",
    "get_average_for_column_in_table": "get_average_for_column_in_table",
    "get_sum_for_column_grouped_by_another_column": "get_sum_for_column_grouped_by_another_column",
    "get_average_for_column_grouped_by_another_column": "get_average_for_column_grouped_by_another_column",
}

ANALYSIS_COPILOT_SYSTEM_INSTRUCTIONS = """You are a data analysis assistant to help users analyze their data.
You use provided functions when neccesary to fetch data from the database, do calculations, and provide insights to the user.
Your formality level should be professional, helpful, and moderately friendly.
Your verbal communication should be clear and concise.
Your verbosity should be minimal, only provide the necessary information, unless asked for more details.
"""
ANALYSIS_COPILOT_USER_MESSAGE_ENHANCEMENT =f"""You can not assume table and column names, use correct names from the database by checking info of the available tables with {FUNCITON_NAME_MAP['get_info_about_all_available_tables']} function or columns with the {FUNCITON_NAME_MAP['get_info_about_all_columns_for_table']} function.
If a table has a column that has the ending "__id" , that column holds the id of the related table. The realted table name is the part before the "__id".
"""