from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from non_public.foursyz.models import Foursyz
from non_public.users_foursyz.models import UserFoursyz
from non_public.clients.models import Client
from non_public.users_clients.models import UserClient
from non_public.queries_4syz.models import Query4syz
from non_public.queries_clients.models import QueryClient


class Command(BaseCommand):
    help = 'Setup initial 4syz company, owner user, and sample data.'

    def handle(self, *args, **options):
        # Create 4syz company (only one allowed)
        if Foursyz.objects.exists():
            self.stdout.write(self.style.WARNING('4syz company already exists.'))
            foursyz = Foursyz.objects.first()
        else:
            foursyz = Foursyz.objects.create(
                name='4syz',
                primary_email_domain='4syz.com',
                secondary_email_domain='',
                address='123 4syz Lane, City',
                phone='+1-555-1234',
                website='https://4syz.com'
            )
            self.stdout.write(self.style.SUCCESS('Created 4syz company.'))

        # Create owner user
        username = 'msaij'
        email = 'msaij@4syz.com'
        password = 'msaij12345'
        if User.objects.filter(username=username).exists():
            user = User.objects.get(username=username)
            self.stdout.write(self.style.WARNING('Owner user already exists.'))
        else:
            user = User.objects.create_user(username=username, email=email, password=password)
            user.is_staff = True
            user.is_superuser = True
            user.save()
            self.stdout.write(self.style.SUCCESS('Created owner user.'))

        # Create UserFoursyz profile
        if UserFoursyz.objects.filter(user=user).exists():
            owner_profile = UserFoursyz.objects.get(user=user)
            self.stdout.write(self.style.WARNING('UserFoursyz profile already exists.'))
        else:
            owner_profile = UserFoursyz.objects.create(user=user, foursyz=foursyz, role='owner')
            self.stdout.write(self.style.SUCCESS('Created UserFoursyz profile for owner.'))

        # Create a sample client
        client_name = 'Acme Corp'
        client_domain = 'acme.com'
        if Client.objects.filter(name=client_name).exists():
            client = Client.objects.get(name=client_name)
            self.stdout.write(self.style.WARNING('Sample client already exists.'))
        else:
            client = Client.objects.create(
                name=client_name,
                primary_email_domain=client_domain,
                secondary_email_domain='',
                address='456 Acme Street, Metropolis',
                phone='+1-555-5678',
                website='https://acme.com',
                contact_person='Jane Doe',
                contact_email='jane.doe@acme.com',
                is_active=True
            )
            self.stdout.write(self.style.SUCCESS('Created sample client.'))

        # Create a sample client user
        client_username = 'acmeuser'
        client_email = 'acmeuser@acme.com'
        client_password = 'acmeuser123'
        if User.objects.filter(username=client_username).exists():
            client_user = User.objects.get(username=client_username)
            self.stdout.write(self.style.WARNING('Sample client user already exists.'))
        else:
            client_user = User.objects.create_user(username=client_username, email=client_email, password=client_password)
            client_user.save()
            self.stdout.write(self.style.SUCCESS('Created sample client user.'))
        if UserClient.objects.filter(user=client_user).exists():
            client_profile = UserClient.objects.get(user=client_user)
            self.stdout.write(self.style.WARNING('UserClient profile already exists.'))
        else:
            client_profile = UserClient.objects.create(user=client_user, client=client, role='admin')
            self.stdout.write(self.style.SUCCESS('Created UserClient profile for sample client user.'))

        # Create a sample 4syz query
        if Query4syz.objects.filter(title='Sample 4syz Query').exists():
            self.stdout.write(self.style.WARNING('Sample 4syz query already exists.'))
        else:
            Query4syz.objects.create(
                title='Sample 4syz Query',
                description='This is a sample query raised by a 4syz user.',
                raised_by=owner_profile,
                assigned_to=owner_profile,
                status='open',
                priority='medium',
                category='General'
            )
            self.stdout.write(self.style.SUCCESS('Created sample 4syz query.'))

        # Create a sample client query
        if QueryClient.objects.filter(title='Sample Client Query').exists():
            self.stdout.write(self.style.WARNING('Sample client query already exists.'))
        else:
            QueryClient.objects.create(
                title='Sample Client Query',
                description='This is a sample query raised by a client user.',
                raised_by=client_profile,
                assigned_to=owner_profile,
                status='open',
                priority='medium',
                category='Support'
            )
            self.stdout.write(self.style.SUCCESS('Created sample client query.'))

        self.stdout.write(self.style.SUCCESS('Initial 4syz setup complete with sample data.')) 