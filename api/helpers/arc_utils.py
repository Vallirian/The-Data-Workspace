import uuid
from helpers import arc_vars as avars

def custom_uuid():
    return str(uuid.uuid4()).replace('-', '')

def rp_get_right_table_name(right_table_id):
    return f"{right_table_id}_id"

# ----- Validtors -----
def validate_object_name(object_name: str):
    """
    Validate object name. Object names are names of tables, columns, etc.

    Args:
        object_name (str): Object name to validate.

    Returns:
        bool: True if object name is valid, False otherwise.
        str: Error message if object name
    """
    not_allowed = avars.NOT_ALLOWED_OBJECT_NAMES
    if not object_name:
        return False, 'Object name cannot be empty'

    for na in not_allowed:
        if na in object_name:
            return False, f'Object name cannot contain "{na}"'

    return True, None

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

if __name__ == '__main__':
    pass
