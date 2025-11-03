# investment/admin.py
from django.contrib import admin
from .models import Investment

@admin.register(Investment)
class InvestmentAdmin(admin.ModelAdmin):
    list_display = ("date", "investor", "project", "value", "note")
    list_filter = ("project", "investor", "date")
    search_fields = (
        "investor__name", "investor__cpf",
        "project__name",
    )
    autocomplete_fields = ("investor", "project")
    date_hierarchy = "date"
