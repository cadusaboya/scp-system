from django.db import models
from projects.models import Project
from django.core.exceptions import ValidationError

CATEGORIES = [
    "Mão de Obra",
    "Material",
    "Aquisição",
    "Custas Cartoriais",
    "Custos Imobiliária",
    "Projetos e Licenças",
    "Ferramentas e Equipamentos",
    "Frete e Transporte",
    "Administração da Obra",
    "Diversos / Contingência",
]

class Category(models.Model):
    name  = models.CharField(max_length=120, unique=True)
    active = models.BooleanField(default=True)

    class Meta:
        ordering = ['name']

    def clean(self):
        if self.name not in CATEGORIES:
            raise ValidationError(f"Categoria '{self.name}' não é permitida.")

    def save(self, *args, **kwargs):
        self.full_clean()  # força validar antes de salvar
        return super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class Vendor(models.Model):
    name = models.CharField(max_length=150)
    doc  = models.CharField(max_length=20, null=True, blank=True)  # CNPJ/CPF
    def __str__(self): return self.name

class Expense(models.Model):  # Nota
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="expenses")
    vendor  = models.ForeignKey(Vendor, on_delete=models.SET_NULL, null=True, blank=True)
    number = models.CharField(max_length=40, blank=True)
    date  = models.DateField(null=True, blank=True)
    total  = models.DecimalField(max_digits=14, decimal_places=2, default=0)  # denormalizado
    attachment_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date', '-id']

    def __str__(self): return f"Nota {self.number or self.id} ({self.project})"

class Product(models.Model):  # opcional, ajuda no autocomplete
    name = models.CharField(max_length=150)
    unit = models.CharField(max_length=10, default="un")
    def __str__(self): return self.name

class NoteItem(models.Model):  # Item da nota
    expense  = models.ForeignKey(Expense, on_delete=models.CASCADE, related_name="items")
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="items")
    product  = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True)
    qty         = models.DecimalField(max_digits=12, decimal_places=3, default=1)
    unit_price  = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    line_total  = models.DecimalField(max_digits=14, decimal_places=2, default=0)

    def save(self, *args, **kwargs):
        self.line_total = (self.qty or 0) * (self.unit_price or 0)
        super().save(*args, **kwargs)