from . import helpers as hlp

class AnalysisUserMessage:
    def __init__(self, user_message, table_information, column_information) -> None:
        self.user_message = user_message
        self.final_message = ''
        self.role = 'user'
        self.table_information = table_information
        self.column_information = column_information

        assert isinstance(table_information, str), "Table information must be a string"
        assert len(table_information.strip()) > 0, "Table information must not be empty"
        assert isinstance(column_information, str), "Column information must be a string"
        assert len(column_information.strip()) > 0, "Column information must not be empty"
        assert isinstance(user_message, str), "User message must be a string"
        assert len(user_message) > 0, "User message must not be empty"       

        self.enhance_message()

    def enhance_message(self):
        self.final_message = hlp.ANALYSIS_MESSAGE_ENHANCEMENT_TEXT 
        self.final_message += f"The following is the table information: {self.table_information}\n"
        self.final_message += f"The following is the column information in the table: {self.column_information}\n"
        self.final_message += self.user_message
