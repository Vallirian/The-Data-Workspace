from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("api/v1/app/user/", include("user.urls")),
    path("api/v1/app/workbooks/", include("workbook.urls")),
]
