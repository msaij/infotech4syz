from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import QueryClient
from .serializers import QueryClientSerializer, QueryClientCreateSerializer


class QueryClientViewSet(viewsets.ModelViewSet):
    queryset = QueryClient.objects.all()
    serializer_class = QueryClientSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return QueryClientCreateSerializer
        return QueryClientSerializer

    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        """Resolve a client query"""
        query = self.get_object()
        query.status = 'resolved'
        query.resolution_notes = request.data.get('resolution_notes', '')
        query.save()
        serializer = self.get_serializer(query)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def my_queries(self, request):
        """Get queries raised by current client user"""
        queries = QueryClient.objects.filter(raised_by__user=request.user)
        serializer = self.get_serializer(queries, many=True)
        return Response(serializer.data) 