from django.core.management.base import BaseCommand
from non_public.details_mycompany.models import details_mycompany
from non_public.users_mycompany.models import users_mycompany
from django.contrib.auth.models import User

class Command(BaseCommand):
    help = 'Check company data and user profiles'

    def handle(self, *args, **options):
        self.stdout.write("=== Checking Company Data ===")
        
        # Check companies
        companies = details_mycompany.objects.all()
        self.stdout.write(f"Total companies: {companies.count()}")
        
        for company in companies:
            self.stdout.write(f"Company: {company.name}")
            self.stdout.write(f"  Short Name: {company.short_name}")
            self.stdout.write(f"  Email Domain: {company.email_domain}")
            self.stdout.write(f"  Is Active: {company.is_active}")
            self.stdout.write("")
        
        # Check user profiles
        self.stdout.write("=== Checking User Profiles ===")
        profiles = users_mycompany.objects.all()
        self.stdout.write(f"Total profiles: {profiles.count()}")
        
        for profile in profiles:
            self.stdout.write(f"User: {profile.user.username}")
            self.stdout.write(f"  User Type: {profile.user_type}")
            self.stdout.write(f"  Role: {profile.role}")
            if profile.company:
                self.stdout.write(f"  Company: {profile.company.name} ({profile.company.short_name})")
            if profile.client:
                self.stdout.write(f"  Client: {profile.client.name} ({profile.client.short_name})")
            self.stdout.write("") 