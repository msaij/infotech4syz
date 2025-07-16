from django.urls import path, include

urlpatterns = [
    path('details/', include('non_public.details_clients.urls')),
    path('users/', include('non_public.users_clients.urls')),
    path('queries/', include('non_public.queries_clients.urls')),
    path('delivery-challan/', include('non_public.delivery_challan.urls')),
    path('products/', include('non_public.products.urls')),
] 