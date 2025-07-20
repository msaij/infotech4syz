from rest_framework import viewsets, permissions
from .models import Foursyz
from .serializers import FoursyzSerializer, FoursyzDetailSerializer


class FoursyzViewSet(viewsets.ModelViewSet):
    queryset = Foursyz.objects.all()
    serializer_class = FoursyzSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return FoursyzDetailSerializer
        return FoursyzSerializer 