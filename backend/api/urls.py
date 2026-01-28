from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import (
    MeAPIView,
    RegisterAPIView,

    TestListAPIView,
    TestDetailAPIView,

    AttemptCreateAPIView,
    AttemptPreviewAPIView,
    MyAttemptsAPIView,
)

urlpatterns = [

    path("auth/login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/register/", RegisterAPIView.as_view(), name="register"),
    path("auth/me/", MeAPIView.as_view(), name="me"),

    path("tests/", TestListAPIView.as_view(), name="test_list"),
    path("tests/<int:pk>/", TestDetailAPIView.as_view(), name="test_detail"),

    path("attempts/", AttemptCreateAPIView.as_view(), name="attempt_create"),
    path("attempts", AttemptCreateAPIView.as_view(), name="attempt_create_noslash"),

    path("attempts/preview/", AttemptPreviewAPIView.as_view(), name="attempt_preview"),
    path("attempts/preview", AttemptPreviewAPIView.as_view(), name="attempt_preview_noslash"),

    path("attempts/my/", MyAttemptsAPIView.as_view(), name="my_attempts"),
    path("attempts/my", MyAttemptsAPIView.as_view(), name="my_attempts_noslash"),
]