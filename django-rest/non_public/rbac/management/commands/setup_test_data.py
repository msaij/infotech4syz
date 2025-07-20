from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from non_public.foursyz.models import Foursyz
from non_public.clients.models import Client
from non_public.users_foursyz.models import UserFoursyz
from non_public.users_clients.models import UserClient
from non_public.rbac.models import Role, Permission, UserRole
from django.db import transaction


class Command(BaseCommand):
    help = 'Setup test data with different user roles and clients'

    def handle(self, *args, **options):
        with transaction.atomic():
            self.stdout.write('Setting up test data...')
            
            # Get or create 4syz company
            foursyz = Foursyz.objects.first()
            if not foursyz:
                foursyz = Foursyz.objects.create(
                    name='4syz Solutions',
                    primary_email_domain='4syz.com',
                    secondary_email_domain='4syz.net',
                    phone='+1-555-123-4567',
                    website='https://4syz.com',
                    address='123 Tech Street, Silicon Valley, CA 94025'
                )
                self.stdout.write('Created 4syz company')
            else:
                # Update existing record
                foursyz.name = '4syz Solutions'
                foursyz.primary_email_domain = '4syz.com'
                foursyz.secondary_email_domain = '4syz.net'
                foursyz.phone = '+1-555-123-4567'
                foursyz.website = 'https://4syz.com'
                foursyz.address = '123 Tech Street, Silicon Valley, CA 94025'
                foursyz.save()
                self.stdout.write('Updated existing 4syz company')
            
            # Create test clients
            clients_data = [
                {
                    'name': 'Acme Corporation',
                    'primary_email_domain': 'acme.com',
                    'secondary_email_domain': 'acme.net',
                    'contact_person': 'John Smith',
                    'contact_email': 'john.smith@acme.com',
                    'phone': '+1-555-111-1111',
                    'website': 'https://acme.com',
                    'address': '456 Business Ave, New York, NY 10001',
                    'is_active': True
                },
                {
                    'name': 'TechStart Inc',
                    'primary_email_domain': 'techstart.com',
                    'secondary_email_domain': '',
                    'contact_person': 'Sarah Johnson',
                    'contact_email': 'sarah.johnson@techstart.com',
                    'phone': '+1-555-222-2222',
                    'website': 'https://techstart.com',
                    'address': '789 Innovation Blvd, Austin, TX 73301',
                    'is_active': True
                },
                {
                    'name': 'Global Solutions Ltd',
                    'primary_email_domain': 'globalsolutions.com',
                    'secondary_email_domain': 'gs.com',
                    'contact_person': 'Michael Brown',
                    'contact_email': 'michael.brown@globalsolutions.com',
                    'phone': '+1-555-333-3333',
                    'website': 'https://globalsolutions.com',
                    'address': '321 Corporate Plaza, Chicago, IL 60601',
                    'is_active': False  # Inactive client for testing
                }
            ]
            
            created_clients = []
            for client_data in clients_data:
                client, created = Client.objects.get_or_create(
                    name=client_data['name'],
                    defaults=client_data
                )
                created_clients.append(client)
                if created:
                    self.stdout.write(f'Created client: {client.name}')
            
            # Create test 4syz users with different roles
            foursyz_users_data = [
                {
                    'username': 'msaij',
                    'email': 'msaij@4syz.com',
                    'first_name': 'Mohammed',
                    'last_name': 'Saij',
                    'role': 'owner',
                    'department': 'Executive',
                    'position': 'CEO & Owner',
                    'phone': '+1-555-000-0001',
                    'is_active': True,
                    'password': 'msaij12345'
                },
                {
                    'username': 'admin',
                    'email': 'admin@4syz.com',
                    'first_name': 'Admin',
                    'last_name': 'User',
                    'role': 'admin',
                    'department': 'IT',
                    'position': 'System Administrator',
                    'phone': '+1-555-000-0002',
                    'is_active': True,
                    'password': 'admin123'
                },
                {
                    'username': 'manager',
                    'email': 'manager@4syz.com',
                    'first_name': 'Jane',
                    'last_name': 'Manager',
                    'role': 'user',
                    'department': 'Operations',
                    'position': 'Operations Manager',
                    'phone': '+1-555-000-0003',
                    'is_active': True,
                    'password': 'manager123'
                },
                {
                    'username': 'inactive_user',
                    'email': 'inactive@4syz.com',
                    'first_name': 'Inactive',
                    'last_name': 'User',
                    'role': 'user',
                    'department': 'Support',
                    'position': 'Support Specialist',
                    'phone': '+1-555-000-0004',
                    'is_active': False,  # Inactive user for testing
                    'password': 'inactive123'
                }
            ]
            
            for user_data in foursyz_users_data:
                user, created = User.objects.get_or_create(
                    username=user_data['username'],
                    defaults={
                        'email': user_data['email'],
                        'first_name': user_data['first_name'],
                        'last_name': user_data['last_name'],
                        'is_active': user_data['is_active']
                    }
                )
                
                if created:
                    user.set_password(user_data['password'])
                    user.save()
                
                # Update user if exists
                if not created:
                    user.email = user_data['email']
                    user.first_name = user_data['first_name']
                    user.last_name = user_data['last_name']
                    user.is_active = user_data['is_active']
                    user.save()
                
                # Create or update UserFoursyz profile
                user_foursyz, created = UserFoursyz.objects.get_or_create(
                    user=user,
                    defaults={
                        'foursyz': foursyz,
                        'role': user_data['role'],
                        'department': user_data['department'],
                        'position': user_data['position'],
                        'phone': user_data['phone'],
                        'is_active': user_data['is_active']
                    }
                )
                
                if not created:
                    user_foursyz.role = user_data['role']
                    user_foursyz.department = user_data['department']
                    user_foursyz.position = user_data['position']
                    user_foursyz.phone = user_data['phone']
                    user_foursyz.is_active = user_data['is_active']
                    user_foursyz.save()
                
                # Assign RBAC roles based on UserFoursyz role
                if user_data['role'] == 'owner':
                    rbac_role = Role.objects.get(name='4syz Owner')
                elif user_data['role'] == 'admin':
                    rbac_role = Role.objects.get(name='4syz Admin')
                else:
                    rbac_role = Role.objects.get(name='4syz User')
                
                UserRole.objects.get_or_create(
                    user=user,
                    role=rbac_role,
                    defaults={'is_active': user_data['is_active']}
                )
                
                if created:
                    self.stdout.write(f'Created 4syz user: {user.username} ({user_data["role"]})')
            
            # Create test client users
            client_users_data = [
                {
                    'username': 'acmeuser',
                    'email': 'acmeuser@acme.com',
                    'first_name': 'Acme',
                    'last_name': 'User',
                    'role': 'admin',
                    'department': 'IT',
                    'position': 'IT Manager',
                    'phone': '+1-555-111-1112',
                    'is_active': True,
                    'password': 'acmeuser123',
                    'client': 'Acme Corporation'
                },
                {
                    'username': 'acmeemployee',
                    'email': 'employee@acme.com',
                    'first_name': 'John',
                    'last_name': 'Employee',
                    'role': 'user',
                    'department': 'Sales',
                    'position': 'Sales Representative',
                    'phone': '+1-555-111-1113',
                    'is_active': True,
                    'password': 'employee123',
                    'client': 'Acme Corporation'
                },
                {
                    'username': 'techstart_admin',
                    'email': 'admin@techstart.com',
                    'first_name': 'TechStart',
                    'last_name': 'Admin',
                    'role': 'admin',
                    'department': 'Management',
                    'position': 'CTO',
                    'phone': '+1-555-222-2223',
                    'is_active': True,
                    'password': 'techstart123',
                    'client': 'TechStart Inc'
                },
                {
                    'username': 'gs_user',
                    'email': 'user@globalsolutions.com',
                    'first_name': 'Global',
                    'last_name': 'User',
                    'role': 'user',
                    'department': 'Operations',
                    'position': 'Operations Specialist',
                    'phone': '+1-555-333-3334',
                    'is_active': False,  # Inactive user for testing
                    'password': 'gsuser123',
                    'client': 'Global Solutions Ltd'
                }
            ]
            
            for user_data in client_users_data:
                user, created = User.objects.get_or_create(
                    username=user_data['username'],
                    defaults={
                        'email': user_data['email'],
                        'first_name': user_data['first_name'],
                        'last_name': user_data['last_name'],
                        'is_active': user_data['is_active']
                    }
                )
                
                if created:
                    user.set_password(user_data['password'])
                    user.save()
                
                # Update user if exists
                if not created:
                    user.email = user_data['email']
                    user.first_name = user_data['first_name']
                    user.last_name = user_data['last_name']
                    user.is_active = user_data['is_active']
                    user.save()
                
                # Get the client
                client = Client.objects.get(name=user_data['client'])
                
                # Create or update UserClient profile
                user_client, created = UserClient.objects.get_or_create(
                    user=user,
                    defaults={
                        'client': client,
                        'role': user_data['role'],
                        'department': user_data['department'],
                        'position': user_data['position'],
                        'phone': user_data['phone'],
                        'is_active': user_data['is_active']
                    }
                )
                
                if not created:
                    user_client.role = user_data['role']
                    user_client.department = user_data['department']
                    user_client.position = user_data['position']
                    user_client.phone = user_data['phone']
                    user_client.is_active = user_data['is_active']
                    user_client.save()
                
                # Assign RBAC roles based on UserClient role
                if user_data['role'] == 'admin':
                    rbac_role = Role.objects.get(name='Client Admin')
                else:
                    rbac_role = Role.objects.get(name='Client User')
                
                UserRole.objects.get_or_create(
                    user=user,
                    role=rbac_role,
                    defaults={'is_active': user_data['is_active']}
                )
                
                if created:
                    self.stdout.write(f'Created client user: {user.username} ({user_data["role"]}) for {user_data["client"]}')
            
            self.stdout.write(
                self.style.SUCCESS('Successfully set up test data!')
            )
            
            # Print summary
            self.stdout.write('\nTest Data Summary:')
            self.stdout.write(f'- 4syz Users: {UserFoursyz.objects.count()}')
            self.stdout.write(f'- Client Users: {UserClient.objects.count()}')
            self.stdout.write(f'- Clients: {Client.objects.count()}')
            self.stdout.write(f'- Total Users: {User.objects.count()}')
            
            self.stdout.write('\nTest Credentials:')
            self.stdout.write('4syz Users:')
            self.stdout.write('- Owner: msaij / msaij12345')
            self.stdout.write('- Admin: admin / admin123')
            self.stdout.write('- User: manager / manager123')
            self.stdout.write('- Inactive: inactive_user / inactive123')
            
            self.stdout.write('\nClient Users:')
            self.stdout.write('- Acme Admin: acmeuser / acmeuser123')
            self.stdout.write('- Acme User: acmeemployee / employee123')
            self.stdout.write('- TechStart Admin: techstart_admin / techstart123')
            self.stdout.write('- GS User (Inactive): gs_user / gsuser123') 