from pydantic import BaseModel
from typing import Union

# Arc SQL
class ResponseStatus(BaseModel):
    status: bool
    status_description: Union[str, None] = None

class CTETable(BaseModel):
    name: str
    sql_as_string: str

class ArcSQL(BaseModel):
    name: str
    description: str
    status: ResponseStatus
    cte_tables_in_order: list[CTETable]
    final_select_sql_as_string: str