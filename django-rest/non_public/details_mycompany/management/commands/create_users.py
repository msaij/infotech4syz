from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from non_public.details_mycompany.models import details_mycompany as Company
from non_public.details_clients.models import details_clients as Client
from non_public.users_mycompany.models import users_mycompany as UserProfile
import getpass

class Command(BaseCommand):
    help = 'Create users for company and client with proper validation'

    def add_arguments(self, parser):
        parser.add_argument(
            '--company-user',
            action='store_true',
            help='Create a company user',
        )
        parser.add_argument(
            '--client-user',
            action='store_true',
            help='Create a client user',
        )
        parser.add_argument(
            '--username',
            type=str,
            help='Username for the new user',
        )
        parser.add_argument(
            '--email',
            type=str,
            help='Email for the new user',
        )
        parser.add_argument(
            '--first-name',
            type=str,
            help='First name for the new user',
        )
        parser.add_argument(
            '--last-name',
            type=str,
            help='Last name for the new user',
        )
        parser.add_argument(
            '--role',
            type=str,
            choices=['admin', 'manager', 'user', 'viewer'],
            default='user',
            help='Role for the new user (default: user)',
        )
        parser.add_argument(
            '--client-domain',
            type=str,
            help='Client email domain (required for client users)',
        )
        parser.add_argument(
            '--phone',
            type=str,
            help='Phone number for the user',
        )
        parser.add_argument(
            '--department',
            type=str,
            help='Department for the user',
        )
        parser.add_argument(
            '--position',
            type=str,
            help='Position for the user',
        )
        parser.add_argument(
            '--password',
            type=str,
            help='Password for the user (will prompt if not provided)',
        )

    def handle(self, *args, **options):
        if not options['company_user'] and not options['client_user']:
            self.stdout.write(self.style.ERROR('Please specify --company-user or --client-user'))
            return

        if options['company_user']:
            self.create_company_user(options)
        
        if options['client_user']:
            self.create_client_user(options)

    def create_company_user(self, options):
        """Create a company user"""
        self.stdout.write('Creating company user...')
        
        # Get or create the default company
        try:
            company = Company.objects.filter(is_permanent=True).first()
            if not company:
                company = Company.objects.first()
            if not company:
                raise CommandError('No company found. Please create a company first.')
        except Company.DoesNotExist:
            raise CommandError('No company found. Please create a company first.')

        # Get user details
        username = options['username'] or input('Username: ')
        email = options['email'] or input('Email: ')
        first_name = options['first_name'] or input('First Name: ')
        last_name = options['last_name'] or input('Last Name: ')
        role = options['role']
        phone = options['phone'] or input('Phone (optional): ')
        department = options['department'] or input('Department (optional): ')
        position = options['position'] or input('Position (optional): ')
        password = options['password'] or getpass.getpass('Password: ')

        # Validate email domain
        if not email.endswith(f'@{company.email_domain}'):
            raise CommandError(f'Email must be from {company.email_domain} domain')

        # Create user
        try:
            user = User.objects.create_user(
                username=username,
                email=email,
                first_name=first_name,
                last_name=last_name,
                password=password
            )
            
            # Create user profile
            profile = UserProfile.objects.create(
                user=user,
                user_type='company',
                role=role,
                company=company,
                phone=phone,
                department=department,
                position=position,
                is_active=True
            )
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'Successfully created company user: {username} ({email}) with role: {role}'
                )
            )
            
        except Exception as e:
            if User.objects.filter(username=username).exists():
                self.stdout.write(self.style.ERROR(f'User with username {username} already exists'))
            elif User.objects.filter(email=email).exists():
                self.stdout.write(self.style.ERROR(f'User with email {email} already exists'))
            else:
                self.stdout.write(self.style.ERROR(f'Error creating user: {str(e)}'))

    def create_client_user(self, options):
        """Create a client user"""
        self.stdout.write('Creating client user...')
        
        # Get client domain
        client_domain = options['client_domain'] or input('Client email domain (e.g., linkedin.com): ')
        
        # Find the client
        try:
            client = Client.objects.get(email_domain=client_domain)
        except Client.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'Client with domain {client_domain} not found'))
            self.stdout.write('Available clients:')
            for c in Client.objects.all():
                self.stdout.write(f'  - {c.name} ({c.email_domain})')
            return

        # Get user details
        username = options['username'] or input('Username: ')
        email = options['email'] or input('Email: ')
        first_name = options['first_name'] or input('First Name: ')
        last_name = options['last_name'] or input('Last Name: ')
        role = options['role']
        phone = options['phone'] or input('Phone (optional): ')
        department = options['department'] or input('Department (optional): ')
        position = options['position'] or input('Position (optional): ')
        password = options['password'] or getpass.getpass('Password: ')

        # Validate email domain
        if not email.endswith(f'@{client.email_domain}'):
            raise CommandError(f'Email must be from {client.email_domain} domain')

        # Create user
        try:
            user = User.objects.create_user(
                username=username,
                email=email,
                first_name=first_name,
                last_name=last_name,
                password=password
            )
            
            # Create user profile
            profile = UserProfile.objects.create(
                user=user,
                user_type='client',
                role=role,
                client=client,
                phone=phone,
                department=department,
                position=position,
                is_active=True
            )
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'Successfully created client user: {username} ({email}) for {client.name} with role: {role}'
                )
            )
            
        except Exception as e:
            if User.objects.filter(username=username).exists():
                self.stdout.write(self.style.ERROR(f'User with username {username} already exists'))
            elif User.objects.filter(email=email).exists():
                self.stdout.write(self.style.ERROR(f'User with email {email} already exists'))
            else:
                self.stdout.write(self.style.ERROR(f'Error creating user: {str(e)}')) 