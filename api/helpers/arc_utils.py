import uuid
from helpers import arc_vars as avars

def custom_uuid():
    return str(uuid.uuid4()).replace('-', '')

def rp_get_right_table_name(right_table_id):
    return f"{right_table_id}_id"

if __name__ == '__main__':
    pass
