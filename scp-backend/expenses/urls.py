from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, ExpenseViewSet, VendorViewSet, ProductViewSet

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')  # base no prefixo incluído
router.register(r'', ExpenseViewSet, basename='expense')
router.register(r'vendors', VendorViewSet, basename='vendor')
router.register(r'products', ProductViewSet, basename='product')


urlpatterns = router.urls
