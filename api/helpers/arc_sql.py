from django.db import connection, transaction
from helpers import arc_vars as avars, arc_utils as autils


def execute_raw_query(tenant: str, queries: list[tuple[str, list]]) -> list[dict]:
    """
    Executes a raw query on the specified tenant schema.
    :param tenant: The schema name to use.
    :param queries: A list of tuples containing the query and the query parameters.
    :return: The result of the last query executed.
    """
    print('tenant', tenant)
    with transaction.atomic():
        with connection.cursor() as cursor:
            # Switch to the specified tenant schema
            cursor.execute(f'USE `{tenant}`;')

            # reorder query before executing
            reordered_queries = autils.reorder_query(queries)

            # Execute the query
            for query, params in reordered_queries:
                cursor.execute(query, params)

            # if not a query that returns data
            if not cursor.description:
                # connection.commit()
                return []
            
            rows = cursor.fetchall()
            column_names = [desc[0] for desc in cursor.description]
    
    # Combine column names with rows
    if len(rows) == 0:
        results = [{}]
        for col in column_names:
            # for cases where there are no rows returned but the caller wants to know the columns
            results[0][col] = None
    else:
        results = [dict(zip(column_names, row)) for row in rows]

    return results

def create_schema(tenant: str):
    """
    Creates a new schema for the specified tenant.
    :param tenant: The schema name to create.
    """
    with connection.cursor() as cursor:
        cursor.execute(f'CREATE SCHEMA `{tenant}`;')


        