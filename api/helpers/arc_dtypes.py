from datetime import datetime
from helpers import arc_vars as avars, arc_statements as astmts, arc_sql as asql, arc_validate as aval

# ----- Date and Time -----
def get_current_datetime():
    return datetime.now().strftime(avars.COMMON_DATETIME_FORMAT)

def parse_datetime_from_str(date_str):
    try:
        return datetime.strptime(date_str, avars.COMMON_DATETIME_FORMAT)
    except ValueError:
        date_time_obj = datetime.strptime(date_str, avars.COMMON_DATE_FORMAT)
        date_time_obj = date_time_obj.replace(hour=0, minute=0, second=0)

        print('in date conversion', date_time_obj, type(date_time_obj))

        return date_time_obj


# ----- AI API -----
def convert_string_to_col_dtype(tenant_id: str, table_name: str, column_name: str, value: str):
    """
    Convert the string to the column data type.

    Args:
        tenant_id (str): Tenant ID.
        table_name (str): Table name.
        column_name (str): Column name.
        value (str): Value to convert.

    Returns:
        Any: Converted value.
    """
    try:
        response_data = asql.execute_raw_query(tenant=tenant_id, queries=astmts.get_column_table_by_column_name_query(table_name=table_name, column_name=column_name))
        column_dtype = response_data[0]['dataType']

        print('in dtype conversion', column_dtype, value)

        if column_dtype == 'datetime':
            return parse_datetime_from_str(value)
        elif column_dtype == 'number':
            return float(value)
        elif column_dtype == 'boolean':
            return value.lower() == 'true' or value == '1'
        elif column_dtype == 'string':
            return str(value)
        

    except Exception as e:
        return f"Error: {str(e)}"