from helpers import arc_vars as avars

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
    if operation not in ['rate_of_change']:
        return f"Invalid operation '{operation}'."
    
    if period and period not in avars.TIME_SERIES_PERIODS:
        return f"Invalid period '{period}'"
    
    return None