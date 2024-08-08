from helpers import arc_vars as avars

# ---------- database ---------- #
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

# ---------- function calling ---------- #
def validate_input_func_calling_descriptive_analytics(tenant_id:str, table_name:str, filter:dict=None, group:dict=None, column:str=None, operation:str=None):
    if not table_name:
        return 'table name is required'
    if not tenant_id:
        return 'tenant id is required'
    if not column:
        return 'Column name is required'
    if not operation:
        return 'Operation is required'
    if operation not in ['mean', 'median', 'mode', 'sum', 'count', 'range', 'frequency_distribution', 'relative_frequency_distribution']:
        return f"Invalid operation '{operation}'."
    
    if filter and not (filter.get('column') or not filter.get('condition') or not filter.get('value')):
        return 'Filter is invalid, requires column, condition, and value'
    if filter and (filter.get('condition') not in avars.STRING_COMPARISON_OPERATORS + avars.NUMERIC_COMPARISON_OPERATORS):
        return f"Invalid filter condition '{filter.get('condition')}'"
    if group and not (group.get('column') or not group.get('aggregation')):
        return 'Group is invalid, requires column and aggregation'
    if group and group.get('aggregation') not in avars.GROUP_BY_AGGREGATORS:
        return f"Invalid group aggregation '{group.get('aggregation')}'"
    
    return None

def validate_input_func_calling_proportion_analytics(tenant_id:str, table_name:str, column:str, value:str, period:str=None, operation:str=None):
    if not table_name:
        return 'table name is required'
    if not tenant_id:
        return 'tenant id is required'
    if not column:
        return 'Column name is required'
    if not value:
        return 'Value is required'
    if not operation:
        return 'Operation is required'
    if operation not in ['percentage']:
        return f"Invalid operation '{operation}'."
    
    if period and period not in avars.TIME_SERIES_PERIODS:
        return f"Invalid period '{period}'"
    
    return None

def validate_input_func_calling_time_series_analytics(tenant_id:str, table_name:str, date_column:str, period:str, operation:str=None):
    if not table_name:
        return 'table name is required'
    if not tenant_id:
        return 'tenant id is required'
    if not date_column:
        return 'Date column name is required'
    if not period:
        return 'Period is required'
    if not operation:
        return 'Operation is required'
    if operation not in ['average_rate_of_change']:
        return f"Invalid operation '{operation}'."
    
    if period and period not in avars.TIME_SERIES_PERIODS:
        return f"Invalid period '{period}'"
    
    return None

def validate_input_func_create_table(tenant_id: str, table_name: str, column_names: list[str], column_datatypes: list[str]):
    if not table_name:
        return 'Table name is required'
    if not tenant_id:
        return 'Tenant ID is required'
    
    table_name_valid, table_name_validation_error = validate_object_name(table_name)
    if not table_name_valid:
        return table_name_validation_error
    
    # validate columns
    if not column_names:
        return 'Column names are required'
    if not column_datatypes:
        return 'Column datatypes are required'
    if len(column_names) != len(column_datatypes):
        return 'Column names and datatypes must be of the same length'
    if len(column_names) != len(set(column_names)):
        return 'Column names must be unique'
    
    # validate column names
    for column_name in column_names:
        column_name_valid, column_name_validation_error = validate_object_name(column_name)
        if not column_name_valid:
            return column_name_validation_error
        
    # validate column datatypes
    for column_datatype in column_datatypes:
        if column_datatype not in avars.SUPPORTED_COLUMN_DATATYPES:
            return f"Unsupported column datatype '{column_datatype}'"
    
    return None