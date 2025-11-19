from rest_framework import viewsets, generics, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Project
from .serializers import ProjectSerializer 

from budgets.models import BudgetItem
from budgets.serializers import BudgetItemSerializer


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

    # -----------------------------
    # GET /projects/{id}/budgets/
    # Retorna APENAS a versão mais nova
    # para cada categoria
    # -----------------------------
    @action(detail=True, methods=['get'], url_path='budgets')
    def budgets(self, request, pk=None):
        project = self.get_object()

        # Todos os budget_items do projeto
        all_items = project.budget_items.select_related("category").all()

        # Filtrar para pegar apenas a versão mais recente por categoria
        latest = {}
        for item in all_items:
            key = item.category_id
            if key not in latest or item.version > latest[key].version:
                latest[key] = item

        serializer = BudgetItemSerializer(latest.values(), many=True)
        return Response(serializer.data)


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
        investor = getattr(user, 'investor', None)
        if not investor:
            return Project.objects.none()
        return Project.objects.filter(
            investments__investor=investor
        ).distinct().order_by('-created_at')
