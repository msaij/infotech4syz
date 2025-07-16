from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from non_public.details_mycompany.models import Company
from non_public.details_clients.models import Client
from non_public.users_mycompany.models import UserProfile
from non_public.products.models import Product, ClientProductAssignment
from non_public.delivery_challan.models import DeliveryChallan
from non_public.queries_mycompany.models import Query
from datetime import date, timedelta

class Command(BaseCommand):
    help = 'Setup test data for the application'

    def handle(self, *args, **options):
        self.stdout.write('Setting up test data...')
        
        # Create Company
        company, created = Company.objects.get_or_create(
            email_domain='4syz.com',
            defaults={
                'name': '4SYZ Infotech',
                'short_name': '4syz',
                'address': '123 Tech Street, Bangalore, India',
                'phone': '+91-9876543210',
                'website': 'https://4syz.com',
                'is_active': True
            }
        )
        if created:
            self.stdout.write(f'Created company: {company.name}')
        else:
            self.stdout.write(f'Company already exists: {company.name}')
        
        # Create Client
        client, created = Client.objects.get_or_create(
            email_domain='linkedin.com',
            defaults={
                'name': 'LinkedIn Corporation',
                'short_name': 'linkedin',
                'company': company,
                'address': '1000 W Maude Ave, Sunnyvale, CA 94085',
                'phone': '+1-555-123-4567',
                'website': 'https://linkedin.com',
                'contact_person': 'John Doe',
                'is_active': True
            }
        )
        if created:
            self.stdout.write(f'Created client: {client.name}')
        else:
            self.stdout.write(f'Client already exists: {client.name}')
        
        # Create Company Admin User
        company_admin_user, created = User.objects.get_or_create(
            username='company_admin',
            defaults={
                'email': 'admin@4syz.com',
                'first_name': 'Company',
                'last_name': 'Admin',
                'is_active': True
            }
        )
        if created:
            company_admin_user.set_password('admin123')
            company_admin_user.save()
            self.stdout.write(f'Created company admin user: {company_admin_user.username}')
        else:
            self.stdout.write(f'Company admin user already exists: {company_admin_user.username}')
        
        # Create Company User Profile
        company_profile, created = UserProfile.objects.get_or_create(
            user=company_admin_user,
            defaults={
                'user_type': 'company',
                'role': 'admin',
                'company': company,
                'phone': '+91-9876543210',
                'department': 'IT',
                'position': 'Administrator',
                'is_active': True
            }
        )
        if created:
            self.stdout.write(f'Created company profile for: {company_admin_user.username}')
        else:
            self.stdout.write(f'Company profile already exists for: {company_admin_user.username}')
        
        # Create Client Admin User
        client_admin_user, created = User.objects.get_or_create(
            username='client_admin',
            defaults={
                'email': 'clientadmin@linkedin.com',
                'first_name': 'Client',
                'last_name': 'Admin',
                'is_active': True
            }
        )
        if created:
            client_admin_user.set_password('client123')
            client_admin_user.save()
            self.stdout.write(f'Created client admin user: {client_admin_user.username}')
        else:
            self.stdout.write(f'Client admin user already exists: {client_admin_user.username}')
        
        # Create Client User Profile
        client_profile, created = UserProfile.objects.get_or_create(
            user=client_admin_user,
            defaults={
                'user_type': 'client',
                'role': 'admin',
                'client': client,
                'phone': '+1-555-123-4567',
                'department': 'IT',
                'position': 'Manager',
                'is_active': True
            }
        )
        if created:
            self.stdout.write(f'Created client profile for: {client_admin_user.username}')
        else:
            self.stdout.write(f'Client profile already exists for: {client_admin_user.username}')
        
        # Create Products
        products_data = [
            {
                'name': 'Laptop Dell XPS 13',
                'description': 'High-performance laptop for professionals',
                'sku': 'LAP-DELL-XPS13',
                'price': 1299.99
            },
            {
                'name': 'Wireless Mouse Logitech MX Master',
                'description': 'Premium wireless mouse with advanced features',
                'sku': 'MOUSE-LOGI-MX',
                'price': 99.99
            },
            {
                'name': 'Mechanical Keyboard Cherry MX',
                'description': 'Professional mechanical keyboard',
                'sku': 'KB-CHERRY-MX',
                'price': 149.99
            }
        ]
        
        for product_data in products_data:
            product, created = Product.objects.get_or_create(
                sku=product_data['sku'],
                defaults={
                    'name': product_data['name'],
                    'description': product_data['description'],
                    'price': product_data['price'],
                    'company': company,
                    'is_active': True
                }
            )
            if created:
                self.stdout.write(f'Created product: {product.name}')
            else:
                self.stdout.write(f'Product already exists: {product.name}')
        
        # Assign products to client
        for product in Product.objects.filter(company=company):
            assignment, created = ClientProductAssignment.objects.get_or_create(
                client=client,
                product=product,
                defaults={
                    'is_active': True,
                    'assigned_by': company_admin_user
                }
            )
            if created:
                self.stdout.write(f'Assigned product {product.name} to client {client.name}')
        
        # Create Delivery Challans
        delivery_data = [
            {
                'challan_number': 'DC-2024-001',
                'product_name': 'Laptop Dell XPS 13',
                'product_sku': 'LAP-DELL-XPS13',
                'quantity': 5,
                'unit_price': 1299.99,
                'delivery_address': 'LinkedIn HQ, 1000 W Maude Ave, Sunnyvale, CA',
                'delivery_date': date.today() + timedelta(days=7),
                'status': 'pending'
            },
            {
                'challan_number': 'DC-2024-002',
                'product_name': 'Wireless Mouse Logitech MX Master',
                'product_sku': 'MOUSE-LOGI-MX',
                'quantity': 20,
                'unit_price': 99.99,
                'delivery_address': 'LinkedIn HQ, 1000 W Maude Ave, Sunnyvale, CA',
                'delivery_date': date.today() + timedelta(days=14),
                'status': 'pending'
            }
        ]
        
        for challan_data in delivery_data:
            challan, created = DeliveryChallan.objects.get_or_create(
                challan_number=challan_data['challan_number'],
                defaults={
                    'company': company,
                    'client': client,
                    'product_name': challan_data['product_name'],
                    'product_sku': challan_data['product_sku'],
                    'quantity': challan_data['quantity'],
                    'unit_price': challan_data['unit_price'],
                    'delivery_address': challan_data['delivery_address'],
                    'delivery_date': challan_data['delivery_date'],
                    'status': challan_data['status'],
                    'created_by': company_admin_user
                }
            )
            if created:
                self.stdout.write(f'Created delivery challan: {challan.challan_number}')
            else:
                self.stdout.write(f'Delivery challan already exists: {challan.challan_number}')
        
        # Create Queries
        queries_data = [
            {
                'title': 'Product Inquiry - Laptop Specifications',
                'description': 'Need detailed specifications for Dell XPS 13 laptop',
                'query_type': 'client',
                'status': 'open',
                'priority': 'medium'
            },
            {
                'title': 'Delivery Schedule Update',
                'description': 'Request to update delivery schedule for order DC-2024-001',
                'query_type': 'client',
                'status': 'in_progress',
                'priority': 'high'
            }
        ]
        
        for query_data in queries_data:
            query, created = Query.objects.get_or_create(
                title=query_data['title'],
                defaults={
                    'description': query_data['description'],
                    'query_type': query_data['query_type'],
                    'status': query_data['status'],
                    'priority': query_data['priority'],
                    'client': client,
                    'created_by': client_admin_user
                }
            )
            if created:
                self.stdout.write(f'Created query: {query.title}')
            else:
                self.stdout.write(f'Query already exists: {query.title}')
        
        self.stdout.write(self.style.SUCCESS('Test data setup completed successfully!'))
        self.stdout.write('\nTest Credentials:')
        self.stdout.write('Company Admin: username=company_admin, password=admin123, email=admin@4syz.com')
        self.stdout.write('Client Admin: username=client_admin, password=client123, email=clientadmin@linkedin.com')
        self.stdout.write('Django Superuser: username=admin, password=admin123, email=admin@4syz.com') 