from django.db import connection


def execute_raw_query(tenant: str, query: str):
    """
    Executes a raw query on the specified tenant schema.
    :param tenant: The schema name to use.
    :param query: The raw SQL query to execute.
    :return: The result of the query.
    """
    with connection.cursor() as cursor:
        # Switch to the specified tenant schema
        cursor.execute(f'USE `{tenant}`;')
        cursor.execute(query)
        rows = cursor.fetchall()
    return rows

def create_schema(tenant: str):
    """
    Creates a new schema for the specified tenant.
    :param tenant: The schema name to create.
    """
    with connection.cursor() as cursor:
        cursor.execute(f'CREATE SCHEMA `{tenant}`;')