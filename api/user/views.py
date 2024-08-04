from django.db import IntegrityError, transaction
from django.db import connection
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.db.utils import OperationalError
from helpers import arc_sql as asql, arc_statements as astmts, arc_utils as autils

from user.models import CustomUser, Tenant
import firebase_admin.auth as auth
from firebase_admin import exceptions as firebase_exceptions


class RegisterCustomUserView(APIView):
    """ create a new account for a new tenant """
    authentication_classes = [] # Disable authentication


    def post(self, request):
        print('request.data', request.data)
        email = request.data.get('email')
        username = request.data.get('username')
        password = request.data.get('password')
        tenant_display_name = request.data.get('tenantDisplayName')

        print('email', email)

        if not all([email, username, password, tenant_display_name]):
            return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
             # Create a new tenant
            tenant = Tenant.objects.create(displayName=tenant_display_name)
            tenant.save()

            # Create a new user
            new_user = CustomUser.objects.create_user(email=email, username=username, password=password)
            new_user.tenant = tenant
            new_user.save()
            print('new_user', new_user)

            # Register the user in Firebase
            firebase_user = auth.create_user(email=email, password=password, display_name=username)
            # custom_claims = {'tenantId': str(tenant.id)}
            # auth.set_custom_user_claims(firebase_user.uid, custom_claims)

            # create schema for tenant 
            create_schema_response_data = asql.create_schema(tenant.id)

            # create supporting tables for the tenant (comes after creating the schema and creating 
            # the user to keep user data in main table and not tenant schema)
            supporting_tables_response_data = asql.execute_raw_query(tenant=tenant.id, queries=astmts.get_supporting_tables_query())

            return Response({'message': 'User created successfully'}, status=status.HTTP_201_CREATED)

        except IntegrityError as e:
            print('IntegrityError', e)
            transaction.rollback()
            return Response({'error': 'Database integrity error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except firebase_exceptions.FirebaseError as e:
            print('FirebaseError', e)
            transaction.rollback()
            return Response({'error': 'Firebase error: ' + str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except OperationalError as e:
            print('OperationalError', e)
            transaction.rollback()
            return Response({'error': 'Database operational error: ' + str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            print('Exception', e)
            transaction.rollback()
            return Response({'error': 'Unexpected error: ' + str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
