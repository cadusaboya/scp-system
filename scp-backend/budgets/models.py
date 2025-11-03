from django.db import models
from projects.models import Project
from expenses.models import Category

class BudgetItem(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="budget_items")
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="budget_items")
    planned_value = models.DecimalField(max_digits=14, decimal_places=2)
    version = models.PositiveIntegerField(default=1)
    note = models.CharField(max_length=255, blank=True)

    class Meta:
        unique_together = ("project", "category", "version")
        ordering = ["project_id", "category_id", "-version"]

    def __str__(self):
        return f"{self.project} · {self.category} · v{self.version} = {self.planned_value}"
