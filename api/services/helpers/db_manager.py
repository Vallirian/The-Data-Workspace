from django.http import HttpRequest
from django.db import connection, DatabaseError
from values import DEFAULT_SCHEMA

class SQLExecutor:
    """
    Executes SQL queries on a PostgreSQL database.

    Attributes:
    sql -- the SQL query to execute
    inputs -- the inputs to the SQL query
    request -- the HTTP request object used to identify the schema for the user
    """
    def __init__(self, sql: str, inputs: list, request: HttpRequest) -> None:
        self.sql = sql
        self.inputs = inputs or []
        self.request = request

    def execute(self, many=False, fetch_results=False) -> list:
        """
        Executes the SQL query and returns the results.

        Keyword arguments:
        many -- whether the query returns multiple rows
        fetch_results -- whether to fetch the results of the query

        Returns:
        - if query is successful:
            - A list of rows from the query if fetch_results is True else [1]
        - if query is unsuccessful:
            - An empty list (which is falsy)
        """
        user_schema = f"schema___{self.request.user.id}"

        try:
            with connection.cursor() as cursor:
                # Switch to the user-specific schema
                cursor.execute("SET search_path TO %s", [user_schema])  # Parameterized query to prevent injection

                if many:
                    cursor.executemany(self.sql, self.inputs)
                else:
                    cursor.execute(self.sql, self.inputs)

                result = [1]
                if fetch_results:
                    result = self.dictfetchall(cursor)
                return result
        except DatabaseError as e:
            raise f"""Error occured when executing SQL query {str(e)}
            SQL Query: {self.sql}
            Inputs: {self.inputs}
            """

        finally:
            # Ensure schema resets to default
            try:
                with connection.cursor() as cursor:
                    cursor.execute("SET search_path TO %s", [DEFAULT_SCHEMA])
            except DatabaseError:
                pass  # Avoid masking original errors (in case of previous errors + this error, do not overwrite the previous error)

    def dictfetchall(self, cursor):
        """
        Returns all rows from a cursor as a list of dicts
        """
        columns = [col[0] for col in cursor.description]
        return [dict(zip(columns, row))for row in cursor.fetchall()]