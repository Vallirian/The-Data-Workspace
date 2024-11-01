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
        query = f"CREATE TABLE IF NOT EXISTS \"{self.table.name}\" ("
        for column in self.table.columns:
            query += f"\"{column.name}\" {svc_vals.DATA_TYPE_MAP[column.dtype]}, "
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
                    assert expected_column, f'Column \"{col_name}\" not found in the table'

                    _validation_status, _casted_value = validate_and_cast_value(value=col_val, data_type=expected_column.dtype, data_format=expected_column.format)
                    assert _validation_status, f'Error validating column {col_name} at Row {i+1}: {_casted_value}'
                    data[i][col_name] = _casted_value
                    
            # insert data
            columns = data[0].keys()
            placeholders = ', '.join(['%s'] * len(columns))
            column_names = ', '.join([f'\"{col}\"' for col in columns])
            
            _query = f"INSERT INTO \"{self.table.name}\" ({column_names}) VALUES ({placeholders})"
            _values = [[row.get(col) for col in columns] for row in data]

            _raw_exec = RawSQLExecution(sql=_query, inputs=_values, request=self.request)
            _raw_exec_status, _raw_exec_value = _raw_exec.execute(many=True)
            if not _raw_exec_status:
                return False, _raw_exec_value

            return True, 'Data extracted successfully'
        except Exception as e:
            return False, str(e)
        
    def delete_table(self):
        query = f"DROP TABLE IF EXISTS \"{self.table.name}\";"
        _raw_exec = RawSQLExecution(sql=query, inputs=[], request=self.request)
        _raw_exec_status, _raw_exec_value = _raw_exec.execute(fetch_results=False)
        if not _raw_exec_status:
            return False, _raw_exec_value
        return True, 'Table deleted successfully'
    
    def get_data(self, page_size: int, page_number: int):
        query = f"SELECT * FROM \"{self.table.name}\" LIMIT {page_size} OFFSET {page_size * (page_number - 1)};"
        _raw_exec = RawSQLExecution(sql=query, inputs=[], request=self.request)
        _raw_exec_status, _raw_exec_value = _raw_exec.execute(fetch_results=True)
        if not _raw_exec_status:
            return False, _raw_exec_value
        return True, _raw_exec_value
    
    def get_data_count(self):
        query = f"SELECT COUNT(*) as count FROM \"{self.table.name}\";"
        _raw_exec = RawSQLExecution(sql=query, inputs=[], request=self.request)
        _raw_exec_status, _raw_exec_value = _raw_exec.execute(fetch_results=True)
        if not _raw_exec_status:
            return False, _raw_exec_value
        return True, _raw_exec_value
        
class RawSQLExecution:
    def __init__(self, sql: str, inputs: list, request: HttpRequest) -> None:
        self.sql = sql
        self.inputs = inputs
        self.request = request

    def execute(self, many=False, fetch_results=False):
        user_schema = f"schema___{self.request.user.id}"

        # Ensure schema-switching and safe rollback
        try:
            with connection.cursor() as cursor:
                # Switch to the user-specific schema
                cursor.execute(f"SET search_path TO \"{user_schema}\"")

                if many:
                    try:
                        cursor.executemany(self.sql, self.inputs)
                        return True, 'Success'
                    except Exception as e:
                        return False, str(e)
                else:
                    try:
                        cursor.execute(self.sql, self.inputs)

                        if fetch_results:
                            result = dictfetchall(cursor)
                            return True, result
                        else:
                            return True, 'Success'

                    except Exception as e:
                        return False, str(e)
        finally:
            # Switch back to the default schema after operation
            with connection.cursor() as cursor:
                cursor.execute(f"SET search_path TO {svc_vals.DEFAULT_SCHEMA}")

