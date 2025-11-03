from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet, MyProjectsList, PlannedProjectsList

router = DefaultRouter()
router.register(r'', ProjectViewSet, basename='project')

urlpatterns = [
    path('mine/', MyProjectsList.as_view(), name='projects-mine'),
    path('planned/', PlannedProjectsList.as_view(), name='projects-planned'),
]

urlpatterns += router.urls
