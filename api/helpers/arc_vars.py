data_type_map = {
    "UUID": "VARCHAR(128)",
    "string": "VARCHAR(1024)",
    "number": "NUMERIC",
    "boolean": "BOOLEAN",
    "datetime": "TIMESTAMP"
}

copilot_system_user = "model"

raw_table_prefix = "raw_table_"
raw_column_prefix = "raw_column_"
relationship_column_prefix = "raw_relationship_"

relationship_table = "relationship_relationship"
column_table = "column_column"