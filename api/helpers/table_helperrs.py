data_type_map = {
    "UUID": "VARCHAR(64)",
    "string": "VARCHAR(255)",
    "number": "NUMERIC",
    "boolean": "BOOLEAN",
    "datetime": "TIMESTAMP"
}

def clean_uuid(uuid):
    return str(uuid).replace('-', '')

if __name__ == '__main__':
    pass