from services.interface import ArcSQL

from typing import Union

def construct_sql_query(arc_sql: ArcSQL) -> Union[str, None]:
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
        if not arc_sql.status.status:
            return None

        # Initialize the list to store SQL parts
        sql_parts = []
        
        # Process CTEs if they exist
        if arc_sql.cte_tables_in_order:
            # Start WITH clause for the first CTE
            first_cte = arc_sql.cte_tables_in_order[0]
            sql_parts.append(f"WITH {first_cte.name} AS (\n    {first_cte.sql_as_string}\n)")
            
            # Add remaining CTEs
            for cte in arc_sql.cte_tables_in_order[1:]:
                sql_parts.append(f",\n{cte.name} AS (\n    {cte.sql_as_string}\n)")
        
        # Add the final SELECT statement
        # Remove any leading/trailing whitespace and ensure proper spacing
        final_select = arc_sql.final_select_sql_as_string.strip()
        
        # If we have CTEs, add a newline before the final SELECT
        if sql_parts:
            sql_parts.append("\n")
        
        sql_parts.append(final_select)
        
        # Combine all parts
        final_sql = "".join(sql_parts)
        
        # Add semicolon at the end if not present
        if not final_sql.strip().endswith(';'):
            final_sql += ';'
            
        return final_sql
        
    except Exception as e:
        # Log the error if needed
        print(f"Error constructing SQL query: {str(e)}")
        return None