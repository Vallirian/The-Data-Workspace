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

    # TODO: Remove this in production
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),

    path("api/user/", include("user.urls")),
    path("api/workspace/", include("workspace.urls")),
]
