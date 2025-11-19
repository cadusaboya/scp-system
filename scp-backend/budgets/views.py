from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import models

from .models import BudgetItem
from .serializers import BudgetItemSerializer
from expenses.models import Category
from projects.models import Project


class BudgetItemViewSet(viewsets.ModelViewSet):
    queryset = BudgetItem.objects.all()
    serializer_class = BudgetItemSerializer

    @action(detail=False, methods=["put"], url_path="project/(?P<project_id>[^/.]+)/recreate")
    def recreate_budgets(self, request, project_id=None):
        try:
            project = Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            return Response({"detail": "Project not found"}, status=404)

        data = request.data
        if not isinstance(data, list):
            return Response({"detail": "Expected a list of budgets"}, status=400)

        # 1️⃣ Descobrir versão atual
        last_version = (
            BudgetItem.objects
            .filter(project=project)
            .aggregate(maxv=models.Max("version"))
            .get("maxv")
        ) or 1

        new_version = last_version + 1

        # 2️⃣ Criar os novos budgets
        created = []
        for item in data:
            category_name = item.get("category_name")
            planned_value = item.get("planned_value", 0)

            try:
              category = Category.objects.get(name=category_name)
            except Category.DoesNotExist:
              return Response({"detail": f"Category '{category_name}' not found"}, status=400)

            bi = BudgetItem.objects.create(
                project=project,
                category=category,
                planned_value=planned_value,
                version=new_version
            )
            created.append(bi.id)

        return Response(
            {
                "project": project.id,
                "version_created": new_version,
                "budget_items": created
            },
            status=status.HTTP_201_CREATED
        )
