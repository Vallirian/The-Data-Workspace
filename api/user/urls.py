from django.urls import path
from user.views import RegisterCustomUserView

urlpatterns = [ 
    path('register/', RegisterCustomUserView.as_view(), name='register_user'),  
]
