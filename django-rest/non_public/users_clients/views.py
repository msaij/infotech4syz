from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import UserClient
from .serializers import UserClientSerializer, UserClientCreateSerializer


class UserClientViewSet(viewsets.ModelViewSet):
    queryset = UserClient.objects.all()
    serializer_class = UserClientSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return UserClientCreateSerializer
        return UserClientSerializer

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user's client profile"""
        try:
            profile = UserClient.objects.get(user=request.user)
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        except UserClient.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND) 