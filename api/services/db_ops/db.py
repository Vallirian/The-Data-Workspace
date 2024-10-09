from django.http import HttpRequest
from django.db import connection
from . import helpers as db_hlp
from . import query_factory as qf

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
        _query, _inputs = qf.gen_get_table_meta_sql(self.table_id)

        with connection.cursor() as cursor:
            cursor.execute(_query, _inputs)
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
        print('fetched table', self.table.id)

    def __str__(self) -> str:
        return self.table.name

class RawDataExtraction:
    def __init__(self, request: HttpRequest, workbook_id: str, table_id: str) -> None:
        self.request = request
        self.workbook_id = workbook_id
        self.table_id = table_id
        self.table = DataTableMeta(table_id)
        self._raw_data_table_name = f'table___{self.table_id}'
        self.table.fetch()
       

    def create_table_if_not_exists(self):
        _columns = []
        for column in self.table.columns:
            print('column', column)
            _columns.append((column.name, db_hlp.DATA_TYPE_MAP[column.dtype]))
        print('columns', _columns)

        _query, _inputs = qf.generate_create_table_sql(self._raw_data_table_name, _columns)
        print('create table query', _query, _inputs)
        with connection.cursor() as cursor:
            cursor.execute(_query, _inputs)

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
        
        column_names = []
        for column in self.table.columns:
            if column.dtype not in db_hlp.DATA_TYPE_MAP:
                return False, 'Invalid data type'
            
            if column.name in db_hlp.INVALID_CHARACTERS_IN_COLUMN_NAME:
                return False, 'Invalid column name'
            
            if column.name in column_names:
                return False, 'Duplicate column name found'
            
            column_names.append(column.name)

        return True, 'Success'

    def extract_data(self, etype: str, data: dict):
        meta_valid, message = self.validate_meta()
        if not meta_valid:
            return False, message

        # validate type
        if etype.lower() not in [_.lower() for _ in db_hlp.DATA_EXTRACTION_TYPES]:
            return False, 'Invalid extraction type'
        
        # validate path
        if not data:
            return False, 'Data not found'
        
        print('meta data validated', data)
        if etype.lower() == 'csv':
            try:
                # validate rows
                if not data:
                    return False, 'No data found'
                
                for i in range(len(data)):
                    row = data[i]
                    for column, value in row.items():
                        expected_column = self.table.get_column_by_name(column)
                        if not expected_column:
                            return False, f'Column `{column}`not found in the table'
                        _validation_result, _validation_message = db_hlp.validate_value(value=value, data_type=expected_column.dtype, data_format=expected_column.format)
                        if not _validation_result:
                            return False, f'Error validting row {i+1}: {_validation_message}'
                        
                # add data to the table
                self.create_table_if_not_exists()
                print('table created')

                # insert data
                column_formats = {column.name: column.format for column in self.table.columns}
                print('column formats', column_formats)
                _query, _inputs = qf.generate_insert_data_sql(f'table___{self.table_id}', data, column_formats)
                with connection.cursor() as cursor:
                    cursor.execute(_query, _inputs)

                return True, 'Data extracted successfully'
            except Exception as e:
                print(f'Error on extraction: {e}')
                return False, "Error extracting data"
        else:
            return False, 'Invalid extraction type'
        
    def delete_table(self):
        _query, _inputs = qf.generate_delete_table_sql(self._raw_data_table_name)

        try:
            with connection.cursor() as cursor:
                cursor.execute(_query, _inputs)
                
            return True, 'Success'
        except Exception as e:
            print(f'Error on table deletion: {e}')
            return False, str(e)
        
class TranslatedPQLExecution:
    def __init__(self, translated_sql: str) -> None:
        self.translated_sql = translated_sql

    def execute(self):
        try:
            with connection.cursor() as cursor:
                cursor.execute(self.translated_sql)
                result = db_hlp.dictfetchall(cursor)
                return True, result
        except Exception as e:
            print(f'Error on execution: {e}')
            return False, str(e)       