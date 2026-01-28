from django.contrib.auth import get_user_model
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Test, Attempt
from .serializers import (
    TestListSerializer,
    TestDetailSerializer,
    AttemptCreateSerializer,
    AttemptPreviewSerializer,
    AttemptListSerializer,
)
from .auth_serializers import RegisterSerializer, MeSerializer

User = get_user_model()



class TestListAPIView(generics.ListAPIView):
    permission_classes = [AllowAny]
    queryset = Test.objects.all().order_by("id")
    serializer_class = TestListSerializer


class TestDetailAPIView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    queryset = Test.objects.all()
    serializer_class = TestDetailSerializer


class AttemptCreateAPIView(generics.GenericAPIView):
    serializer_class = AttemptCreateSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(
            data=request.data,
            context={"request": request},  
        )
        serializer.is_valid(raise_exception=True)
        result = serializer.save()  
        return Response(result, status=status.HTTP_201_CREATED)


class AttemptPreviewAPIView(generics.GenericAPIView):
    serializer_class = AttemptPreviewSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        result = serializer.save()
        return Response(result, status=status.HTTP_200_OK)


class MyAttemptsAPIView(generics.ListAPIView):
    serializer_class = AttemptListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Attempt.objects
            .filter(user=self.request.user)
            .select_related("test")
            .order_by("-finished_at", "-id")
        )


class RegisterAPIView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class MeAPIView(generics.RetrieveAPIView):
    serializer_class = MeSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user