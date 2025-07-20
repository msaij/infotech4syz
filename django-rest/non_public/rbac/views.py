from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import Permission, Role, RolePermission, UserRole
from .serializers import (
    PermissionSerializer, RoleSerializer, RoleCreateSerializer,
    RolePermissionSerializer, UserRoleSerializer, UserRoleCreateSerializer
)
from .permissions import has_permission, get_user_roles, get_user_permissions


class PermissionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if not has_permission(self.request.user, 'rbac.view_permissions'):
            return Permission.objects.none()
        return super().get_queryset()


class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return RoleCreateSerializer
        return RoleSerializer

    def get_queryset(self):
        if not has_permission(self.request.user, 'rbac.view_roles'):
            return Role.objects.none()
        return super().get_queryset()

    def create(self, request, *args, **kwargs):
        if not has_permission(request.user, 'rbac.create_roles'):
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        if not has_permission(request.user, 'rbac.edit_roles'):
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if not has_permission(request.user, 'rbac.delete_roles'):
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """Get roles by type (foursyz or client)"""
        role_type = request.query_params.get('type')
        if role_type:
            roles = Role.objects.filter(role_type=role_type, is_active=True)
            serializer = self.get_serializer(roles, many=True)
            return Response(serializer.data)
        return Response({'error': 'Type parameter required'}, status=status.HTTP_400_BAD_REQUEST)


class UserRoleViewSet(viewsets.ModelViewSet):
    queryset = UserRole.objects.all()
    serializer_class = UserRoleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return UserRoleCreateSerializer
        return UserRoleSerializer

    def get_queryset(self):
        if not has_permission(self.request.user, 'rbac.view_user_roles'):
            return UserRole.objects.none()
        return super().get_queryset()

    def create(self, request, *args, **kwargs):
        if not has_permission(request.user, 'rbac.assign_roles'):
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user_role = serializer.save(assigned_by=request.user)
            
            # Return the created user role with full details
            response_serializer = UserRoleSerializer(user_role)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        if not has_permission(request.user, 'rbac.assign_roles'):
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            user_role = serializer.save()
            
            # Return the updated user role with full details
            response_serializer = UserRoleSerializer(user_role)
            return Response(response_serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        if not has_permission(request.user, 'rbac.assign_roles'):
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            instance = self.get_object()
            instance.delete()
            return Response({'message': 'Role assignment removed successfully'}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def my_roles(self, request):
        """Get current user's roles"""
        try:
            roles = get_user_roles(request.user)
            return Response({'roles': roles})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def my_permissions(self, request):
        """Get current user's permissions"""
        try:
            permissions = get_user_permissions(request.user)
            return Response({'permissions': permissions})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def by_user(self, request):
        """Get roles for a specific user"""
        user_id = request.query_params.get('user_id')
        if user_id:
            try:
                user_roles = UserRole.objects.filter(user_id=user_id, is_active=True)
                serializer = self.get_serializer(user_roles, many=True)
                return Response(serializer.data)
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'error': 'User ID parameter required'}, status=status.HTTP_400_BAD_REQUEST) 