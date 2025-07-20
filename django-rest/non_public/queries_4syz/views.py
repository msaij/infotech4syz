from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Query4syz
from .serializers import Query4syzSerializer, Query4syzCreateSerializer


class Query4syzViewSet(viewsets.ModelViewSet):
    queryset = Query4syz.objects.all()
    serializer_class = Query4syzSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return Query4syzCreateSerializer
        return Query4syzSerializer

    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        """Resolve a query"""
        query = self.get_object()
        query.status = 'resolved'
        query.resolution_notes = request.data.get('resolution_notes', '')
        query.save()
        serializer = self.get_serializer(query)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def my_queries(self, request):
        """Get queries raised by current user"""
        queries = Query4syz.objects.filter(raised_by__user=request.user)
        serializer = self.get_serializer(queries, many=True)
        return Response(serializer.data) 