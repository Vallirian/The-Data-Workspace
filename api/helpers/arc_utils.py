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

if __name__ == '__main__':
    pass