class RawDataUtils:
        
    def get_data_table_meta(table_id: str) -> TypeDataTableMeta:
        query = f"""
        SELECT 
            dt.id, dt.name, dt.description, dt."dataSourceAdded", dt."dataSource", dt."extractionStatus", dt."extractionDetails",
            dtc.id as column_id, dtc.name as column_name, dtc.dtype, dtc.format, dtc.description as column_description, dtc."dataTable_id"
        FROM 
            {svc_vals.DATA_TABLE_META} dt
            LEFT JOIN {svc_vals.DATA_TABLE_COLUMN_META} dtc ON dt.id = dtc."dataTable_id"
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
        user_schema = f"\"schema___{self.request.user.id}\""
        query = f"SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = %s;"
        
        with connection.cursor() as cursor:
            cursor.execute(query, [user_schema])
            rows = dictfetchall(cursor)
            return True if rows else False

    def create_user_schema(self):
        user_schema = f"\"schema___{self.request.user.id}\""
        query = f"CREATE SCHEMA IF NOT EXISTS {user_schema};"
        
        with connection.cursor() as cursor:
            cursor.execute(query)
            return True, 'Success'
        
    def get_schema_data_size_mb(self):
        user_schema = f"schema___{self.request.user.id}"
        
        # PostgreSQL query to calculate the schema size in MB
        query = f"""
            SELECT
                ROUND(sum(pg_total_relation_size(pg_class.oid)) / (1024 * 1024), 3) AS size_mb
            FROM
                pg_class
            JOIN
                pg_namespace ON pg_namespace.oid = pg_class.relnamespace
            WHERE
                nspname = '{user_schema}';
        """

        with connection.cursor() as cursor:
            try:
                cursor.execute(query)
                rows = dictfetchall(cursor)
                # The result is returned as a text (with `MB` unit), so we need to strip it to return a float
                size_mb = rows[0]['size_mb'] if rows[0]['size_mb'] else 0
                print(size_mb)
                size_mb = float(size_mb)  # Convert size to float
                return True, size_mb
            except Exception as e:
                return False, str(e)
        
    def get_token_utilization(self, formula_id: str=None, add_from_backed_up_in_user_model: bool=False):
        if formula_id is None:
            query = f"SELECT \"inputTokensConsumed\", \"outputTokensConsumed\" FROM {svc_vals.FORMULA_MESSAGE} WHERE user_id = %s;"
            inputs = [str(self.request.user.id).replace('-', '')]
        else:
            query = f"SELECT \"inputTokensConsumed\", \"outputTokensConsumed\" FROM {svc_vals.FORMULA_MESSAGE} WHERE user_id = %s AND formula_id = %s;"
            inputs = [str(self.request.user.id).replace('-', ''), formula_id] # because formula_id is a CharField

        total_input_tokens_consumed = 0
        total_output_tokens_consumed = 0
        with connection.cursor() as cursor:
            try:
                cursor.execute(query, inputs)
                tokens_consumed = dictfetchall(cursor)

                input_token_utilization = 0
                output_token_utilization = 0
                for t in tokens_consumed:
                    input_token_utilization += t['inputTokensConsumed']
                    output_token_utilization += t['outputTokensConsumed']
                
                total_input_tokens_consumed += input_token_utilization
                total_output_tokens_consumed += output_token_utilization

                if add_from_backed_up_in_user_model:
                    # get tokens stored in user model when a workbook is deleted
                    query = f"SELECT \"inputTokensConsumedChatDeleted\", \"outputTokensConsumedChatDeleted\" FROM {svc_vals.ARC_USER} WHERE id = %s;"
                    inputs = [str(self.request.user.id).replace('-', '')]
                    cursor.execute(query, inputs)
                    tokens_consumed = dictfetchall(cursor)

                    for t in tokens_consumed:
                        total_input_tokens_consumed += t['inputTokensConsumedChatDeleted']
                        total_output_tokens_consumed += t['outputTokensConsumedChatDeleted']
                        
                return True, (total_input_tokens_consumed, total_output_tokens_consumed), "Success"
            except Exception as e:
                return False, (0, 0), str(e)
            
