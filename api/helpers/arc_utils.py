from datetime import datetime
from decimal import Decimal
import uuid
import pandas as pd
from helpers import arc_vars as avars

def custom_uuid():
    # UUID4 without dashes to be used as a primary to accommodate MySQL without quotes
    return str(uuid.uuid4()).replace('-', '')

# ----- Database -----
def reorder_query(queries: list[tuple[str, str]]) -> list[tuple[str, str]]:
    """
    Reorder the query to ensure that the column table is created first.

    1. Data definition language (DDL) statements (https://dev.mysql.com/doc/refman/8.4/en/implicit-commit.html)
        - have an implicit commit, which means that they are committed even if the transaction involves multiple statements.
        So, we run non-DDL statements first, then DDL statements to avoid committing the transaction before all statements are run.

    Args:
        queries (list[tuple[str, str]]): List of queries to reorder. Each query is a tuple of the query and the query parameters.

    Returns:
        list[tuple[str, str]]: Reordered queries. Each query is a tuple of the query and the query parameters.
    """
    ddl_statement_prefixes = ['ALTER', 'CREATE', 'DROP', 'INSTALL', 'RENAME', 'TRUNCATE', 'UNINSTALL']
    ddl_queries = []
    non_ddl_queries = []

    for query in queries:
        part = query[0]
        if part.strip() == '':
            continue
        if any(part.strip().startswith(prefix) for prefix in ddl_statement_prefixes):
            ddl_queries.append(query)
        else:
            non_ddl_queries.append(query)

    return non_ddl_queries + ddl_queries

def get_pd_df_from_query_result(data: list['dict']) -> 'pd.DataFrame':
    """
    Convert the query result to a pandas DataFrame.

    Args:
        data (list[dict]): Query result.

    Returns:
        pd.DataFrame: Pandas DataFrame.
    """
    # Convert Decimal to float before creating the DataFrame because pandas does not describe Decimal.
    for entry in data:
        for key, value in entry.items():
            if isinstance(value, Decimal):
                entry[key] = float(value)

    df = pd.DataFrame(data)
    return df

# ----- AI -----
def cast_datatype_to_python(data: list[dict]) -> list[dict]:
    def convert_value(value):
        """Helper function to convert individual values."""
        if isinstance(value, datetime):
            return value.strftime('%Y-%m-%d %H:%M:%S')
        elif isinstance(value, Decimal):
            return float(value)
        elif isinstance(value, pd.Timestamp):
            return value.strftime('%Y-%m-%d %H:%M:%S')
        return value

    def recursive_convert(input_item):
        """Recursively convert data types in a dictionary or list."""
        if isinstance(input_item, dict):
            return {k: recursive_convert(v) for k, v in input_item.items()}
        elif isinstance(input_item, list):
            return [recursive_convert(element) for element in input_item]
        else:
            return convert_value(input_item)

    converted_data = [recursive_convert(item) for item in data]
    return converted_data

def get_function_declaration(function_names: list['str']) -> dict:
    """
    Get the function declaration from the function name that is compatible with Gemini FunctionCallingConfig
    """
    function_config = {
        "function_declarations": []
    }
    for function_declaration in avars.FUNCTION_DECLARATIONS["function_declarations"]:
        if function_declaration["name"] in function_names:
            function_config["function_declarations"].append(function_declaration)
    
    return function_config


if __name__ == '__main__':
    pass
