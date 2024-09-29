from django.http import HttpRequest
from django.db import connection
import csv

import db_ops.helpers as db_hlp
import db_ops.query_factory as qf

class TypColumnMeta:
    def __init__(self) -> None:
        self.id = None
        self.name = None
        self.dtype = None
        self.format = None
        self.description = None
        self.dataTable = None

    def __str__(self) -> str:
        return f'{self.name} {self.dtype}'
    
class TypDataTableMeta:
    def __init__(self) -> None:
        self.id = None
        self.name = None
        self.description = None
        self.dataSourceAdded = None
        self.dataSource = None
        self.extractionStatus = None
        self.extractionDetails = None
        self.columns = []

    def __str__(self) -> str:
        return self.name
    
class DataTableMeta:
    def __init__(self, table_id: str) -> None:
        self.table_id = table_id
        self.table = TypDataTableMeta()
        self.columns = []

    def get_column_meta(self):
        query = """
            SELECT * FROM datatable_datatablecolumnmeta WHERE dataTable_id = %s
        """

        with connection.cursor() as cursor:
            cursor.execute(query, [self.table_id])
            result = db_hlp.dictfetchall(cursor)

        for row in result:
            column = TypColumnMeta()
            column.id = row['id']
            column.name = row['name']
            column.dtype = row['dtype']
            column.format = row['format']
            column.description = row['description']
            column.dataTable = row['dataTable_id']
            self.columns.append(column)

    def get_table_meta(self):
        query = """
            SELECT * FROM datatable_datatablemeta WHERE id = %s
        """

        with connection.cursor() as cursor:
            cursor.execute(query, [self.table_id])
            result = db_hlp.dictfetchall(cursor)

        for row in result:
            self.table.id = row['id']
            self.table.name = row['name']
            self.table.description = row['description']
            self.table.dataSourceAdded = row['dataSourceAdded']
            self.table.dataSource = row['dataSource']
            self.table.extractionStatus = row['extractionStatus']
            self.table.extractionDetails = row['extractionDetails']

    def get_column_by_name(self, name: str):
        for column in self.columns:
            if column.name == name:
                return column
        return None

    def fetch(self):
        self.get_table_meta()
        self.get_column_meta()

    def __str__(self) -> str:
        return self.table.name


    
class RawDataExtraction:
    def __init__(self, request: HttpRequest, workbook_id: str, table_id: str) -> None:
        self.request = request
        self.workbook_id = workbook_id
        self.table_id = table_id
        self.table = DataTableMeta(table_id)
        self.table.fetch()

    def create_table_if_not_exists(self):
        _table_name = f'table___{self.table_id}'
        _columns = []
        for column in self.table.columns:
            _columns.append(({column.name}, db_hlp.DATA_TYPE_MAP[{column.dtype}]))

        query = qf.generate_create_table_sql(_table_name, _columns)
        with connection.cursor() as cursor:
            cursor.execute(query)

    def validate_meta(self):
        # validate table
        if not self.table.table.id:
            return False, 'Table not found'
        
        if self.table.table.name in db_hlp.INVALID_CHARACTERS_IN_TABLE_NAME:
            return False, 'Invalid table name'
        
        # validate columns
        if not self.table.columns:
            return False, 'No columns found'
        
        if len(self.table.columns) > db_hlp.MAX_COLUMNS:
            return False, f'Maximum {db_hlp.MAX_COLUMNS} columns allowed, {len(self.table.columns)} found'
        
        column_names = set()
        for column in self.table.columns:
            if column.dtype not in db_hlp.DATA_TYPE_MAP:
                return False, 'Invalid data type'
            
            if column.name in db_hlp.INVALID_CHARACTERS_IN_COLUMN_NAME:
                return False, 'Invalid column name'
            
            if column.name in column_names:
                return False, 'Duplicate column name found'
            column_names.add(column.name)      

        return True, 'Success'

    def extract_data(self, etype: str, file_path: str):
        """
        Extract data from the raw data
        :param 
            - etype: str, extraction type
            - file_path: str, path to the file where django has saved the raw data for temporary backup

        return: 
            - bool, str of (True, 'Success') or (False, 'Error message')
        """
        meta_valid, message = self.validate_meta()
        if not meta_valid:
            return False, message

        # validate type
        if etype not in db_hlp.DATA_EXTRACTION_TYPES:
            return False, 'Invalid extraction type'
        
        # validate path
        if not file_path:
            return False, 'Invalid file path'
        
        if etype == 'csv':
            try:
                with open(file_path, 'r') as f:
                    data = csv.DictReader(f)

                    # validate rows
                    if not data:
                        return False, 'No data found in the file'
                    
                    for i in range(len(data)):
                        row = data[i]
                        for column, value in row.items():
                            expected_column = self.table.get_column_by_name(column)
                            if not expected_column:
                                return False, f'Column `{column}`not found in the table'
                            
                            if not db_hlp.validate_value(value=value, data_type=expected_column.dtype, data_format=expected_column.format):
                                return False, f'Invalid value found in row {i+1} for column `{column}`'
                            
                    # add data to the table
                    self.create_table_if_not_exists()

                    # insert data
                    column_formats = {column.name: column.format for column in self.table.columns}
                    query = qf.generate_insert_data_sql(f'table___{self.table_id}', data, column_formats)
                    with connection.cursor() as cursor:
                        cursor.execute(query)

                    return True, 'Success'
            except Exception as e:
                return False, str(e)
