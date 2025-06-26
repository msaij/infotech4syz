"""
ASGI config for backend project.

This file exposes the ASGI callable as a module-level variable named `application`.
It is used for deploying Django with ASGI servers (e.g., Daphne, Uvicorn).

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

import os
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

application = ProtocolTypeRouter({
    'http': get_asgi_application(),
})
