from rest_framework import serializers
from .models import Investor

class InvestorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Investor
        fields = [
            "id",
            "name",
            "email",
            "cpf",
            "created_at",
        ]
