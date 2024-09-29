from datetime import datetime
import db_ops.helpers as db_hlp

def generate_create_table_sql(table_name, columns):
    """
    Generate a CREATE TABLE IF NOT EXISTS SQL statement.

    Parameters:
    - table_name (str): The name of the table.
    - columns (list of tuples): A list where each tuple contains a column name and its data type.

    Returns:
    - str: The generated SQL query.
    """
    # Start the CREATE TABLE statement
    sql = f"CREATE TABLE IF NOT EXISTS `{table_name}` (\n"
    
    # Add each column name and its data type
    column_definitions = []
    for column_name, data_type in columns:
        column_definitions.append(f" `{column_name}` {data_type}")
    
    # Join the column definitions with commas and newlines
    sql += ",\n".join(column_definitions)
    
    # Close the SQL statement
    sql += "\n);"
    
    return sql, []

def validate_and_format_date(value, date_format):
    if value is None:
        return None
    
    try:
        parsed_date = datetime.strptime(value, date_format)

        # Return the date formatted as 'YYYY-MM-DD' (SQL standard format)
        return parsed_date.strftime('%Y-%m-%d')
    except ValueError:
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

            if column_format in db_hlp.ALLOWED_DATE_FORMATS:
                formatted_date = validate_and_format_date(value)
                if formatted_date is None:
                    raise ValueError(f"Invalid date format for column '{col}': {value}")
                row_values.append(formatted_date)
            else:
                # Handle generic values (treat all non-DATE fields as is)
                row_values.append(value)
            
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


if __name__ == "__main__":
    pass