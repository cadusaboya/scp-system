from rest_framework import viewsets, permissions
from .models import Investment
from .serializers import InvestmentSerializer

class InvestmentViewSet(viewsets.ModelViewSet):
    queryset = Investment.objects.all()
    serializer_class = InvestmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # Garante que o investidor é o do usuário logado
        investor = getattr(self.request.user, "investor", None)
        serializer.save(investor=investor)
