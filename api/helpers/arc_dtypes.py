from datetime import datetime
from helpers import arc_vars as avars

def get_current_datetime():
    return datetime.now().strftime(avars.COMMON_DATETIME_FORMAT)

def parse_datetime_from_str(date_str):
    try:
        return datetime.strptime(date_str, avars.COMMON_DATETIME_FORMAT)
    except ValueError:
        date_time_obj = datetime.strptime(date_str, avars.COMMON_DATE_FORMAT)
        date_time_obj = date_time_obj.replace(hour=0, minute=0, second=0)

        return date_time_obj