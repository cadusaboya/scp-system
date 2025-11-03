from django.contrib import admin
from .models import Project

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'status', 'estimated_sale_value', 'actual_sale_value', 'cash_balance')
    list_filter = ('type', 'status')
    search_fields = ('name', 'address', 'stage')
