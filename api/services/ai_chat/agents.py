import os
from openai import OpenAI
from . message import AnalysisUserMessage
from .helpers import extract_json_from_md
from services.pql import validation as pql_validation
from datetime import datetime

class OpenAIAnalysisAgent:
    def __init__(self, user_message: str=None, chat_id: str=None, thread_id: str=None) -> None:
        self.thread = None
        self.chat_id = chat_id
        self.thread_id = thread_id

        self.current_user_message = user_message
        self.current_agent_response = None
        self.full_agent_response = None
        self.current_full_conversation = [{"initial_user_message": user_message}]
        
        self.input_tokens = 0
        self.output_tokens = 0
        self.retries = 0
        self.max_retries = int(os.getenv('OPEN_AI_MAX_RETRIES', 3))

        assert chat_id, "Chat ID must be provided"

        # openai
        self.client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        self.agent = self.client.beta.assistants.retrieve(os.getenv('OPEN_AI_ANALYSIS_CHAT_ASSISTANT_ID'))

        assert self.agent, "Agent not found"

    def start_new_thread(self) -> None:
        self.thread = self.client.beta.threads.create()
        
        assert self.thread, "Thread creation failed"
        
        self.thread_id = self.thread.id

    def send_message(self, table_informaiton: str, column_informaion: str) -> str:
        if self.current_user_message is None:
            return {
                'success': False,
                'message': "User message not found",
                'chat_id': self.chat_id,
                'thread_id': self.thread_id,
                'full_conversation': self.current_full_conversation,
                'input_tokens': self.input_tokens,
                'output_tokens': self.output_tokens,
                'retries': self.retries,
                'start_time': _start,
                'end_time': datetime.now(),
                'run_details': None
            }
        
        # continue the thread
        if (self.thread is None) and (self.chat_id is not None):
            self.thread = self.client.beta.threads.retrieve(thread_id=self.thread_id)

        _temp_user_message = AnalysisUserMessage(user_message=self.current_user_message, table_information=table_informaiton, column_information=column_informaion)
        self.current_full_conversation.append({"enhanced_user_message":_temp_user_message.final_message})
        self.current_user_message = self.client.beta.threads.messages.create(
            thread_id=self.thread.id,
            role=_temp_user_message.role,
            content=_temp_user_message.final_message
        )

        while self.retries <= self.max_retries:
            _start = datetime.now()
            _temp_run = self.client.beta.threads.runs.create_and_poll(
                thread_id=self.thread.id,
                assistant_id=self.agent.id,
                model=os.getenv('OPEN_AI_MODEL'),
                tool_choice=None
            )

            # increment retries here because we `continue` in the loops
            self.retries += 1
            
            if _temp_run.status != 'completed':
                # we check failed and retry to keep unfailed runs directly under the while loop so that our `continue` statements work
                self.current_full_conversation.append({f"agent_failed_on_retry_{self.retries}":_temp_run.to_dict()})
                continue

            _temp_all_messages = self.client.beta.threads.messages.list(thread_id=self.thread.id)
            self.full_agent_response = _temp_all_messages.data
            print('Full agent response:', self.full_agent_response)
            self.current_agent_response = _temp_all_messages.data[0].content[0].text.value
            self.current_full_conversation.append({f"agent_response_on_retry_{self.retries}":self.current_agent_response})

            # extract pql from the response
            print('Current agent response to extract:', self.current_agent_response)
            _temp_json_extracted, _temp_pql_json = extract_json_from_md(self.current_agent_response)
            print('Extracted JSON:', _temp_pql_json)
            if not _temp_json_extracted:
                __temp_error_message = f"PQL JSON extraction failed\n error: {_temp_pql_json}"
                print(__temp_error_message)
                self.current_full_conversation.append({f"json_error_on_retry_{self.retries}":__temp_error_message})
                self.client.beta.threads.messages.create(
                    thread_id=self.thread.id,
                    role="user",
                    content=__temp_error_message
                )
                continue
            
            self.current_full_conversation.append({f"pql_extracted_on_retry_{self.retries}":_temp_pql_json})
            # validate pql
            print('Validating PQL:', _temp_pql_json)
            pql_validator = pql_validation.PQLValidtor(_temp_pql_json)
            pql_validator.validate()
            print('PQL validation errors:', pql_validator.errors)

            if pql_validator.errors:
                _error_messages = '\n'.join(pql_validator.errors)
                __temp_error_message = f"PQL validation failed\n errors: {_error_messages}"
                print(__temp_error_message)
                self.current_full_conversation.append({f"pql_error_on_retry_{self.retries}":__temp_error_message})
                self.client.beta.threads.messages.create(
                    thread_id=self.thread.id,
                    role="user",
                    content=__temp_error_message
                )
                continue

            self.pql = _temp_pql_json

            self.input_tokens += _temp_run.usage.prompt_tokens
            self.output_tokens += _temp_run.usage.completion_tokens

            assert self.pql, "PQL not found"
            assert pql_validator.errors == [], "PQL validation failed"

            if self.pql:
                print('PQL:', self.pql)
                return {
                    'success': True, 
                    'message': self.pql,
                    'chat_id': self.chat_id,
                    'thread_id': self.thread_id,
                    'full_conversation': self.current_full_conversation,
                    'input_tokens': self.input_tokens,
                    'output_tokens': self.output_tokens,
                    'retries': self.retries,
                    'start_time': _start,
                    'end_time': datetime.now(),
                    'run_details': _temp_run.to_dict()
                }                
            
        return {
            'success': False,
            'message': f"Run failed to complete\n status: {_temp_run.status}\n details: {_temp_run.incomplete_details}",
            'chat_id': self.chat_id,
            'thread_id': self.thread_id,
            'full_conversation': self.current_full_conversation,
            'input_tokens': self.input_tokens,
            'output_tokens': self.output_tokens,
            'retries': self.retries,
            'start_time': _start,
            'end_time': datetime.now(),
            'run_details': _temp_run.to_dict()
        }