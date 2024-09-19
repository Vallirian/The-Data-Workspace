from services.pql import helpers as hlp

class Column:
    def __init__(self, **kwargs) -> None:
        self.name = kwargs.get('Field')
        self.dtype = hlp.get_data_type(kwargs.get('Type'))

    def __str__(self) -> str:
        return f'{self.name} {self.dtype}'