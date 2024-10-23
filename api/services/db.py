import os
from django.http import HttpRequest
from django.db import connection
import services.values as svc_vals
from services.utils import dictfetchall, validate_and_cast_value
from services.interface import TypeColumnMeta, TypeDataTableMeta

class RawData:
    def __init__(self, request: HttpRequest, table_id: str) -> None:
        self.request = request
        self.table_id = table_id
        self.table: TypeDataTableMeta = RawDataUtils.get_data_table_meta(table_id)
        
    def create_table_if_not_exists(self):
        query = f"CREATE TABLE IF NOT EXISTS `{self.table.name}` ("
        for column in self.table.columns:
            query += f"`{column.name}` {svc_vals.DATA_TYPE_MAP[column.dtype]}, "
        query = query[:-2] + ");"

        _raw_exec = RawSQLExecution(sql=query, inputs=[], request=self.request)
        _raw_exec_status, _raw_exec_value = _raw_exec.execute()
        if not _raw_exec_status:
            return False, _raw_exec_value
    
    def validate_data(self, data: dict):
        if not data:
            return False, 'Data not found'
        
        # validate row and column count
        row_limit = int(os.environ.get('DATASET_ROW_LIMIT'))
        if len(data) > int(row_limit):
            return False, f'Maximum {row_limit} rows allowed, {len(data)} found'
        
        column_limit = int(os.environ.get('DATASET_COLUMN_LIMIT'))
        if len(data[0]) > int(column_limit):
            return False, f'Maximum {column_limit} columns allowed, {len(data[0])} found'
        
        return True, 'Success'
    
    def extract_data(self, data: dict):
        data_valid, message = self.validate_data(data)
        if not data_valid:
            return False, message
        self.create_table_if_not_exists()
        
        try:
            # validate rows            
            for i in range(len(data)):
                row = data[i]

                for col_name, col_val in row.items():
                    expected_column = next((column for column in self.table.columns if column.name == col_name), None)
                    assert expected_column, f'Column `{col_name}` not found in the table'

                    _validation_status, _casted_value = validate_and_cast_value(value=col_val, data_type=expected_column.dtype, data_format=expected_column.format)
                    assert _validation_status, f'Error validating column {col_name} at Row {i+1}: {_casted_value}'
                    data[i][col_name] = _casted_value
                    
            # insert data
            columns = data[0].keys()
            placeholders = ', '.join(['%s'] * len(columns))
            column_names = ', '.join([f'`{col}`' for col in columns])
            
            _query = f"INSERT INTO `{self.table.name}` ({column_names}) VALUES ({placeholders})"
            _values = [[row.get(col) for col in columns] for row in data]

            _raw_exec = RawSQLExecution(sql=_query, inputs=_values, request=self.request)
            _raw_exec_status, _raw_exec_value = _raw_exec.execute(many=True)
            if not _raw_exec_status:
                return False, _raw_exec_value

            return True, 'Data extracted successfully'
        except Exception as e:
            print(f'Error on extraction: {e}')
            return False, "Error extracting data"
        
    def delete_table(self):
        query = f"DROP TABLE IF EXISTS `{self.table.name}`;"
        _raw_exec = RawSQLExecution(sql=query, inputs=[], request=self.request)
        _raw_exec_status, _raw_exec_value = _raw_exec.execute()
        if not _raw_exec_status:
            return False, _raw_exec_value
        return True, 'Table deleted successfully'
    
    def get_data(self, page_size: int, page_number: int):
        query = f"SELECT * FROM `{self.table.name}` LIMIT {page_size} OFFSET {page_size * (page_number - 1)};"
        _raw_exec = RawSQLExecution(sql=query, inputs=[], request=self.request)
        _raw_exec_status, _raw_exec_value = _raw_exec.execute()
        if not _raw_exec_status:
            return False, _raw_exec_value
        return True, _raw_exec_value
    
    def get_data_count(self):
        query = f"SELECT COUNT(*) as count FROM `{self.table.name}`;"
        _raw_exec = RawSQLExecution(sql=query, inputs=[], request=self.request)
        _raw_exec_status, _raw_exec_value = _raw_exec.execute()
        if not _raw_exec_status:
            return False, _raw_exec_value
        return True, _raw_exec_value
        
