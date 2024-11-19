import re
import random
from services.interface import ArcSQL
from typing import Union
from datetime import datetime
import services.values as svc_vals

# random
def generate_random_name():
    """Generate a random name using an adjective and a noun."""

    try:
        adjective = random.choice(svc_vals.RANDOM_NAME_ADJECTIVES)
        noun = random.choice(svc_vals.RANDOM_NAME_NOUNS)
        return f"{adjective} {noun}"
    except Exception as e:
        return "Untitled Workbook"

# SQL
def dictfetchall(cursor):
    "Return all rows from a cursor as a list of dicts"

    columns = [col[0] for col in cursor.description]
    return [
        dict(zip(columns, row))
        for row in cursor.fetchall()
    ]

def validate_and_cast_value(value, data_type, data_format=None):
    if value is None or str(value).strip() == '':
        if data_type == 'date':
            # Return a consistent representation of an empty or null date
            return True, None  
        else:
            return True, value
    try:
        if data_type == 'string':
            return True, str(value)
        elif data_type == 'integer':
            return True, int(value)
        elif data_type == 'float':
            return True, float(value)
        elif data_type == 'date':
            return is_valid_date(date_str=value, date_format=data_format)
        else:
            return False, 'Invalid data type'
    except ValueError as e:
        return False, str(e)

def is_valid_date(date_str, date_format: str):
    if date_format not in svc_vals.ALLOWED_DATE_FORMATS:
        return False, f'Invalid date format: {date_format} for date {date_str}'
    
    try:
        # Try to parse the date string into a datetime object
        _python_date_format = date_format.replace('YYYY', '%Y').replace('MM', '%m').replace('DD', '%d')
        _python_dt = datetime.strptime(date_str, _python_date_format)
        _converted_dt = _python_dt.strftime('%Y-%m-%d')
        return True, _converted_dt
    except ValueError as e:
        return False, str(e)

# LLM
def extract_json_from_md(md: str) -> dict:
    import re
    import json

    '''
    Extracts JSON from a markdown string
    returns: 
        - (bool, str| dict): (True, dict) if successful, (False, error message) if not
    '''

    try:
        non_greedy_json_patetrn = r'```json\n(.*?)```'
        json_strings = re.findall(non_greedy_json_patetrn, md, re.DOTALL)

        if len(json_strings) != 1:
            return (False, f'Expected only one json string got {len(json_strings)}')
    
        return (True, json.loads(json_strings[0]))
    except Exception as e:
        return (False, f"Error parsing JSON {str(e)}")

# Interface
def clean_pydantic_errors(error_message: str):
    pattern = r"For further information visit https://errors\.pydantic\.dev[^\s]*"
    cleaned_text = re.sub(pattern, "", error_message)

    return cleaned_text

class ArcSQLUtils:
    def __init__(self, arc_sql: ArcSQL):
        self.arc_sql = arc_sql
        self.sql_query = None

    def construct_sql_query(self) -> Union[str, None]:
        """
        Constructs a complete SQL query from an ArcSQL model instance.
        
        Args:
            arc_sql (ArcSQL): An instance of the ArcSQL model containing CTEs and final SELECT query
            
        Returns:
            str: The complete SQL query with CTEs and final SELECT statement
            None: If the ArcSQL instance is invalid or contains errors
        """
        try:
            # Validate the ArcSQL instance status
            if not self.arc_sql.status.status:
                return False, f"ArcSQL instance is invalid"

            # Initialize the list to store SQL parts
            sql_parts = []
            
            # Process CTEs if they exist
            if self.arc_sql.cte_tables_in_order:
                # Start WITH clause for the first CTE
                first_cte = self.arc_sql.cte_tables_in_order[0]
                sql_parts.append(f"WITH \"{first_cte.name}\" AS (\n{first_cte.sql_as_string}\n)")
                
                # Add remaining CTEs
                for cte in self.arc_sql.cte_tables_in_order[1:]:
                    sql_parts.append(f",\n\"{cte.name}\" AS (\n    {cte.sql_as_string}\n)")
            
            # Add the final SELECT statement
            # Remove any leading/trailing whitespace and ensure proper spacing
            final_select = self.arc_sql.final_select_sql_as_string.strip()
            
            # If we have CTEs, add a newline before the final SELECT
            if sql_parts:
                sql_parts.append("\n")
            
            sql_parts.append(final_select)
            
            # Combine all parts
            final_sql = "".join(sql_parts)
            
            # Add semicolon at the end if not present
            if not final_sql.strip().endswith(';'):
                final_sql += ';'
            
            self.sql_query = final_sql
            return True, final_sql
            
        except Exception as e:
            return False, f"Error constructing SQL query: {str(e)}"
    
    def escape_percent_signs(self):
        # Use regex to match single % character not part of a group of consecutive % characters
        # '(?<!%)%(?!%)' - Match single % not preceded or followed by %
        self.sql_query = re.sub(r'(?<!%)%(?!%)', '%%', self.sql_query)
    
    def get_sql_query(self):
        try:
            sql_query_status, sql_query_value = self.construct_sql_query()
            if not sql_query_status:
                return False, sql_query_value
            self.escape_percent_signs()
            return True, self.sql_query
        except Exception as e:
            return False, str(e)
        

if __name__ == "__main__":
    pass