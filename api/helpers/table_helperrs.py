data_type_map = {
    "UUID": "VARCHAR(64)",
    "string": "VARCHAR(255)",
    "number": "NUMERIC",
    "boolean": "BOOLEAN",
    "datetime": "TIMESTAMP"
}

raw_table_prefix = "raw_table_"
raw_column_prefix = "raw_column_"

def clean_uuid(uuid):
    return str(uuid).replace('-', '')

if __name__ == '__main__':
    pass