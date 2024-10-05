from . import helpers as hlp

class StandardUserMessage:
    def __init__(self, user_message) -> None:
        self.user_message = user_message
        self.final_message = ''
        self.role = 'user'

        assert isinstance(user_message, str), "User message must be a string"
        assert len(user_message) > 0, "User message must not be empty"

        self.enhance_message()

    def enhance_message(self):
        self.final_message = hlp.STANDARD_MESSAGE_ENHANCEMENT_TEXT + self.user_message

# class UserMessage:
#     def __init__(self, message_type: list['str'], user_message, model) -> None:
#         self.user_id = None
#         self.user_message = user_message
#         self.final_message = ''
#         self.role = 'user'
#         self.model = model

#         assert isinstance(user_message, str), "User message must be a string"
#         assert len(user_message) > 0, "User message must not be empty"
#         assert message_type in hlp.USER_MESSAGE_TYPES, f"Message type must be one of {hlp.USER_MESSAGE_TYPES}"
#         assert model in hlp.VALID_MODELS, f"Model must be one of {hlp.VALID_MODELS}"
        

#         self.message_type = message_type

#         self.enhance_message()

#     def enhance_message(self):
#         '''
#         Enhances the user message based on the model
#         returns: None
#         '''
#         provider, model = self.model.split('.')
#         self.final_message = hlp.MODELS[provider][model]['enhancement_text'] + self.user_message




    