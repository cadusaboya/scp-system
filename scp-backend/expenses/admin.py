from django.contrib import admin
from .models import Expense, NoteItem, Category, Vendor, Product

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'active')
    list_filter  = ('active',)
    search_fields = ('name',)

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'unit')
    search_fields = ('name',)  # <-- necessário para funcionar bem com autocomplete_fields

class NoteItemInline(admin.TabularInline):
    model = NoteItem
    extra = 1
    autocomplete_fields = ('category', 'product')
    fields = ('category', 'product', 'qty', 'unit_price', 'line_total')
    readonly_fields = ('line_total',)

@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('project', 'number', 'date', 'total', 'vendor')
    list_filter  = ('project', 'date')
    search_fields = ('number', 'project__name', 'vendor__name')
    inlines = [NoteItemInline]


