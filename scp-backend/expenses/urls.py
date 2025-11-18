from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, ExpenseViewSet, VendorViewSet, ProductViewSet

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='categories')  # base no prefixo incluído
router.register(r'vendors', VendorViewSet, basename='vendors')
router.register(r'products', ProductViewSet, basename='products')
router.register(r'', ExpenseViewSet, basename='expenses')


urlpatterns = router.urls
