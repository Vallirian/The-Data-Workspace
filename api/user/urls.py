from django.urls import path
from user.views import RegisterCustomUserView, InviteNewUserView

urlpatterns = [ 
    path('register/', RegisterCustomUserView.as_view(), name='register_user'),  
    path('invite/', InviteNewUserView.as_view(), name='invite_user')
]
