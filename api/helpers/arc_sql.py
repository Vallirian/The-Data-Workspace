from django.db import connection, transaction
from helpers import arc_vars as avars, arc_utils as autils


def execute_raw_query(tenant: str, query: str):
    """
    Executes a raw query on the specified tenant schema.
    :param tenant: The schema name to use.
    :param query: The raw SQL query to execute.
    :return: The result of the query.
    """
    print('tenant', tenant)
    with transaction.atomic():
        with connection.cursor() as cursor:
            # Switch to the specified tenant schema
            cursor.execute(f'USE `{tenant}`;')

            # reorder query before executing
            query = autils.reorder_query(query)
            print('query that came in', query)
            query = connection.escape_string(query)
            print('query to exec', query)
            cursor.execute(query)
            rows = cursor.fetchall()
            if not cursor.description:
                # for queries that don't return anything
                connection.close()
                return []
            column_names = [desc[0] for desc in cursor.description]
    
    # Combine column names with rows
    if len(rows) == 0:
        results = [{}]
        for col in column_names:
            results[0][col] = None
    else:
        results = [dict(zip(column_names, row)) for row in rows]
    print('results from exec', results)

    connection.close()
    return results

def create_schema(tenant: str):
    """
    Creates a new schema for the specified tenant.
    :param tenant: The schema name to create.
    """
    with connection.cursor() as cursor:
        cursor.execute(f'CREATE SCHEMA `{tenant}`;')


        