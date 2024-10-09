from services.pql import helpers as hlp
from services.pql import validation as vld
from services.db_ops import db as db
from abc import ABC, abstractmethod

class Operrator(ABC):
    def __init__(self, operator: str, columns: list, as_column: str) -> None:
        self.operator = operator
        self.columns = columns
        self.as_column = as_column

        self.is_row_operator = operator in hlp.ROW_OPERATORS

    def validate(self) -> bool:
        if not self.is_row_operator:
            assert len(self.columns) ==  1, f'Column count mismatch for operator {self.operator}, expected 1, got {len(self.columns)}'

        return True
    
    @abstractmethod
    def parse_to_sql(self) -> str:
        pass

class RowSum(Operrator):
    def __init__(self, operator: str, columns: list, as_column: str) -> None:
        super().__init__(operator, columns, as_column)
        
    def parse_to_sql(self) -> str:
        _query = f'''({' + '.join([f'`{col}`' for col in self.columns])}) AS `{self.as_column}`'''
        return _query
    
class RowAverage(Operrator):
    def __init__(self, operator: str, columns: list, as_column: str) -> None:
        super().__init__(operator, columns, as_column)
        
    def parse_to_sql(self) -> str:
        _query = f"""(({' + '.join([f'`{col}`' for col in self.columns])}) / {len(self.columns)}) AS `{self.as_column}`"""
        return _query
    
class RowMultiply(Operrator):
    def __init__(self, operator: str, columns: list, as_column: str) -> None:
        super().__init__(operator, columns, as_column)
        
    def parse_to_sql(self) -> str:
        _query = f'''({' * '.join([f'`{col}`' for col in self.columns])}) AS `{self.as_column}`'''
        return _query
    
class ColumnCount(Operrator):
    def __init__(self, operator: str, columns: list, as_column: str) -> None:
        super().__init__(operator, columns, as_column)
        
    def parse_to_sql(self) -> str:
        _query = f'''COUNT(`{self.columns[0]}`) AS `{self.as_column}`'''
        return _query
    
class ColumnAverage(Operrator):
    def __init__(self, operator: str, columns: list, as_column: str) -> None:
        super().__init__(operator, columns, as_column)
        
    def parse_to_sql(self) -> str:
        _query = f'''AVG(`{self.columns[0]}`) AS `{self.as_column}`'''
        return _query
    
class ColumnSum(Operrator):
    def __init__(self, operator: str, columns: list, as_column: str) -> None:
        super().__init__(operator, columns, as_column)
        
    def parse_to_sql(self) -> str:
        _query = f'''SUM(`{self.columns[0]}`) AS `{self.as_column}`'''
        return _query
    
class ColumnMin(Operrator):
    def __init__(self, operator: str, columns: list, as_column: str) -> None:
        super().__init__(operator, columns, as_column)
        
    def parse_to_sql(self) -> str:
        _query = f'''MIN(`{self.columns[0]}`) AS `{self.as_column}`'''
        return _query
    
class ColumnMax(Operrator):
    def __init__(self, operator: str, columns: list, as_column: str) -> None:
        super().__init__(operator, columns, as_column)
        
    def parse_to_sql(self) -> str:
        _query = f'''MAX(`{self.columns[0]}`) AS `{self.as_column}`'''
        return _query
    
class ColumnMode(Operrator):
    def __init__(self, operator: str, columns: list, as_column: str) -> None:
        super().__init__(operator, columns, as_column)
        
    def parse_to_sql(self) -> str:
        _query = f'''MODE(`{self.columns[0]}`) AS `{self.as_column}`'''
        return _query
    
class ColumnStandardDeviation(Operrator):
    def __init__(self, operator: str, columns: list, as_column: str) -> None:
        super().__init__(operator, columns, as_column)
        
    def parse_to_sql(self) -> str:
        _query = f'''STDDEV(`{self.columns[0]}`) AS `{self.as_column}`'''
        return _query
    
class ColumnConvertYear(Operrator):
    def __init__(self, operator: str, columns: list, as_column: str) -> None:
        super().__init__(operator, columns, as_column)
        
    def parse_to_sql(self) -> str:
        _query = f'''YEAR(`{self.columns[0]}`) AS `{self.as_column}`'''
        return _query
    
class ColumnConvertMonth(Operrator):
    def __init__(self, operator: str, columns: list, as_column: str) -> None:
        super().__init__(operator, columns, as_column)
        
    def parse_to_sql(self) -> str:
        _query = f'''MONTH(`{self.columns[0]}`) AS `{self.as_column}`'''
        return _query
    
class ColumnConvertDay(Operrator):
    def __init__(self, operator: str, columns: list, as_column: str) -> None:
        super().__init__(operator, columns, as_column)
        
    def parse_to_sql(self) -> str:
        _query = f'''DAY(`{self.columns[0]}`) AS `{self.as_column}`'''
        return _query
    
