# budgets/admin.py
from django.contrib import admin
from .models import BudgetItem

@admin.register(BudgetItem)
class BudgetItemAdmin(admin.ModelAdmin):
    list_display  = ("project", "category", "version", "planned_value", "note")
    list_filter   = ("project", "category", "version")
    search_fields = ("project__name", "category__name", "note")
