import uuid
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.db import models
from django.contrib.auth.models import PermissionsMixin
import services.values as svc_vals

class ArcUserManager(BaseUserManager):
    def create_user(self, firebase_uid, email=None, password=None, **extra_fields):
        if not firebase_uid:
            raise ValueError('The Firebase UID must be set')
        
        email = self.normalize_email(email)
        user = self.model(firebase_uid=firebase_uid, email=email, **extra_fields)
        user.save(using=self._db)
        return user


class ArcUser(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False) 

    firebase_uid = models.CharField(max_length=255, unique=True)
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    inputTokensConsumedChatDeleted = models.IntegerField(default=0) # when chat is deleted, the input tokens consumed are backed up here
    outputTokensConsumedChatDeleted = models.IntegerField(default=0) # when chat is deleted, the output tokens consumed are backed up here


    TIER_CHOICES = [
        ('free', 'free'),
    ]
    tier = models.CharField(max_length=10, choices=TIER_CHOICES, default='free')

    objects = ArcUserManager()

    USERNAME_FIELD = 'firebase_uid'
    REQUIRED_FIELDS = ['email']

    class Meta:
        db_table = svc_vals.ARC_USER
        
