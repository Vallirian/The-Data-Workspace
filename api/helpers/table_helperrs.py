data_type_map = {
    "UUID": "VARCHAR(64)"
}

def clean_uuid(uuid):
    return str(uuid).replace('-', '')

if __name__ == '__main__':
    pass