class ColumnConvertFloor(Operrator):
    def __init__(self, operator: str, columns: list, as_column: str) -> None:
        super().__init__(operator, columns, as_column)
        
    def parse_to_sql(self) -> str:
        _query = f'''FLOOR(`{self.columns[0]}`) AS `{self.as_column}`'''
        return _query
    
class ColumnConvertCeiling(Operrator):
    def __init__(self, operator: str, columns: list, as_column: str) -> None:
        super().__init__(operator, columns, as_column)
        
    def parse_to_sql(self) -> str:
        _query = f'''CEILING(`{self.columns[0]}`) AS `{self.as_column}`'''
        return _query
    
class ColumnConvertAbsolute(Operrator):
    def __init__(self, operator: str, columns: list, as_column: str) -> None:
        super().__init__(operator, columns, as_column)
        
    def parse_to_sql(self) -> str:
        _query = f'''ABS(`{self.columns[0]}`) AS `{self.as_column}`'''
        return _query
            

class FilterBlock:
    def __init__(self, pql_block: dict, input_latest_table: str) -> None:
        '''
        creates a Common Table Expression (CTE) for a filter block in SQL
        return:
            - CTE which can be appended to an SQL query as a string
        '''
        self.pql_block = pql_block
        self.input_latest_table = input_latest_table
        self.output_latest_table = hlp.create_latest_table_name()
        
        self.columns = []
        self.comparison_operator = None
        self.value = None

        self.extract_filter_block()
    
    def extract_filter_block(self) -> None:
        self.columns = self.pql_block['FILTER_BLOCK']['COLUMNS']
        self.comparison_operator = self.pql_block['FILTER_BLOCK']['COMPARISON_OPERATOR']
        self.value = self.pql_block['FILTER_BLOCK']['VALUE']

    def parse_to_sql(self) -> str:
        conditional_query = ''
        for column in self.columns:
            _parsed_value = f"'{self.value}'" if isinstance(self.value, str) else self.value
            conditional_query += f"""`{column}` {self.comparison_operator} {_parsed_value} AND """
           
        _query = f'''
            , `{self.output_latest_table}` AS (
                SELECT *
                FROM `{self.input_latest_table}`
                WHERE {conditional_query[:-5]}
            )
        '''

        return _query
    
class ScalarBlock:
    def __init__(self, pql_block: dict, input_latest_table: str) -> None:
        '''
        creates the final SQL query for a scalar block in SQL
        return:
            - SQL query as a string with a SELECT, FROM and (optional) WHERE clause
        '''
        self.pql_block = pql_block
        self.input_latest_table = input_latest_table

        self.operator = None
        self.columns = []
        self.as_column = None

        self.extract_scalar_block()
    
    def extract_scalar_block(self) -> None:
        self.operator = self.pql_block['SCALAR_BLOCK']['OPERATOR']
        self.columns = self.pql_block['SCALAR_BLOCK']['COLUMNS']
        self.as_column = self.pql_block['SCALAR_BLOCK']['AS']
    
    def parse_to_sql(self) -> str:
        operator_class = hlp.OPERATOR_CLASS_MAP[self.operator]
        operator_instance = globals()[operator_class](self.operator, self.columns, self.as_column)

        assert operator_instance.validate(), f'Validation error for operator {self.operator}'
        
        _query = f'''
            SELECT {operator_instance.parse_to_sql()}
            FROM `{self.input_latest_table}`;
        '''
            

        return _query
    
class PQLTranslator:
    def __init__(self, pql: dict) -> None:
        self.pql = pql
        self.errors = []
        self.input_latest_table = hlp.create_latest_table_name()
        self.translated_pql = ''
    
    def translate(self) -> str:
        self._validate_pql()
        self._translate_pql()
        return self.translated_pql
    
    def _validate_pql(self) -> None:
        validator = vld.PQLValidtor(self.pql)
        if not validator.validate():
            self.errors = validator.errors
    
    def _translate_pql(self) -> None:
        assert not self.errors, f'PQL validation error: {self.errors}'
        
        _blocks = self.pql['BLOCKS']
        _ctes = []

        # create the initial latest table
        self.translated_pql = f"WITH `{self.input_latest_table}` AS (\nSELECT * FROM `{self.pql['TABLE']}`\n)"

        # parse blocks
        for block in _blocks:
            if list(block.keys())[0] != 'SCALAR_BLOCK':
                if list(block.keys())[0] == 'FILTER_BLOCK':
                    filter_block = FilterBlock(pql_block=block, input_latest_table=self.input_latest_table)
                    self.input_latest_table = filter_block.output_latest_table
                    _ctes.append(filter_block.parse_to_sql())

                self.translated_pql += ', '.join(_ctes)

            else:
                if list(block.keys())[0] == 'SCALAR_BLOCK':
                    scalar_block = ScalarBlock(pql_block=block, input_latest_table=self.input_latest_table)
                    self.translated_pql += scalar_block.parse_to_sql()


        