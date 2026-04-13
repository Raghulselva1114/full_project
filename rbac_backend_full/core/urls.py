from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView
from accounts.views import CheckAdminExists
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/signup/', include('accounts.urls')),  # signup
    path('api/login/', TokenObtainPairView.as_view()),
    path('api/', include('accounts.urls')),

    path('api/check-admin/', CheckAdminExists.as_view()),  # 🔥 MUST

     path('api/', include('projects.urls')), 
]

urlpatterns += static(
    settings.MEDIA_URL,
    document_root=settings.MEDIA_ROOT
)