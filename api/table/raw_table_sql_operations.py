from django.db import connection

# def create_raw_table(table_id, tenant_id, workspace_id):
#     try:
#         with connection.cursor() as cursor:
#             # Example SQL to add a table; adjust according to your needs
#             cursor.execute(
#                 "CREATE TABLE myapp_table_%s ("
#                 "id serial NOT NULL, "
#                 "data varchar(255), "
#                 "PRIMARY KEY (id))",
#                 [table_id]
#             )
#     except Exception as e:
#         # Log the exception if necessary
#         print(f"Error creating dynamic table: {e}")
#         # It's important to re-raise the exception to ensure it propagates
#         raise