from pydantic import BaseModel
from typing import List

class MetaData(BaseModel):
    tableName: str
    columns: List[str]

    class Config:
        extra = "forbid"

    