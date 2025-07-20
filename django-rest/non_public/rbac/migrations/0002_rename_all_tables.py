# Generated manually to rename all tables

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('rbac', '0001_initial'),
        ('foursyz', '0001_initial'),
        ('clients', '0001_initial'),
        ('users_foursyz', '0001_initial'),
        ('users_clients', '0001_initial'),
        ('queries_4syz', '0001_initial'),
        ('queries_clients', '0001_initial'),
    ]

    operations = [
        # Rename RBAC tables
        migrations.RunSQL(
            "RENAME TABLE rbac_permission TO rbac_permissions;",
            "RENAME TABLE rbac_permissions TO rbac_permission;"
        ),
        migrations.RunSQL(
            "RENAME TABLE rbac_role TO rbac_roles;",
            "RENAME TABLE rbac_roles TO rbac_role;"
        ),
        migrations.RunSQL(
            "RENAME TABLE rbac_userrole TO rbac_user_roles;",
            "RENAME TABLE rbac_user_roles TO rbac_userrole;"
        ),
        
        # Rename company tables
        migrations.RunSQL(
            "RENAME TABLE foursyz_foursyz TO foursyz;",
            "RENAME TABLE foursyz TO foursyz_foursyz;"
        ),
        migrations.RunSQL(
            "RENAME TABLE clients_client TO clients;",
            "RENAME TABLE clients TO clients_client;"
        ),
        
        # Rename user tables
        migrations.RunSQL(
            "RENAME TABLE users_foursyz_userfoursyz TO users_4syz;",
            "RENAME TABLE users_4syz TO users_foursyz_userfoursyz;"
        ),
        migrations.RunSQL(
            "RENAME TABLE users_clients_userclient TO users_clients;",
            "RENAME TABLE users_clients TO users_clients_userclient;"
        ),
        
        # Rename query tables
        migrations.RunSQL(
            "RENAME TABLE queries_4syz_query4syz TO queries_4syz;",
            "RENAME TABLE queries_4syz TO queries_4syz_query4syz;"
        ),
        migrations.RunSQL(
            "RENAME TABLE queries_clients_queryclient TO queries_clients;",
            "RENAME TABLE queries_clients TO queries_clients_queryclient;"
        ),
    ] 