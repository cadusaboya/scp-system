from django.contrib.auth.models import User
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db import transaction
from .models import Investor
from rest_framework import viewsets, permissions, decorators, response, status
from .serializers import InvestorSerializer

class InvestorViewSet(viewsets.ModelViewSet):
    queryset = Investor.objects.all()
    serializer_class = InvestorSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Apenas administradores podem ver todos os investidores
        user = self.request.user
        if user.is_staff:
            return Investor.objects.all()
        return Investor.objects.filter(user=user)

    @decorators.action(detail=False, methods=["get"], url_path="me")
    def me(self, request):
        """Retorna os dados do investidor logado"""
        try:
            investor = Investor.objects.get(user=request.user)
        except Investor.DoesNotExist:
            return response.Response(
                {"error": "Perfil de investidor não encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = self.get_serializer(investor)
        return response.Response(serializer.data)


@api_view(['POST'])
@transaction.atomic
def register(request):
    username = request.data.get("username")
    password = request.data.get("password")
    email = request.data.get("email", "")

    if not username or not password:
        return Response({"error": "Usuário e senha são obrigatórios."}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({"error": "Usuário já existe."}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(username=username, password=password, email=email)

    # cria o perfil Investor ligado ao User
    Investor.objects.create(
        user=user,
        name=username,
        email=email,
        cpf=""  # ou pegue do request se já estiver enviando
    )

    return Response({"message": "Usuário e investidor criados com sucesso."}, status=status.HTTP_201_CREATED)