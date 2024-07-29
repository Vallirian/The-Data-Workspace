from django.db import connection, transaction
import helpers.arc_vars as avars


def execute_raw_query(tenant: str, query: str):
    """
    Executes a raw query on the specified tenant schema.
    :param tenant: The schema name to use.
    :param query: The raw SQL query to execute.
    :return: The result of the query.
    """
    with transaction.atomic():
        with connection.cursor() as cursor:
            # Switch to the specified tenant schema
            cursor.execute(f'USE `{tenant}`;')
            cursor.execute(query)
            rows = cursor.fetchall()
            if not rows:
                # for queries that don't return anything
                return []
            column_names = [desc[0] for desc in cursor.description]
    
    # Combine column names with rows
    results = [dict(zip(column_names, row)) for row in rows]

    connection.close()
    return results

def create_schema(tenant: str):
    """
    Creates a new schema for the specified tenant.
    :param tenant: The schema name to create.
    """
    with connection.cursor() as cursor:
        cursor.execute(f'CREATE SCHEMA `{tenant}`;')


        