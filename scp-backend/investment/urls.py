from rest_framework.routers import DefaultRouter
from .views import InvestmentViewSet

router = DefaultRouter()
router.register(r"", InvestmentViewSet, basename="investment")

urlpatterns = router.urls
