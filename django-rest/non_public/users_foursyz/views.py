from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import UserFoursyz
from .serializers import UserFoursyzSerializer, UserFoursyzCreateSerializer, UserFoursyzUpdateSerializer


class UserFoursyzViewSet(viewsets.ModelViewSet):
    queryset = UserFoursyz.objects.all()
    serializer_class = UserFoursyzSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Add permission check for listing users
        if self.action == 'list':
            from non_public.rbac.permissions import has_permission
            if not has_permission(self.request.user, 'users.view_users'):
                return UserFoursyz.objects.none()
        return super().get_queryset()

    def get_serializer_class(self):
        if self.action == 'create':
            return UserFoursyzCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return UserFoursyzUpdateSerializer
        return UserFoursyzSerializer

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user's 4syz profile"""
        try:
            profile = UserFoursyz.objects.get(user=request.user)
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        except UserFoursyz.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

 