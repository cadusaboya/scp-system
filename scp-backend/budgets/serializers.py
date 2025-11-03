from rest_framework import serializers
from .models import BudgetItem

class BudgetItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = BudgetItem
        fields = "__all__"
        extra_kwargs = {
            "note": {"required": False, "allow_blank": True},
        }

    def validate(self, attrs):
        # Evita duplicar (project, category, version) de forma amigável
        project = attrs.get("project") or getattr(self.instance, "project", None)
        category = attrs.get("category") or getattr(self.instance, "category", None)
        version = attrs.get("version") or getattr(self.instance, "version", 1)

        qs = BudgetItem.objects.filter(project=project, category=category, version=version)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Já existe um orçamento para esta categoria nessa versão do projeto.")
        return attrs
