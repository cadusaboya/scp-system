from django.db import models
from investors.models import Investor
from projects.models import Project

class Investment(models.Model):
    investor = models.ForeignKey(Investor, on_delete=models.CASCADE, related_name="investments")
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="investments")
    value = models.DecimalField(max_digits=14, decimal_places=2)
    date = models.DateField(auto_now_add=True)
    note = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ["-date"]
        indexes = [
            models.Index(fields=["investor", "project"]),
        ]

    def __str__(self):
        return f"{self.investor.name} → {self.project.name} ({self.value})"
