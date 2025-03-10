import os
from django.http import HttpRequest
from services.helpers.db_manager import SQLExecutor
from services.helpers.interfaces import MetaData

class Preprocessor:
    def __init__(self, request: HttpRequest, metadata: MetaData) -> None:
        self.request = request
        self.metadata = metadata

    def import_data(self,  data: list['dict']) -> dict:
        """
        Import data into the database.

        Imports all columns as strings by default, this is because we have later stages
        where we further process the data and convert it to the correct data types.

        Drops the table if it exists and creates a new table with the data.

        Returns:
        - the number of rows imported
        """
        # enforce data limits
        row_limit = int(os.environ.get('DATASET_ROW_LIMIT'))
        column_limit = int(os.environ.get('DATASET_COLUMN_LIMIT'))
        assert len(data) <= row_limit, f"Error occured when impoting data: Maximum {row_limit} rows allowed, {len(data)} found"
        assert len(self.metadata.columns) <= column_limit, f"Error occured when impoting data: Maximum {column_limit} columns allowed, {len(self.metadata.columns)} found"
        
        SQLExecutor(sql=f'DROP TABLE IF EXISTS "{self.metadata.tableName}"', inputs=[], request=self.request).execute()

        columns_definition = ', '.join([f'"{column}" VARCHAR' for column in self.metadata.columns])
        SQLExecutor(sql=f'CREATE TABLE "{self.metadata.tableName}" ({columns_definition})', inputs=[], request=self.request).execute()

        # Insert data into the table
        columns = ', '.join([f'"{column}"' for column in self.metadata.columns])
        placeholders = ', '.join(['%s' for _ in self.metadata.columns])
        SQLExecutor(
            sql=f'INSERT INTO "{self.metadata.tableName}" ({columns}) VALUES ({placeholders})', 
            inputs=[[row.get(column) for column in self.metadata.columns] for row in data],
            request=self.request
        ).execute(many=True)

    def get_data(self) -> list[dict]:
        """
        Retrieve data from the database.

        Returns:
        - a list of dictionaries representing the rows in the table
        """
        result = SQLExecutor(
            sql=f'SELECT * FROM "{self.metadata.tableName}"',
            inputs=[],
            request=self.request
        ).execute(fetch_results=True)
        
        return result



