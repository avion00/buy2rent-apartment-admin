from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, OpenApiParameter
from .serializers import UserSerializer

User = get_user_model()


class UserManagementViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing users (admin only)
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active', 'is_staff', 'is_superuser']
    search_fields = ['email', 'first_name', 'last_name', 'phone']
    ordering_fields = ['email', 'created_at', 'last_login']
    ordering = ['-created_at']
    
    @extend_schema(
        tags=['User Management'],
        summary='List all users',
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
    
    @extend_schema(
        tags=['User Management'],
        summary='Create a new user',
    )
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Hash the password before saving
        if 'password' in serializer.validated_data:
            serializer.validated_data['password'] = make_password(
                serializer.validated_data['password']
            )
        
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, 
            status=status.HTTP_201_CREATED, 
            headers=headers
        )
    
    @extend_schema(
        tags=['User Management'],
        summary='Get user details',
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)
    
    @extend_schema(
        tags=['User Management'],
        summary='Update user',
    )
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        # Hash the password if it's being updated
        if 'password' in serializer.validated_data:
            serializer.validated_data['password'] = make_password(
                serializer.validated_data['password']
            )
        
        self.perform_update(serializer)
        return Response(serializer.data)
    
    @extend_schema(
        tags=['User Management'],
        summary='Partial update user',
    )
    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)
    
    @extend_schema(
        tags=['User Management'],
        summary='Delete user',
    )
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Prevent deleting the last superuser
        if instance.is_superuser:
            superuser_count = User.objects.filter(is_superuser=True).count()
            if superuser_count <= 1:
                return Response(
                    {'error': 'Cannot delete the last superuser'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Prevent self-deletion
        if instance == request.user:
            return Response(
                {'error': 'Cannot delete your own account'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=['post'])
    @extend_schema(
        tags=['User Management'],
        summary='Activate user account',
    )
    def activate(self, request, pk=None):
        user = self.get_object()
        user.is_active = True
        user.save()
        return Response({'status': 'User activated'})
    
    @action(detail=True, methods=['post'])
    @extend_schema(
        tags=['User Management'],
        summary='Deactivate user account',
    )
    def deactivate(self, request, pk=None):
        user = self.get_object()
        
        # Prevent deactivating self
        if user == request.user:
            return Response(
                {'error': 'Cannot deactivate your own account'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.is_active = False
        user.save()
        return Response({'status': 'User deactivated'})
    
    @action(detail=True, methods=['post'])
    @extend_schema(
        tags=['User Management'],
        summary='Reset user password',
        request={
            'application/json': {
                'type': 'object',
                'properties': {
                    'new_password': {'type': 'string', 'minLength': 8}
                },
                'required': ['new_password']
            }
        }
    )
    def reset_password(self, request, pk=None):
        user = self.get_object()
        new_password = request.data.get('new_password')
        
        if not new_password:
            return Response(
                {'error': 'New password is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if len(new_password) < 8:
            return Response(
                {'error': 'Password must be at least 8 characters long'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.password = make_password(new_password)
        user.save()
        
        return Response({'status': 'Password reset successfully'})
    
    @action(detail=True, methods=['post'])
    @extend_schema(
        tags=['User Management'],
        summary='Change user permissions',
        request={
            'application/json': {
                'type': 'object',
                'properties': {
                    'is_staff': {'type': 'boolean'},
                    'is_superuser': {'type': 'boolean'}
                },
                'required': []
            }
        }
    )
    def change_permissions(self, request, pk=None):
        user = self.get_object()
        
        if 'is_staff' in request.data:
            user.is_staff = request.data['is_staff']
        
        if 'is_superuser' in request.data:
            user.is_superuser = request.data['is_superuser']
            # If superuser, must also be staff
            if user.is_superuser:
                user.is_staff = True
        
        user.save()
        
        return Response({
            'status': 'Permissions updated successfully',
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser
        })
    
    @action(detail=False, methods=['get'])
    @extend_schema(
        tags=['User Management'],
        summary='Get user statistics',
    )
    def statistics(self, request):
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        admin_users = User.objects.filter(is_superuser=True).count()
        staff_users = User.objects.filter(is_staff=True, is_superuser=False).count()
        regular_users = User.objects.filter(is_staff=False, is_superuser=False).count()
        
        permission_distribution = {
            'superusers': admin_users,
            'staff': staff_users,
            'regular': regular_users,
        }
        
        return Response({
            'total_users': total_users,
            'active_users': active_users,
            'inactive_users': total_users - active_users,
            'admin_users': admin_users,
            'staff_users': staff_users,
            'regular_users': regular_users,
            'permission_distribution': permission_distribution,
        })
