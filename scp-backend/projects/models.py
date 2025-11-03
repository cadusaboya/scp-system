from django.db import models

class Project(models.Model):
    class ProjectType(models.TextChoices):
        LEILAO = "leilao", "Leilão"
        CONSTRUCAO = "construcao", "Construção"
        REFORMA = "reforma", "Reforma"

    class ProjectStatus(models.TextChoices):
        PLANEJADO = "planejado", "Planejado"
        EM_OBRA = "em_obra", "Em obra"
        A_VENDA = "a_venda", "À venda"
        VENDIDO = "vendido", "Vendido"
        ENCERRADO = "encerrado", "Encerrado"

    name = models.CharField(max_length=200)
    type = models.CharField(max_length=20, choices=ProjectType.choices)
    status = models.CharField(max_length=20, choices=ProjectStatus.choices, default=ProjectStatus.PLANEJADO)

    stage = models.CharField(max_length=100, null=True, blank=True)  # etapa livre (ex.: Fundação, Acabamento)
    address = models.CharField(max_length=255, blank=True)

    start_date = models.DateField(null=True, blank=True)
    expected_end_date = models.DateField(null=True, blank=True)
    sold_date = models.DateField(null=True, blank=True)

    cash_balance = models.DecimalField(max_digits=14, decimal_places=2, default=0)  # “Caixa”
    estimated_sale_value = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    actual_sale_value = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)

    # meta/observações
    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name
