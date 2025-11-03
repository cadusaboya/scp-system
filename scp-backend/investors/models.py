from django.db import models
from django.contrib.auth.models import User

class Investor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='investor')
    name = models.CharField(max_length=200)
    email = models.EmailField(null=True, blank=True)
    cpf = models.CharField(max_length=14, null=True, blank=True)  # 000.000.000-00

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
