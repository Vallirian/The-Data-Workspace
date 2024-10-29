import os
from openai import OpenAI
from datetime import datetime
from services.interface import AgentRunResponse, ArcSQL
from services.utils import ArcSQLUtils, clean_pydantic_errors
from services.db import RawSQLExecution
from workbook.models import DataTableMeta, DataTableColumnMeta
import services.values as svc_vals

class OpenAIAnalysisAgent:
    def __init__(self, user_message: str=None, chat_id: str=None, thread_id: str=None, dt_meta_id: str=None, request=None) -> None:
        self.run_response = AgentRunResponse()
        self.thread = None
        self.chat_id = chat_id
        self.thread_id = thread_id
        self.last_error = None

        self.dt_meta_id = dt_meta_id
        self.request = request

        self.current_user_message = user_message
        self.current_agent_response = None

        self.max_retries = int(os.getenv('OPEN_AI_MAX_RETRIES', 3))

        assert chat_id, "Chat ID must be provided"

        # openai
        self.client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        self.agent = self.client.beta.assistants.retrieve(os.getenv('OPEN_AI_ANALYSIS_CHAT_ASSISTANT_ID'))

        assert self.agent, "Agent not found"

    def start_new_thread(self) -> None:
        while self.run_response.retries <= self.max_retries:
            try:
                self.thread = self.client.beta.threads.create()
                self.thread_id = self.thread.id
                self.run_response.retries = 0 # reset retries
                return True, self.thread_id
            except Exception as e:
                self.run_response.retries += 1
                self.run_response.message = f"Failed to start new thread: {str(e)}"
                continue
        return False, self.run_response.message
        
    def send_message(self) -> str:
        assert self.current_user_message is not None, "User message not found"
        
        # continue the thread
        if (self.thread is None) and (self.chat_id is not None):
            self.thread = self.client.beta.threads.retrieve(thread_id=self.thread_id)

        _temp_user_message = FormulaUserMessage(user_message=self.current_user_message, datatable_meta_id=self.dt_meta_id, request=self.request)
        self.current_user_message = self.client.beta.threads.messages.create(
            thread_id=self.thread.id,
            role=_temp_user_message.role,
            content=_temp_user_message.final_message
        )

        while self.run_response.retries <= self.max_retries:
            print(os.getenv('OPEN_AI_MODEL'))
            _temp_run = self.client.beta.threads.runs.create_and_poll(
                model=os.getenv('OPEN_AI_MODEL'), # 'gpt-4o-2024-08-06',
                thread_id=self.thread.id,
                assistant_id=self.agent.id,
                instructions=svc_vals.ANALYSIS_AGENT_INSTRUCTION,
                response_format={
                        "type": "json_schema",
                        "json_schema": {
                            "name": "ArcSQL",
                            "description": "ArcSQL",
                            "schema": ArcSQL.model_json_schema(),
                            "strict": True
                        }
                }
            )

            self.run_response.input_tokens_consumed = _temp_run.usage.prompt_tokens
            self.run_response.output_tokens_consumed = _temp_run.usage.completion_tokens

            # increment retries here because we continue in the loops
            self.run_response.retries += 1
            
            if _temp_run.status != 'completed':
                # we check failed and retry to keep unfailed runs directly under the while loop so that our continue statements work
                continue

            self.current_agent_response = self.client.beta.threads.messages.list(thread_id=self.thread.id).data[0].content[0].text.value
            print(self.current_agent_response)

            # validate ArcSQL
            arc_sql_validation_error = None
            try:
                _temp_arc_sql = ArcSQL.model_validate_json(self.current_agent_response)
                self.run_response.arc_sql = _temp_arc_sql
            except Exception as e:
                arc_sql_validation_error = clean_pydantic_errors(str(e))
                pass
            print('arc_sql_validation_error', arc_sql_validation_error)
            if arc_sql_validation_error:
                self.last_error = str(arc_sql_validation_error)
                __temp_error_message = f"ArcSQL validation failed\n error: {arc_sql_validation_error}"
                self.client.beta.threads.messages.create(
                    thread_id=self.thread.id,
                    role="user",
                    content=__temp_error_message
                )
                continue

            # handle cases where the status is false
            if not _temp_arc_sql.status.status:
                self.last_error = _temp_arc_sql.status.status_description
                print('status false', _temp_arc_sql.status.status_description)
                self.run_response.success = False
                self.run_response.message = _temp_arc_sql.status.status_description
                self.run_response.run_details = _temp_run.to_dict()
                return self.run_response

            
            # construct SQL
            _arc_sql_util = ArcSQLUtils(arc_sql=_temp_arc_sql)
            _sql_query_status, _sql_query_value = _arc_sql_util.get_sql_query()
            print('_sql_query_status', _sql_query_status, '_sql_query_value', _sql_query_value)
            if not _sql_query_status:
                self.last_error = str(_sql_query_value)
                __temp_error_message = f"SQL construction failed\n error: {_sql_query_value}"
                self.client.beta.threads.messages.create(
                    thread_id=self.thread.id,
                    role="user",
                    content=__temp_error_message
                )
                continue
            
            # parse SQL
            _translation_status, self.run_response.translated_sql = _arc_sql_util.construct_sql_query() # get it without cleaning for python execution
            if not _translation_status:
                self.last_error = str
                __temp_error_message = f"SQL translation failed\n error: {_translation_status}"
                self.client.beta.threads.messages.create(
                    thread_id=self.thread.id,
                    role="user",
                    content=__temp_error_message
                )
                continue

            # execute SQL
            raw_sql_exec = RawSQLExecution(sql=_sql_query_value, inputs=[], request=self.request)
            arc_sql_execution_pass, arc_sql_execution_result = raw_sql_exec.execute(fetch_results=True)
            print(arc_sql_execution_pass, 'arc_sql_execution_result', arc_sql_execution_result)
            if not arc_sql_execution_pass:
                self.last_error = str(arc_sql_execution_result)
                __temp_error_message = f"SQL execution failed\n error: {arc_sql_execution_result}"
                self.client.beta.threads.messages.create(
                    thread_id=self.thread.id,
                    role="user",
                    content=__temp_error_message
                )
                continue

            # identify message type
            if arc_sql_execution_result:
                if len(arc_sql_execution_result) == 1:
                    self.run_response.message_type = "kpi"
                    self.run_response.message = list(arc_sql_execution_result[0].values())[0]
                elif len(arc_sql_execution_result) > 1:
                    self.run_response.message_type = "table"
                    self.run_response.message = f"Table with {len(arc_sql_execution_result)} rows"

                self.run_response.success = True
                self.run_response.run_details = _temp_run.to_dict()
                return self.run_response 
                   
        self.run_response.message = f"Failed to process query: {self.last_error}"
        self.run_response.run_details = _temp_run.to_dict()
        return self.run_response
    
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
        Table description: {datatable_meta.description}\n"""
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
