from django.urls import path
from .views import *
from .views import CreateProjectUserView, ProjectListView

urlpatterns = [
    path("projects/", ProjectListView.as_view()),
    path("projects/<int:pk>/", UpdateProjectView.as_view()),
    path("projects/<int:pk>/delete/", DeleteProjectView.as_view()),
    path("create-project-user/", CreateProjectUserView.as_view()),
    path("create-project/", CreateProjectView.as_view()),
    path("users/", UserListView.as_view()),
    path("assign-user/", AssignUserToProjectView.as_view()),
    path("remove-user/", RemoveUserFromProjectView.as_view()),
    path("create-user-assign/", CreateUserAssignProjectView.as_view()),
    path("update-user-role/<int:user_id>/", UpdateUserRoleView.as_view()),
    
]