class RawSQLExecution:
    def __init__(self, sql: str, inputs: list, request: HttpRequest) -> None:
        self.sql = sql
        self.inputs = inputs
        self.request = request

    def execute(self, many=False):
        user_schema = f"`schema___{self.request.user.id}`"
        # schema name inc;udes dashes, so we need to use backticks only when using without ''
        
        # Ensuring to switch back safely
        try:
            with connection.cursor() as cursor:
                # Use the user-specific database
                cursor.execute(f"USE {user_schema}")
            
                # Execute SQL on user's schema
                if many:
                    try:
                        cursor.executemany(self.sql, self.inputs)
                        return True, 'Success'
                    except Exception as e:
                        return False, str(e)
                else:
                    try:
                        cursor.execute(self.sql, self.inputs)
                        result = dictfetchall(cursor)
                        return True, result
                    except Exception as e:
                        return False, str(e)
        finally:
            # Always switch back to the default schema even if an error occurs
            with connection.cursor() as cursor:
                cursor.execute(f"USE `{svc_vals.DEFAULT_SCHEMA}`")

class RawDataUtils:
        
    def get_data_table_meta(table_id: str) -> TypeDataTableMeta:
        query = f"""
            SELECT 
                dt.id, dt.name, dt.description, dt.dataSourceAdded, dt.dataSource, dt.extractionStatus, dt.extractionDetails,
                dtc.id as column_id, dtc.name as column_name, dtc.dtype, dtc.format, dtc.description as column_description, dtc.dataTable_id
            FROM 
                `{svc_vals.DATA_TABLE_META}` dt
                LEFT JOIN `{svc_vals.DATA_TABLE_COLUMN_META}` dtc ON dt.id = dtc.dataTable_id
            WHERE 
                dt.id = %s
        """
        
        with connection.cursor() as cursor:
            cursor.execute(query, [table_id])
            rows = dictfetchall(cursor)
            
            if rows:
                return TypeDataTableMeta(
                    id=rows[0]['id'],
                    name=rows[0]['name'],
                    description=rows[0]['description'],
                    dataSourceAdded=rows[0]['dataSourceAdded'],
                    dataSource=rows[0]['dataSource'],
                    extractionStatus=rows[0]['extractionStatus'],
                    extractionDetails=rows[0]['extractionDetails'],
                    columns=[
                        TypeColumnMeta(
                            id=row['column_id'],
                            name=row['column_name'],
                            dtype=row['dtype'],
                            format=row['format'],
                            description=row['column_description'],
                            dataTable=row['dataTable_id']
                        )
                        for row in rows if row['column_id'] is not None
                    ]
                )
            
            return None 
        
class DataSegregation:
    def __init__(self, request: HttpRequest) -> None:
        self.request = request

    def schema_exists(self):
        user_schema = f"schema___{self.request.user.id}"
        query = f"SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = %s;"
        print(user_schema, query)
        
        with connection.cursor() as cursor:
            cursor.execute(query, [user_schema])
            rows = dictfetchall(cursor)
            print("here")
            return True if rows else False

    def create_user_schema(self):
        user_schema = f"`schema___{self.request.user.id}`"
        query = f"CREATE SCHEMA IF NOT EXISTS {user_schema};"
        print(user_schema, query)
        
        with connection.cursor() as cursor:
            cursor.execute(query)
            return True, 'Success'
        
    def get_schema_data_size_mb(self):
        user_schema = f"schema___{self.request.user.id}"
        query = f"""SELECT 
                    table_schema AS "Database", 
                    ROUND(SUM(data_length + index_length) / (1024 * 1024), 2) AS "size_mb"
                FROM 
                    information_schema.TABLES 
                WHERE 
                    table_schema = '{user_schema}'
                GROUP BY 
                    table_schema;
                """
        
        with connection.cursor() as cursor:
            try:
                cursor.execute(query)
                rows = dictfetchall(cursor)
                return True, rows[0]['size_mb'] if rows else 0
            except Exception as e:
                return False, str(e)
        
    def get_token_utilization(self):
        query = f"SELECT runDetails FROM {svc_vals.FORMULA_MESSAGE} WHERE user_id = %s;"
        with connection.cursor() as cursor:
            try:
                cursor.execute(query, [self.request.user])
                messages_runDetail = dictfetchall(cursor)

                input_token_utilization = 0
                output_token_utilization = 0
                for message in messages_runDetail:
                    input_token_utilization += message['usage']['prompt_tokens']
                    output_token_utilization += message['usage']['completion_tokens']

                return True, (input_token_utilization, output_token_utilization), "Success"
            except Exception as e:
                return False, (0, 0), str(e)