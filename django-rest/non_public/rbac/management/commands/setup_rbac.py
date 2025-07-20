from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from non_public.rbac.models import Permission, Role, RolePermission, UserRole
from non_public.rbac.permissions import Permissions, Roles


class Command(BaseCommand):
    help = 'Setup initial RBAC permissions, roles, and user assignments.'

    def handle(self, *args, **options):
        self.stdout.write('Setting up RBAC system...')
        
        # Create permissions
        permissions_data = [
            # 4syz permissions
            {'name': 'View 4syz', 'codename': 'foursyz.view_foursyz', 'app_label': 'foursyz'},
            {'name': 'Edit 4syz', 'codename': 'foursyz.edit_foursyz', 'app_label': 'foursyz'},
            
            # User management permissions
            {'name': 'View Users', 'codename': 'users.view_users', 'app_label': 'users'},
            {'name': 'Create Users', 'codename': 'users.create_users', 'app_label': 'users'},
            {'name': 'Edit Users', 'codename': 'users.edit_users', 'app_label': 'users'},
            {'name': 'Delete Users', 'codename': 'users.delete_users', 'app_label': 'users'},
            
            # Client management permissions
            {'name': 'View Clients', 'codename': 'clients.view_clients', 'app_label': 'clients'},
            {'name': 'Create Clients', 'codename': 'clients.create_clients', 'app_label': 'clients'},
            {'name': 'Edit Clients', 'codename': 'clients.edit_clients', 'app_label': 'clients'},
            {'name': 'Delete Clients', 'codename': 'clients.delete_clients', 'app_label': 'clients'},
            
            # Query permissions
            {'name': 'View Queries', 'codename': 'queries.view_queries', 'app_label': 'queries'},
            {'name': 'Create Queries', 'codename': 'queries.create_queries', 'app_label': 'queries'},
            {'name': 'Edit Queries', 'codename': 'queries.edit_queries', 'app_label': 'queries'},
            {'name': 'Resolve Queries', 'codename': 'queries.resolve_queries', 'app_label': 'queries'},
            
            # RBAC permissions
            {'name': 'View Roles', 'codename': 'rbac.view_roles', 'app_label': 'rbac'},
            {'name': 'Create Roles', 'codename': 'rbac.create_roles', 'app_label': 'rbac'},
            {'name': 'Edit Roles', 'codename': 'rbac.edit_roles', 'app_label': 'rbac'},
            {'name': 'Delete Roles', 'codename': 'rbac.delete_roles', 'app_label': 'rbac'},
            {'name': 'Assign Roles', 'codename': 'rbac.assign_roles', 'app_label': 'rbac'},
        ]
        
        permissions = {}
        for perm_data in permissions_data:
            permission, created = Permission.objects.get_or_create(
                codename=perm_data['codename'],
                defaults=perm_data
            )
            permissions[perm_data['codename']] = permission
            if created:
                self.stdout.write(f'Created permission: {permission.name}')
        
        # Create roles
        roles_data = [
            {
                'name': Roles.FOURSYZ_OWNER,
                'role_type': 'foursyz',
                'description': 'Full access to all 4syz features',
                'permissions': list(permissions.keys())  # All permissions
            },
            {
                'name': Roles.FOURSYZ_ADMIN,
                'role_type': 'foursyz',
                'description': 'Admin access to 4syz features',
                'permissions': [
                    'foursyz.view_foursyz', 'foursyz.edit_foursyz',
                    'users.view_users', 'users.create_users', 'users.edit_users',
                    'clients.view_clients', 'clients.create_clients', 'clients.edit_clients',
                    'queries.view_queries', 'queries.create_queries', 'queries.edit_queries', 'queries.resolve_queries',
                    'rbac.view_roles', 'rbac.assign_roles'
                ]
            },
            {
                'name': Roles.FOURSYZ_USER,
                'role_type': 'foursyz',
                'description': 'Basic 4syz user access',
                'permissions': [
                    'foursyz.view_foursyz',
                    'users.view_users',
                    'clients.view_clients',
                    'queries.view_queries', 'queries.create_queries'
                ]
            },
            {
                'name': Roles.CLIENT_ADMIN,
                'role_type': 'client',
                'description': 'Client admin access',
                'permissions': [
                    'queries.view_queries', 'queries.create_queries', 'queries.edit_queries'
                ]
            },
            {
                'name': Roles.CLIENT_USER,
                'role_type': 'client',
                'description': 'Basic client user access',
                'permissions': [
                    'queries.view_queries', 'queries.create_queries'
                ]
            }
        ]
        
        roles = {}
        for role_data in roles_data:
            role, created = Role.objects.get_or_create(
                name=role_data['name'],
                defaults={
                    'role_type': role_data['role_type'],
                    'description': role_data['description']
                }
            )
            roles[role_data['name']] = role
            
            # Clear existing permissions and add new ones
            role.permissions.clear()
            for perm_codename in role_data['permissions']:
                if perm_codename in permissions:
                    RolePermission.objects.create(
                        role=role,
                        permission=permissions[perm_codename]
                    )
            
            if created:
                self.stdout.write(f'Created role: {role.name}')
        
        # Assign roles to existing users
        try:
            # Assign owner role to msaij
            owner_user = User.objects.get(username='msaij')
            owner_role = roles[Roles.FOURSYZ_OWNER]
            UserRole.objects.get_or_create(
                user=owner_user,
                role=owner_role,
                defaults={'assigned_by': owner_user}
            )
            self.stdout.write(f'Assigned {Roles.FOURSYZ_OWNER} role to msaij')
            
            # Assign client admin role to acmeuser
            client_user = User.objects.get(username='acmeuser')
            client_admin_role = roles[Roles.CLIENT_ADMIN]
            UserRole.objects.get_or_create(
                user=client_user,
                role=client_admin_role,
                defaults={'assigned_by': owner_user}
            )
            self.stdout.write(f'Assigned {Roles.CLIENT_ADMIN} role to acmeuser')
            
        except User.DoesNotExist as e:
            self.stdout.write(self.style.WARNING(f'User not found: {e}'))
        
        self.stdout.write(self.style.SUCCESS('RBAC setup completed successfully!')) 