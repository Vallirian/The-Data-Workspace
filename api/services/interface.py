import re
from pydantic import BaseModel, Field, field_validator
from typing import List, Dict, Optional
from datetime import datetime
import services.values as svc_vals


# Arc SQL
class ResponseStatus(BaseModel):
    status: bool
    status_description: str

    class Config:
        extra = "forbid"

class CTETable(BaseModel):
    name: str = Field(description="The name of the Common Table Expression (CTE). This will be used concatenated with sql_as_string to form a CTE.")
    sql_as_string: str = Field(
        description="The SQL query defining the CTE. At runtime, this will be concatenated with the name to form a CTE that looks like 'name AS (sql_as_string)'. If this is the first CTE in the list, then the resulting CTE will be constructed as `WITH name AS (sql_as_string)`. sql_as_string must not contain a 'WITH' or 'AS' clause aimed at CTE."
    )

    class Config:
        extra = "forbid"

    @field_validator('name')
    def validate_name(cls, v):
        # Validate name against SQL reserved words
        if v.upper() in svc_vals.SQL_RESERVED_KEYWORDS:
            raise ValueError(f"CTE name cannot be a SQL reserved word: {v}")
        return v

    @field_validator('sql_as_string')
    def validate_sql_as_string(cls, v):
        # Validate against SQL injection
        if any(keyword in v.upper() for keyword in svc_vals.SQL_DDL_KEYWORDS):
            raise ValueError(f"SQL injection detected in CTE sql_as_string: {v}")
        
        # Validate against 'WITH' and 'AS' clauses
        if ('WITH' in v.upper()) or ('AS' in v.upper()):
            cte_pattern = r"^\s*(WITH|,)\s+.*\s+AS\s*\(.*\)"
            if re.match(cte_pattern, v, re.IGNORECASE):
                raise ValueError(f"CTE sql_as_string detected invalid CTE pattern: '{v}'")
        
        return v

class ArcSQL(BaseModel):
    name: str = Field(description="The name or identifier of the result. This can be like a name of the KPI, chart, table, etc that will be used as a lable in the report.")
    description: str = Field(description="A brief description of the SQL generation task. Provide any additional context or information that may be useful to the user. This can be a description of how to interpret the result, what the result represents, etc.")
    status: ResponseStatus
    cte_tables_in_order: List[CTETable] = Field(description="An ordered list of Common Table Expressions (CTEs) used in the SQL query.")
    final_select_sql_as_string: str = Field(
        description="The final SELECT SQL query as a string. This is the query used to finally return the desired result using the CTEs defined in cte_tables_in_order. This query must contain a 'SELECT' clause and a 'FROM' clause, and can not contain a 'WITH' or 'AS' clause."
    )

    class Config:
        extra = "forbid"


    @field_validator('final_select_sql_as_string')
    def validate_final_select_sql_as_string(cls, v: str):
        if ('SELECT' not in v.upper()) or ('FROM' not in v.upper()):
            raise ValueError("final_select_sql_as_string must contain 'SELECT' and 'FROM' clauses")
        
        # Keeping `WITH` disallowed here and relaxing `AS` for necessary context
        if 'WITH' in v.upper():
            raise ValueError(f"final_select_sql_as_string cannot contain 'WITH': detected {v}")

        # Restrict SQL injection patterns
        if any(keyword in v.upper() for keyword in svc_vals.SQL_DDL_KEYWORDS):
            raise ValueError(f"SQL injection detected in final_select_sql_as_string: found disallowed pattern in {v}")
        
        return v

# Services.Agent
class AgentRunResponse(BaseModel):
    success: bool = False
    arc_sql: ArcSQL = None
    translated_sql: str = ""

    message: str = ""
    message_type: str = "text"

    retries: int = 0
    run_details: Dict = {}

    class Config:
        extra = "forbid"
        
    # Optional: If you want to ensure the output is compatible with JSON
    def model_dump_json(self, **kwargs) -> str:
        return self.model_dump(mode='json', **kwargs)
    
# Services.DB
class TypeColumnMeta(BaseModel):
    id: Optional[int] = None
    name: Optional[str] = None
    dtype: Optional[str] = None
    format: Optional[str] = None
    description: Optional[str] = None
    dataTable: Optional[int] = None

class TypeDataTableMeta(BaseModel):
    id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None
    dataSourceAdded: Optional[str] = None
    dataSource: Optional[str] = None
    extractionStatus: Optional[str] = None
    extractionDetails: Optional[str] = None
    columns: List[TypeColumnMeta] = []

    @field_validator('name')
    def validate_table_name(cls, v):
        if v in svc_vals.INVALID_CHARACTERS_IN_NAME:
            raise ValueError('Invalid table name')
        return v
    
    @field_validator('columns')
    def validate_columns(cls, v):       
        if len(v) > svc_vals.MAX_COLUMNS:
            raise ValueError(f'Maximum {svc_vals.MAX_COLUMNS} columns allowed, {len(v)} found')

        column_names = []
        for column in v:
            if column.dtype not in list(svc_vals.DATA_TYPE_MAP.keys()):
                raise ValueError('Invalid data type')
            
            if column.name in svc_vals.INVALID_CHARACTERS_IN_NAME:
                raise ValueError('Invalid column name')
            
            if column.name in column_names:
                raise ValueError('Duplicate column name found')
            
            column_names.append(column.name)
        
        return v