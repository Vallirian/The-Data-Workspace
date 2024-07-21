from django.urls import path, include
from rawdata.views import RawDataView

urlpatterns = [
    path(r'<str:table_id>/', RawDataView.as_view(), name="raw_data"),
]