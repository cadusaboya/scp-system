from rest_framework import serializers
from .models import Investment

class InvestmentSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source="project.name", read_only=True)
    project_type = serializers.CharField(source="project.type", read_only=True)
    project_share_value = serializers.DecimalField(
        source="project.share_value", max_digits=14, decimal_places=2, read_only=True
    )

    class Meta:
        model = Investment
        fields = [
            "id",
            "project",
            "project_name",
            "project_type",
            "project_share_value",
            "value",
            "date",
            "note",
        ]
