from rest_framework import viewsets, permissions
from .models import Expense, NoteItem, Category, Vendor, Product
from .serializers import ExpenseSerializer, NoteItemSerializer, CategorySerializer, VendorSerializer, ProductSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

class VendorViewSet(viewsets.ModelViewSet):
    queryset = Vendor.objects.all()
    serializer_class = VendorSerializer
    permission_classes = [permissions.IsAuthenticated]

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.all().select_related('project', 'vendor').prefetch_related('items')
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        project = self.request.query_params.get('project')
        if project:
            qs = qs.filter(project_id=project)
        return qs

    @action(detail=False, methods=['get'], url_path='sum-by-category')
    def sum_by_category(self, request):
        project = request.query_params.get('project')
        qs = NoteItem.objects.all()
        if project:
            qs = qs.filter(expense__project_id=project)
        data = (qs.values('category__id', 'category__name')
                  .annotate(total=Sum('line_total'))
                  .order_by('category__name'))
        return Response(list(data))

