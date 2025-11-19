from rest_framework import serializers
from .models import BudgetItem, Category

class BudgetItemSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = BudgetItem
        fields = (
            "id",
            "project",
            "category",
            "category_name",
            "planned_value",
            "version",
            "note",
        )


