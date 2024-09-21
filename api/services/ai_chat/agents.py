import os
from openai import OpenAI
from . message import UserMessage
from . import helpers as hlp
from pql import validation as pql_validation

class OpenAIPQLAgent:
    def __init__(self, agent_id: str) -> None:
        self.thread = None
        self.current_user_message = None
        self.current_agent_response = None
        self.pql = None
        
        self.retries = 0
        self.max_retries = 3

        # openai
        self.client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        self.agent = self.client.beta.assistants.retrieve(agent_id)

    def start_new_thread(self, user_message: str) -> None:
        self.thread = self.client.beta.threads.create()
        _temp_user_message = UserMessage(
            message_type='PQL',
            user_message=user_message,
            model='OPENAI.PQL_ASSISTANT_JSON'
        )
        self.current_user_message = self.client.beta.threads.messages.create(
            thread_id=self.thread.id,
            role=_temp_user_message.role,
            content=_temp_user_message.final_message
        )
        
    def run_chat(self) -> dict:
        '''
        Generates a PQL from the user message
        returns: 
            - (PQL) dict if successful else None
        '''
        while self.retries <= self.max_retries:
            _temp_run = self.client.beta.threads.runs.create_and_poll(
                thread_id=self.thread.id,
                assistant_id=self.agent.id,
                tool_choice='required'
            )

            self.retries += 1
            assert _temp_run.status == 'completed', f"Run failed to complete\n status: {_temp_run.status}\n details: {_temp_run.incomplete_details}"

            _temp_all_messages = self.client.beta.threads.messages.list(thread_id=self.thread.id)
            self.current_agent_response = _temp_all_messages.data[0].content[0].text.value

            # extract pql from the response
            _temp_json_extracted, _temp_pql_json = hlp.extract_json_from_md(self.current_agent_response)
            if not _temp_json_extracted:
                __temp_error_message = f"PQL JSON extraction failed\n error: {_temp_pql_json}"
                self.client.beta.threads.messages.create(
                    thread_id=self.thread.id,
                    role="user",
                    content=__temp_error_message
                )
                continue

            assert _temp_json_extracted, f"PQL JSON extraction failed: {_temp_pql_json}"

            # validate pql
            pql_validator = pql_validation.PQLValidtor(_temp_pql_json)
            pql_validator.validate()

            if pql_validator.errors:
                __temp_error_message = f"PQL validation failed\n errors: {'\n'.join(pql_validator.errors)}"
                self.client.beta.threads.messages.create(
                    thread_id=self.thread.id,
                    role="user",
                    content=__temp_error_message
                )
                continue
            else:
                self.pql = _temp_pql_json

            assert not pql_validator.errors, f"PQL validation failed\n errors: {'\n'.join(pql_validator.errors)} after {self.retries} retries"
            assert self.pql, f"PQL is empty after {self.retries} retries"

            return self.pql
                    