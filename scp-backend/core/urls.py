from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from investors.views import register

urlpatterns = [
    path('admin/', admin.site.urls),

    # 👇 Rota completa de projetos
    path('api/projects/', include('projects.urls')),
    path("api/investments/", include("investment.urls")),
    path('api/expenses/', include('expenses.urls')),
    path("api/budgets/", include("budgets.urls")),
    path("api/investors/", include("investors.urls")),

    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path("api/register/", register, name="register"),
]
