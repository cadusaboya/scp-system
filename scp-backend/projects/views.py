from rest_framework import viewsets, generics, permissions
from .models import Project
from .serializers import ProjectSerializer

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

class PlannedProjectsList(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ProjectSerializer

    def get_queryset(self):
        return Project.objects.filter(status='planejado').order_by('-created_at')

class MyProjectsList(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ProjectSerializer

    def get_queryset(self):
        user = self.request.user
        # garante que há investor vinculado ao user
        investor = getattr(user, 'investor', None)
        if not investor:
            return Project.objects.none()
        # projetos onde esse investidor tem aportes
        return Project.objects.filter(contributions__investor=investor).distinct().order_by('-created_at')
