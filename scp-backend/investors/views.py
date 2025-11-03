from django.contrib.auth.models import User
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from .models import Investor


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