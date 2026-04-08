from django.urls import path
from .views import (
    SignupView,
    LoginView,
    CheckAdminExists,
    CreateAdminView,
    CreateMemberView,
    CreateUserView,
    OrganizationListView,
    DeleteOrganizationView,
    UpdateOrganizationView 
)

urlpatterns = [
    path('signup/', SignupView.as_view()),
    path('custom-login/', LoginView.as_view()),  # 🔥 change name
    path('check-admin/', CheckAdminExists.as_view()),
    path("organizations/", OrganizationListView.as_view()),
    path("organizations/<int:id>/", DeleteOrganizationView.as_view()),
    path("organizations/<int:id>/update/", UpdateOrganizationView.as_view()),

    # 🔥 ROLE BASED CREATION
    path('create-admin/', CreateAdminView.as_view()),
    path('create-member/', CreateMemberView.as_view()),
    path('create-user/', CreateUserView.as_view()),
   
]