# expenses/signals.py
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db.models import Sum
from .models import NoteItem

@receiver([post_save, post_delete], sender=NoteItem)
def update_expense_total(sender, instance, **kwargs):
    expense = instance.expense
    total = expense.items.aggregate(total=Sum("line_total"))["total"] or 0
    expense.total = total
    expense.save(update_fields=["total"])
