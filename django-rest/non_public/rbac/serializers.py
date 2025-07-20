from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Permission, Role, RolePermission, UserRole


class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class RoleSerializer(serializers.ModelSerializer):
    permissions = PermissionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Role
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class RoleCreateSerializer(serializers.ModelSerializer):
    permission_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Role
        fields = ['name', 'role_type', 'description', 'is_active', 'permission_ids']
    
    def create(self, validated_data):
        permission_ids = validated_data.pop('permission_ids', [])
        role = super().create(validated_data)
        
        # Add permissions to role
        if permission_ids:
            permissions = Permission.objects.filter(id__in=permission_ids)
            for permission in permissions:
                RolePermission.objects.create(
                    role=role,
                    permission=permission,
                    granted_by=self.context['request'].user
                )
        
        return role


class RolePermissionSerializer(serializers.ModelSerializer):
    permission = PermissionSerializer(read_only=True)
    
    class Meta:
        model = RolePermission
        fields = '__all__'
        read_only_fields = ['granted_at']


class UserRoleSerializer(serializers.ModelSerializer):
    role = RoleSerializer(read_only=True)
    user = serializers.SerializerMethodField()
    
    class Meta:
        model = UserRole
        fields = '__all__'
        read_only_fields = ['assigned_at']
    
    def get_user(self, obj):
        return {
            'id': obj.user.id,
            'username': obj.user.username,
            'email': obj.user.email,
            'first_name': obj.user.first_name,
            'last_name': obj.user.last_name,
        }


class UserRoleCreateSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(write_only=True)
    role_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = UserRole
        fields = ['user_id', 'role_id']
    
    def validate(self, data):
        user_id = data.get('user_id')
        role_id = data.get('role_id')
        
        # Check if user exists
        try:
            user = User.objects.get(id=user_id)
            data['user'] = user
        except User.DoesNotExist:
            raise serializers.ValidationError({'user_id': 'User not found'})
        
        # Check if role exists
        try:
            role = Role.objects.get(id=role_id)
            data['role'] = role
        except Role.DoesNotExist:
            raise serializers.ValidationError({'role_id': 'Role not found'})
        
        # Check if user-role assignment already exists
        if UserRole.objects.filter(user=user, role=role).exists():
            raise serializers.ValidationError('This role is already assigned to this user')
        
        return data
    
    def create(self, validated_data):
        user = validated_data['user']
        role = validated_data['role']
        
        user_role = UserRole.objects.create(
            user=user,
            role=role,
            assigned_by=self.context['request'].user
        )
        
        return user_role 