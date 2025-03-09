from django.urls import path, include

urlpatterns = [
    path("api/v2/app/user/", include("user.urls")),
    path("api/v2/app/workspaces/", include("workspace.urls")),

    path("api/v1/app/workbooks/", include("workbook.urls")),
    path("api/v1/app/shared/", include("shared.urls")),
]
