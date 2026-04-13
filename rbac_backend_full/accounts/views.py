from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.auth import authenticate
from .models import User
from .serializers import SignupSerializer
from rest_framework import status
from django.db import IntegrityError
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .models import Organization


# 👑 SUPERADMIN SIGNUP
class SignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = SignupSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(role="superadmin")
            return Response(
                {"message": "SuperAdmin created ✅"},
                status=status.HTTP_201_CREATED
            )

        # 🔥 FIX HERE
        return Response(
            {"error": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )


# 🔍 CHECK ADMIN EXISTS (for redirect logic)
class CheckAdminExists(APIView):
    def get(self, request):
        exists = User.objects.filter(role='admin').exists()
        return Response({"admin_exists": exists})


# 🔐 LOGIN (ALL ROLES)
class LoginView(APIView):
    def post(self, request):
        user = authenticate(
            username=request.data.get("username"),
            password=request.data.get("password")
        )

        if user:
            refresh = RefreshToken.for_user(user)

            return Response({
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "role": user.role,  
                "sub_role": user.sub_role 
            })

        return Response({"error": "Invalid credentials"}, status=400)


User = get_user_model()

class CreateAdminView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        org_name = request.data.get("organization_name")
        username = request.data.get("username")
        password = request.data.get("password")

        print("DATA:", request.data)

        # 🔥 VALIDATION
        if not org_name or not username or not password:
            return Response(
                {"error": "All fields are required ❌"},
                status=400
            )

        try:
            # 🔥 CHECK USER EXISTS
            if User.objects.filter(username=username).exists():
                return Response(
                    {"error": "Username already exists ❌"},
                    status=400
                )

            # 🔥 CREATE ORGANIZATION
            org = Organization.objects.create(name=org_name)
            print("ORG SAVED:", org.name)

            # 🔥 CREATE USER
            user = User.objects.create_user(
                username=username,
                password=password
            )
            user.role = "admin"
            user.organization = org 

            user.save()

            return Response({
                "message": "Admin + Organization Created ✅"
            })

        except IntegrityError as e:
            return Response(
                {"error": "Database error ❌"},
                status=400
            )

        except Exception as e:
            print("ERROR:", str(e))
            return Response(
                {"error": str(e)},
                status=500
            )

# 🧑‍💼 ADMIN → CREATE MEMBER
class CreateMemberView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = User.objects.create_user(
            username=username,
            password=password
        )
        user.role = "member"   # 🔥 assign role
        user.save()

        return Response({"msg": "Member created"})


# 👨‍🔧 MEMBER → CREATE USER
class CreateUserView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = User.objects.create_user(
            username=username,
            password=password
        )
        user.role = "user"   # 🔥 assign role
        user.save()

        return Response({"msg": "User created"})
    
class OrganizationListView(APIView):
    def get(self, request):
        data = []

        orgs = Organization.objects.all()

        for org in orgs:
            # 🔥 get admin user for THIS organization
            user = User.objects.filter(
                organization=org,
                role="admin"
            ).first()

            data.append({
                "id": org.id,
                "organization_name": org.name,
                "username": user.username if user else "-",
                "created_at": user.date_joined if user else None
            })

        return Response(data)
    
class DeleteOrganizationView(APIView):
    def delete(self, request, id):
        try:
            org = Organization.objects.get(id=id)
            org.delete()
            return Response({"message": "Deleted ✅"})
        except Organization.DoesNotExist:
            return Response({"error": "Not found ❌"}, status=404)
        

class UpdateOrganizationView(APIView):
    def put(self, request, id):
        try:
            org = Organization.objects.get(id=id)
            name = request.data.get("organization_name")

            org.name = name
            org.save()

            return Response({"message": "Updated ✅"})
        except Organization.DoesNotExist:
            return Response({"error": "Not found"}, status=404)