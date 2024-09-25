from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
import uuid

class Tenant(models.Model):
    id = models.CharField(primary_key=True, default=uuid.uuid4().hex, editable=False, max_length=255)
    displayName = models.CharField(max_length=255)
    createdAt = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.displayName
    
class CustomUserManager(BaseUserManager):    
    def create_superuser(self, email, username, password):
        user = self.create_user(email, username, password)
        user.is_staff = True
        user.is_superuser = True
        user.save()
        return user

    def create_user(self, email, username, password):
        if not email:
            raise ValueError("The Email field must be set")

        password = self.validate_password(password)
        email = self.normalize_email(email)
        user = self.model(email=email, username=username)
        user.save()
        return user

class CustomUser(AbstractUser):
    USER_ROLES = [
        ('admin', 'Admin'),
        ('member', 'Member'),
    ]
    id = models.CharField(primary_key=True, editable=False, max_length=255)
    email = models.EmailField(unique=True)
    is_active = models.BooleanField(default=True)
    role = models.CharField(max_length=50, choices=USER_ROLES, default='admin')
    tenant = models.ForeignKey(Tenant, on_delete=models.PROTECT, null=True, blank=True)
    
    def __str__(self):
        return self.username