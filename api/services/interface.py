import re
from pydantic import BaseModel, Field, field_validator
from typing import List

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
        if v.upper() in SQL_RESERVED_KEYWORDS:
            raise ValueError(f"CTE name cannot be a SQL reserved word: {v}")
        return v

    @field_validator('sql_as_string')
    def validate_sql_as_string(cls, v):
        # Validate against SQL injection
        if any(keyword in v.upper() for keyword in SQL_DDL_KEYWORDS):
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
        if any(keyword in v.upper() for keyword in SQL_DDL_KEYWORDS):
            raise ValueError(f"SQL injection detected in final_select_sql_as_string: found disallowed pattern in {v}")
        
        return v

