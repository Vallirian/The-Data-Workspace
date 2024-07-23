from helpers import arc_vars as avars

def remove_uuid_dash(uuid):
    return str(uuid).replace('-', '')

def get_raw_table_id(table_id):
    return f"{remove_uuid_dash(table_id)}"

def get_table_name(table_id):
    return f"{avars.raw_table_prefix}{remove_uuid_dash(table_id)}"

def get_column_name(column_id):
    return f"{avars.raw_column_prefix}{remove_uuid_dash(column_id)}"

def rp_get_right_table_name(right_table_id):
    return f"{get_table_name(right_table_id)}_id"

if __name__ == '__main__':
    pass
