from . import helpers as hlp
from workbook.models import DataTableMeta, DataTableColumnMeta

class FormulaUserMessage:
    def __init__(self, user_message, datatable_meta_id, request) -> None:
        self.user_message = user_message
        self.request = request
        self.datatable_meta_id = datatable_meta_id
        self.final_message = ''
        self.role = 'user'
        self.table_information = None
        self.column_information = None

        self.resolve_dt_meta_information()

        assert isinstance(self.table_information, str), "Table information must be a string"
        assert len(self.table_information.strip()) > 0, "Table information must not be empty"
        assert isinstance(self.column_information, str), "Column information must be a string"
        assert len(self.column_information.strip()) > 0, "Column information must not be empty"
        assert isinstance(user_message, str), "User message must be a string"
        assert len(user_message) > 0, "User message must not be empty"       

        self.enhance_message()

    def enhance_message(self):
        self.final_message += f"The following is the table information: {self.table_information}\n"
        self.final_message += f"The following is the column information in the table: {self.column_information}\n"
        self.final_message += self.user_message

    def resolve_dt_meta_information(self):
        datatable_meta = DataTableMeta.objects.get(id=self.datatable_meta_id, user=self.request.user)
        assert datatable_meta, "Datatable meta not found"

        # Get the table and column information
        _table_information = f"""Table information:\n
        Table name: {datatable_meta.name}\n
        Table description: {datatable_meta.description}\n
        Table datasource: {datatable_meta.dataSource}\n
        Table extraction status: {datatable_meta.extractionStatus}\n
        Table extraction details: {datatable_meta.extractionDetails}\n"""
        self.table_information = _table_information

        datatable_column_meta = DataTableColumnMeta.objects.filter(dataTable=datatable_meta, user=self.request.user)
        assert datatable_column_meta, "Datatable column meta not found"

        # Get the column information
        _column_information = "Column information:\n"
        for column in datatable_column_meta:
            _column_information += f"""Column name: {column.name}\n
            Column description: {column.description}\n
            Column data type: {column.dtype}\n"""
        self.column_information = _column_information
