from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Max, OuterRef, Subquery
from .models import BudgetItem
from .serializers import BudgetItemSerializer

class BudgetItemViewSet(viewsets.ModelViewSet):
    queryset = BudgetItem.objects.all().select_related("project", "category")
    serializer_class = BudgetItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    # Filtros simples via query params
    def get_queryset(self):
        qs = super().get_queryset()
        project = self.request.query_params.get("project")
        version = self.request.query_params.get("version")
        category = self.request.query_params.get("category")

        if project:
            qs = qs.filter(project_id=project)
        if version:
            qs = qs.filter(version=version)
        if category:
            qs = qs.filter(category_id=category)

        return qs.order_by("project_id", "category_id", "-version")

    @action(detail=False, methods=["get"], url_path="latest")
    def latest(self, request):
        """
        Lista apenas os itens da ÚLTIMA versão por projeto (útil p/ dashboards).
        Filtro opcional: ?project=ID
        """
        qs = self.get_queryset()
        project = request.query_params.get("project")

        # Descobre última versão por projeto (ou por um projeto específico)
        if project:
            last_version = qs.filter(project_id=project).aggregate(Max("version"))["version__max"]
            if last_version is None:
                return Response([])
            qs = qs.filter(project_id=project, version=last_version)
        else:
            sub = (BudgetItem.objects
                   .filter(project_id=OuterRef("project_id"))
                   .values("project_id")
                   .annotate(v=Max("version"))
                   .values("v")[:1])
            qs = qs.filter(version=Subquery(sub))

        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)
