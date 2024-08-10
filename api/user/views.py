from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.db.utils import OperationalError
from helpers import arc_sql as asql, arc_statements as astmts

from user.models import CustomUser, Tenant

class RegisterCustomUserView(APIView):
    # create a new account for a new tenant
    permission_classes = [AllowAny]

    def post(self, request):
        tenant_display_name = request.data.get('tenantDisplayName')
        email = request.data.get('email')
        username = request.data.get('username')
        password = request.data.get('password')
        tenant_display_name = request.data.get('tenantDisplayName')

        for value in [email, username, password, tenant_display_name]:
            if value is None:
                return Response({'error': 'Please provide all required fields'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # create a new tenant
            tenant = Tenant.objects.create(displayName=tenant_display_name)
            tenant.save()

            # create a new user
            new_user = CustomUser.objects.create(email=email, username=username, tenant=tenant)
            new_user.role = 'admin'
            new_user.set_password(password)
            new_user.save()

            # create schema for tenant 
            create_schema_response_data = asql.create_schema(tenant.id)

            # create supporting tables for the tenant (comes after creating the schema and creating 
            # the user to keep user data in main table and not tenant schema)
            supporting_tables_response_data = asql.execute_raw_query(tenant=tenant.id, queries=astmts.get_supporting_tables_query())

            return Response({'message': 'User created successfully'}, status=status.HTTP_201_CREATED)

        except OperationalError as e:
            print(e)
            return Response({'error': f'Database error: operation failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            print(e)
            return Response({'error': f'Unexpected error: failed to create user'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class InviteNewUserView(APIView):
    # HACK: This is not a production ready method. It is just a placeholder for the sake of the demo.
    # TODO: Implement a proper user registration method
    def post(self, request):
        tenant_id = request.user.tenant.id
        user_role = request.user.role
        if user_role != 'admin':
            return Response({'error': 'You are not authorized to perform this action, please contact your admin user.'}, status=status.HTTP_403_FORBIDDEN)

        new_user_email = request.data.get('email')
        new_user_username = request.data.get('username')
        new_user_password = request.data.get('password')
        new_user_role = request.data.get('role')

        for value in [tenant_id, new_user_email, new_user_username, new_user_password, new_user_role]:
            if value is None:
                return Response({'error': 'Please provide all required fields'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # get tenant
            tenant = Tenant.objects.get(id=tenant_id)

            # create a new user
            new_user = CustomUser.objects.create(email=new_user_email, username=new_user_username, tenant=tenant)
            new_user.role = new_user_role
            new_user.set_password(new_user_password)
            new_user.save()

            return Response({'message': 'User created successfully'}, status=status.HTTP_201_CREATED)

        except OperationalError as e:
            print(e)
            return Response({'error': f'Database error: operation failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            print(e)
            return Response({'error': f'Unexpected error: failed to create user'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)