from rest_framework import viewsets, permissions, decorators, response
from .models import Investment
from .serializers import InvestmentSerializer

class InvestmentViewSet(viewsets.ModelViewSet):
    queryset = Investment.objects.all()
    serializer_class = InvestmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    @decorators.action(detail=False, methods=["get"], url_path="mine")
    def mine(self, request):
        """
        Retorna todos os investimentos do usuário autenticado.
        """
        user = request.user
        queryset = Investment.objects.filter(investor__user=user)
        serializer = self.get_serializer(queryset, many=True)
        return response.Response(serializer.data)
