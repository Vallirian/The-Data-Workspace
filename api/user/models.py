import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from helpers import arc_utils as autils

class Tenant(models.Model):
    id = models.CharField(primary_key=True, default=autils.custom_uuid, editable=False, max_length=255)
    displayName = models.CharField(max_length=255)
    createdAt = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.displayName

class CustomUserManager(BaseUserManager):
    def validate_password(self, value):
        if len(value) < 8:
            raise ValueError("The Password field must be at least 8 characters long")
        
        if not any(char.isdigit() for char in value):
            raise ValueError("The Password field must contain at least one digit")
        
        if not any(char.isupper() for char in value):
            raise ValueError("The Password field must contain at least one uppercase letter")
        
        if not any(char.islower() for char in value):
            raise ValueError("The Password field must contain at least one lowercase letter")
        
        if not any(char in "!@#$%^&*()-+" for char in value):
            raise ValueError("The Password field must contain at least one special character")

        return value
    
    def create_superuser(self, email, username, password):
        user = self.create_user(email, username, password)
        user.is_staff = True
        user.is_superuser = True
        user.save()
        return user

    def create_user(self, email, username, password):
        if not email:
            raise ValueError("The Email field must be set")
        
        if not username:
            raise ValueError("The User Name field must be set")
        if username.strip() == "":
            raise ValueError("The User Name field must not be empty")
        
        if not password:
            raise ValueError("The Password field must be set")
        
        password = self.validate_password(password)
        email = self.normalize_email(email)
        user = self.model(email=email, username=username)
        user.set_password(password)
        user.save()
        return user
    
class CustomUser(AbstractUser):
    USER_ROLES = [
        ('admin', 'Admin'),
        ('member', 'Member'),
    ]
    id = models.CharField(primary_key=True, default=autils.custom_uuid, editable=False, max_length=255)
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150)
    is_active = models.BooleanField(default=True)
    role = models.CharField(max_length=50, choices=USER_ROLES, default='member')
    tenant = models.ForeignKey(Tenant, on_delete=models.PROTECT, null=True, blank=True)
    
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]
    
    objects = CustomUserManager()
    
    def __str__(self):
        return self.username