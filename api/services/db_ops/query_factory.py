from datetime import datetime
from . import helpers as db_hlp

def generate_create_table_sql(table_name, columns):
    # Start the CREATE TABLE statement
    sql = f"CREATE TABLE IF NOT EXISTS `{table_name}` (\n"
    
    # Add each column name and its data type
    column_definitions = []
    print('columns to create sql with', columns)
    for column_name, data_type in columns:
        column_definitions.append(f" `{column_name}` {data_type}")
    
    # Join the column definitions with commas and newlines
    sql += ",\n".join(column_definitions)
    
    # Close the SQL statement
    sql += "\n);"
    
    return sql, []

def validate_and_format_date(value, date_format: str):
    if (value is None) or (value == ''):
        return None
    
    try:
        _python_date_format = date_format.replace('YYYY', '%Y').replace('MM', '%m').replace('DD', '%d')
        parsed_date = datetime.strptime(value, _python_date_format)

        # Return the date formatted as 'YYYY-MM-DD' (SQL standard format)
        return parsed_date.strftime('%Y-%m-%d')
    except ValueError as e:
        print('Invalid date format', value, str(e))
        raise ValueError(f"Invalid date format: {value}")
    
def generate_insert_data_sql(table_name, rows, column_formats: dict):
    if not rows:
        return None
    
    # Extract column names from the first row (keys) and wrap them in backticks for SQL safety
    raw_columns = rows[0].keys()
    columns = [f'`{col}`' for col in raw_columns]
    columns_sql = ', '.join(columns)
    
    # Prepare placeholders (%s) and the values list
    values_sql = []
    all_values = []  # This will hold the actual values to be inserted

    for row in rows:
        formatted_values = []
        row_values = []
        for col in raw_columns:
            value = row.get(col)
            column_format = column_formats.get(col) 
            print('value', value, 'column_format', column_format)
            if column_format in db_hlp.ALLOWED_DATE_FORMATS:
                formatted_date = validate_and_format_date(value, column_format)
                row_values.append(formatted_date)
                print('formatted_date', formatted_date)
            else:
                # Handle generic values (treat all non-DATE fields as is)
                row_values.append(value)
            print('row_values', row_values)
            # Append a placeholder for each value
            formatted_values.append('%s')

        # Add placeholders for the current row
        values_sql.append(f"({', '.join(formatted_values)})")
        all_values.extend(row_values)  # Collect actual values

    # Join all placeholders together with commas
    values_sql_str = ', '.join(values_sql)
    
    # Construct the full INSERT SQL statement using placeholders
    insert_sql = f"INSERT INTO `{table_name}` ({columns_sql}) VALUES {values_sql_str};"
    
    return insert_sql, all_values

def generate_delete_table_sql(table_name):
    return f"DROP TABLE IF EXISTS `{table_name}`;", []

def gen_get_table_meta_sql(table_id):
    return f"SELECT * FROM `{db_hlp.DATATABLE_META_DB_TABLE_NAME}` WHERE `id` = %s;", [table_id]

def gen_get_raw_data_sql(table_name, page, page_size):
    return f"SELECT * FROM `{table_name}` LIMIT %s OFFSET %s;", [page_size, page_size * (page - 1)]

def gen_get_raw_data_count_sql(table_name):
    return f"SELECT COUNT(*) as count FROM `{table_name}`;", []

if __name__ == "__main__":
    pass