from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from accounts.permissions import RolePermission
from accounts.models import User

from .models import Project, ProjectUser


# 🚀 CREATE PROJECT + USER
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from accounts.permissions import RolePermission
from accounts.models import User
from .models import Project, ProjectUser

class CreateProjectUserView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            username = request.data.get("username")
            password = request.data.get("password")
            sub_role = request.data.get("sub_role")

            if not username or not password or not sub_role:
                return Response({"error": "Missing required fields"}, status=400)

            # 🔥 FIX HERE
            user = User.objects.create_user(
                username=username,
                password=password
            )

            user.sub_role = sub_role   # ✅ correct field
            user.is_active = True  
            user.save()                # 🔥 MUST

            return Response({
                "message": "User created ✅",
                "username": user.username,
                "role": sub_role
            })

        except Exception as e:
            return Response({"error": str(e)}, status=500)
        



class CreateUserAssignProjectView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            username = request.data.get("username")
            password = request.data.get("password")
            sub_role = request.data.get("sub_role")

            if not username or not password or not sub_role:
                return Response({"error": "Missing required fields"}, status=400)

            # ✅ FIX HERE
            user = User.objects.create_user(
                username=username,
                password=password
            )

            user.sub_role = sub_role   # 🔥 correct field
            user.is_active = True  
            user.save()                # 🔥 MUST

            return Response({
                "message": "User created ✅",
                "username": user.username,
                "role": sub_role
            })

        except Exception as e:
            return Response({"error": str(e)}, status=500)

# 🚀 CREATE PROJECT ONLY
class CreateProjectView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            project_name = request.data.get("project_name")
            description = request.data.get("description")
            start = request.data.get("start_date")
            end = request.data.get("end_date")

            if not project_name:
                return Response({"error": "Project name required"}, status=400)

            project = Project.objects.create(
                name=project_name,
                description=description,
                start_date=start,
                end_date=end
            )

            return Response({
                "message": "Project created ✅",
                "project_id": project.id
            })

        except Exception as e:
            return Response({"error": str(e)}, status=500)



# 📊 LIST PROJECTS (FIXED FOR MULTIPLE USERS)
class ProjectListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = []

        projects = Project.objects.all().order_by("-id")

        for p in projects:
            project_users = ProjectUser.objects.filter(project=p)

            data.append({
                "id": p.id,
                "project_name": p.name,
                "description": p.description,
                "start": p.start_date,
                "end": p.end_date,

                # 🔥 SEND ALL USERS
                "users": [
                    {
                        "id": pu.user.id,
                        "username": pu.user.username
                    }
                    for pu in project_users
                ],

                "joined": None
            })

        return Response(data)

# ✏️ UPDATE PROJECT
class UpdateProjectView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        try:
            project = get_object_or_404(Project, id=pk)

            project.name = request.data.get("project_name", project.name)
            project.description = request.data.get("description", project.description)
            project.start_date = request.data.get("start", project.start_date)
            project.end_date = request.data.get("end", project.end_date)

            project.save()

            return Response({"message": "Project updated ✅"})

        except Exception as e:
            return Response({"error": str(e)}, status=500)
        
# 👥 LIST USERS
class UserListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            users = User.objects.all().values("id", "username", "sub_role")
            return Response(users)
        except Exception as e:
            return Response({"error": str(e)}, status=500)
        

# ➕ ASSIGN MULTIPLE USERS TO PROJECT
class AssignUserToProjectView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            project_id = request.data.get("project_id")
            user_ids = request.data.get("user_ids", [])

            if not project_id or not user_ids:
                return Response({"error": "Missing data"}, status=400)

            project = get_object_or_404(Project, id=project_id)

            for uid in user_ids:
                user = get_object_or_404(User, id=uid)

                # 🔥 avoid duplicate
                ProjectUser.objects.get_or_create(
                    project=project,
                    user=user
                )

            return Response({"message": "Users assigned ✅"})

        except Exception as e:
            return Response({"error": str(e)}, status=500)
        

# ❌ REMOVE USER FROM PROJECT
class RemoveUserFromProjectView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            project_id = request.data.get("project_id")
            user_id = request.data.get("user_id")

            if not project_id or not user_id:
                return Response({"error": "Missing data"}, status=400)

            pu = get_object_or_404(
                ProjectUser,
                project_id=project_id,
                user_id=user_id
            )

            pu.delete()

            return Response({"message": "User removed ✅"})

        except Exception as e:
            return Response({"error": str(e)}, status=500)


# 🗑 DELETE FULL PROJECT
class DeleteProjectView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            project = get_object_or_404(Project, id=pk)

            # 🔥 delete all relations
            ProjectUser.objects.filter(project=project).delete()

            # 🔥 delete project
            project.delete()

            return Response({"message": "Project deleted ✅"})

        except Exception as e:
            return Response({"error": str(e)}, status=500)
        

# 🔥 UPDATE USER ROLE
class UpdateUserRoleView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, user_id):
        try:
            user = get_object_or_404(User, id=user_id)

            sub_role = request.data.get("sub_role")

            if not sub_role:
                return Response({"error": "Role required"}, status=400)

            if sub_role not in ["project_manager", "project_engineer", "data_contributor"]:
                return Response({"error": "Invalid role"}, status=400)

            user.sub_role = sub_role
            user.save()

            return Response({
                "message": "Role updated ✅",
                "username": user.username,
                "new_role": sub_role
            })

        except Exception as e:
            return Response({"error": str(e)}, status=500)