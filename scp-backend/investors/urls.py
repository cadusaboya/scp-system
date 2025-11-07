from rest_framework.routers import DefaultRouter
from .views import InvestorViewSet

router = DefaultRouter()
router.register(r"", InvestorViewSet, basename="investor")

urlpatterns = router.urls
