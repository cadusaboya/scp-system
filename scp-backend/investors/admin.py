# investors/admin.py
from django.contrib import admin
from .models import Investor
from investment.models import Investment

class InvestmentInline(admin.TabularInline):
    model = Investment
    extra = 1
    autocomplete_fields = ("project",)  # escolhe o projeto do aporte
    fields = ("project", "value", "note")

@admin.register(Investor)
class InvestorAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "cpf")
    search_fields = ("name", "email", "cpf")
    inlines = [InvestmentInline]
