import os
from helpers import arc_vars as avars, arc_utils as autils
from copilot import process_message, function_calling

import google.generativeai as genai


def send(history: list['str'], message: str, tenant_id: str, chat_type: str, table_name: str=None, process_name: str=None) -> str:
    genai.configure(api_key=os.environ.get("GOOGLE_AI_API_KEY"))

    if not chat_type or chat_type not in avars.COPILOT_CHAT_TYPES:
        raise 'Please provide a valid chat type'

    if chat_type == 'analysis':
        final_message = process_message.enhance_analysis_action_user_message(message=message, tenant_id=tenant_id, current_table_name=table_name)
        system_instructions = avars.ANALYSIS_COPILOT_SYSTEM_INSTRUCTIONS
        functions_tool = autils.get_function_declaration(avars.ANALYSIS_COPILOT_ALLOWED_FUNCTIONS)
    elif chat_type == 'process':
        final_message = process_message.enhance_process_action_user_message(message=message, tenant_id=tenant_id, current_process_name=process_name)
        system_instructions = avars.PROCESS_COPILOT_SYSTEM_INSTRUCTIONS
        functions_tool = autils.get_function_declaration(avars.PROCESS_COPILOT_ALLOWED_FUNCTIONS)

    try:
        model = genai.GenerativeModel(
            os.environ.get("GEMINI_AI_MODEL"),
            tools=[
                genai.protos.Tool(functions_tool)
            ],
            system_instruction=system_instructions
        )
        
        gemini_chat = model.start_chat(
            history=history, 
            enable_automatic_function_calling=True
        )

        model_response = gemini_chat.send_message(
            final_message
        )

        is_function_call = 'function_call' in model_response.candidates[0].content.parts[0]
        while is_function_call:
            function_call = model_response.candidates[0].content.parts[0].function_call
            function_call_exec_result = function_calling.execute_function(function_call)
            model_response = gemini_chat.send_message(
                genai.protos.Content(
                    parts=[
                        genai.protos.Part(
                            function_response=genai.protos.FunctionResponse(
                                name=function_call.name,
                                response={'result': function_call_exec_result}
                            )
                        )
                    ]
                )
            )

            is_function_call = 'function_call' in model_response.candidates[0].content.parts[0]

        return model_response.text
    except Exception as e:
        print('error', e)
        return 'Unable to resolve response'
    