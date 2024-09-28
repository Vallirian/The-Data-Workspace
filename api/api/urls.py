from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/user/", include("user.urls")),
    path("api/workbooks/", include("workbook.urls")),
    path("api/table-meta/", include("datatable.urls")),
]
