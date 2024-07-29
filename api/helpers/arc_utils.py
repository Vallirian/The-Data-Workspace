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
def reorder_query(query):
    """
    Reorder the query to ensure that the column table is created first.

    1. Data definition language (DDL) statements (https://dev.mysql.com/doc/refman/8.4/en/implicit-commit.html)
        - have an implicit commit, which means that they are committed even if the transaction involves multiple statements.
        So, we run non-DDL statements first, then DDL statements to avoid committing the transaction before all statements are run.
    """
    ddl_statement_prefixes = ['ALTER', 'CREATE', 'DROP', 'INSTALL', 'RENAME', 'TRUNCATE', 'UNINSTALL']
    ddl_statements = []
    non_ddl_statements = []
    query_parts = query.split(';')
    for part in query_parts:
        if part.strip() == '':
            continue
        if any(part.strip().startswith(prefix) for prefix in ddl_statement_prefixes):
            ddl_statements.append(part)
        else:
            non_ddl_statements.append(part)
    final_qeury = ''
    for qry in non_ddl_statements + ddl_statements:
        final_qeury += qry + ';'
    final_qeury = final_qeury.strip()
    
    return final_qeury

if __name__ == '__main__':
    pass
