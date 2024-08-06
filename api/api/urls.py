from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    path("admin/", admin.site.urls),
    path("api-auth/", include("rest_framework.urls")),path("api-auth/", include("rest_framework.urls")),

    path("api/user/", include("user.urls")),
    path("api/table/", include("table.urls")),
    path("api/process/", include("process.urls")),
    path("api/raw/", include("rawdata.urls")),

    path("api/copilot/", include("copilot.urls")),
]