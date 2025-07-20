from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
import secrets
import string
from .models import UserFoursyz
from non_public.foursyz.serializers import FoursyzSerializer
from non_public.rbac.serializers import RoleSerializer


class UserSerializer(serializers.ModelSerializer):
    roles = serializers.SerializerMethodField()
    permissions = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_active', 'date_joined', 'last_login', 'roles', 'permissions']
    
    def get_roles(self, obj):
        # Get roles for this user
        from non_public.rbac.models import UserRole
        user_roles = UserRole.objects.filter(user=obj)
        return [RoleSerializer(ur.role).data for ur in user_roles]
    
    def get_permissions(self, obj):
        # Get permissions for this user
        from non_public.rbac.models import UserRole, RolePermission
        user_roles = UserRole.objects.filter(user=obj)
        permissions = set()
        for user_role in user_roles:
            role_permissions = RolePermission.objects.filter(role=user_role.role)
            for rp in role_permissions:
                permissions.add(rp.permission.name)
        return list(permissions)


class UserFoursyzSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    foursyz = FoursyzSerializer(read_only=True)
    
    class Meta:
        model = UserFoursyz
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


def generate_secure_password():
    """Generate a secure temporary password"""
    # Generate a password with at least 12 characters including uppercase, lowercase, digits, and symbols
    length = 12
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    
    while True:
        password = ''.join(secrets.choice(alphabet) for _ in range(length))
        # Ensure password meets Django's validation requirements
        try:
            validate_password(password)
            return password
        except ValidationError:
            continue


class UserFoursyzCreateSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True)
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True, required=False)
    first_name = serializers.CharField(write_only=True, required=False)
    last_name = serializers.CharField(write_only=True, required=False)
    roles = serializers.ListField(child=serializers.IntegerField(), write_only=True, required=False)
    generate_password = serializers.BooleanField(write_only=True, default=False)
    
    class Meta:
        model = UserFoursyz
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'role', 'department', 'position', 'phone', 'roles', 'generate_password']
    
    def validate(self, data):
        # Validate email domain for 4syz users
        email = data.get('email', '')
        if email:
            email_domain = email.split('@')[1].lower()
            from non_public.foursyz.models import Foursyz
            foursyz = Foursyz.objects.first()
            if foursyz:
                foursyz_domains = [foursyz.primary_email_domain.lower()]
                if foursyz.secondary_email_domain:
                    foursyz_domains.append(foursyz.secondary_email_domain.lower())
                
                if email_domain not in foursyz_domains:
                    raise serializers.ValidationError(f"Email domain must be one of: {', '.join(foursyz_domains)}")
        
        # Validate password if provided
        password = data.get('password')
        if password and not data.get('generate_password'):
            try:
                validate_password(password)
            except ValidationError as e:
                raise serializers.ValidationError({'password': e.messages})
        
        return data
    
    def create(self, validated_data):
        # Extract role IDs for assignment
        role_ids = validated_data.pop('roles', [])
        generate_password = validated_data.pop('generate_password', False)
        
        # Handle password generation or validation
        if generate_password or 'password' not in validated_data:
            password = generate_secure_password()
            # Store the generated password temporarily for response
            self.generated_password = password
        else:
            password = validated_data.pop('password')
        
        user_data = {
            'username': validated_data.pop('username'),
            'email': validated_data.pop('email'),
            'password': password,
            'first_name': validated_data.pop('first_name', ''),
            'last_name': validated_data.pop('last_name', ''),
        }
        
        user = User.objects.create_user(**user_data)
        validated_data['user'] = user
        
        # Automatically assign the foursyz company (assuming there's only one)
        if 'foursyz' not in validated_data:
            from non_public.foursyz.models import Foursyz
            foursyz = Foursyz.objects.first()
            if foursyz:
                validated_data['foursyz'] = foursyz
            else:
                raise serializers.ValidationError("No 4syz company found in the system")
        
        # Create the UserFoursyz instance
        user_foursyz = super().create(validated_data)
        
        # Assign roles to the user
        if role_ids:
            from non_public.rbac.models import Role, UserRole
            roles = Role.objects.filter(id__in=role_ids)
            for role in roles:
                UserRole.objects.create(user=user, role=role)
        
        return user_foursyz
    
    def to_representation(self, instance):
        """Add generated password to response if it was generated"""
        data = super().to_representation(instance)
        if hasattr(self, 'generated_password'):
            data['generated_password'] = self.generated_password
            data['password_change_required'] = True
        return data


class UserFoursyzUpdateSerializer(serializers.ModelSerializer):
    username = serializers.CharField(read_only=True)  # Username cannot be changed
    email = serializers.EmailField()
    first_name = serializers.CharField(required=False)
    last_name = serializers.CharField(required=False)
    is_active = serializers.BooleanField(required=False)
    roles = serializers.ListField(child=serializers.IntegerField(), write_only=True, required=False)
    new_password = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = UserFoursyz
        fields = ['username', 'email', 'first_name', 'last_name', 'role', 'department', 'position', 'phone', 'is_active', 'roles', 'new_password']
    
    def validate_new_password(self, value):
        """Validate new password if provided"""
        if value:
            try:
                validate_password(value)
            except ValidationError as e:
                raise serializers.ValidationError(e.messages)
        return value
    
    def update(self, instance, validated_data):
        # Extract role IDs for assignment
        role_ids = validated_data.pop('roles', None)
        new_password = validated_data.pop('new_password', None)
        
        # Update user fields
        user = instance.user
        if 'email' in validated_data:
            user.email = validated_data.pop('email')
        if 'first_name' in validated_data:
            user.first_name = validated_data.pop('first_name')
        if 'last_name' in validated_data:
            user.last_name = validated_data.pop('last_name')
        if 'is_active' in validated_data:
            user.is_active = validated_data.pop('is_active')
        
        # Update password if provided
        if new_password:
            user.set_password(new_password)
        
        user.save()
        
        # Update UserFoursyz instance
        user_foursyz = super().update(instance, validated_data)
        
        # Update roles if provided
        if role_ids is not None:
            from non_public.rbac.models import Role, UserRole
            # Remove existing roles
            UserRole.objects.filter(user=user).delete()
            # Assign new roles
            roles = Role.objects.filter(id__in=role_ids)
            for role in roles:
                UserRole.objects.create(user=user, role=role)
        
        return user_foursyz 