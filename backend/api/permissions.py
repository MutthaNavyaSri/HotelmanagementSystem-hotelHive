from rest_framework.permissions import BasePermission, SAFE_METHODS
from api.models import UserProfile


class IsAdminUser(BasePermission):
    """
    Allows access only to admin users.
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        try:
            profile = request.user.profile
            return profile.is_admin
        except UserProfile.DoesNotExist:
            return False


class IsOwner(BasePermission):
    """
    Allows access only to the owner of the object.
    """
    
    def has_object_permission(self, request, view, obj):
        # Write permissions are only allowed to the owner
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return False


class IsAdminOrReadOnly(BasePermission):
    """
    Allows admin users to edit, others can only read.
    """
    
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        
        if not request.user or not request.user.is_authenticated:
            return False
        
        try:
            profile = request.user.profile
            return profile.is_admin
        except UserProfile.DoesNotExist:
            return False


class IsAdminOrOwner(BasePermission):
    """
    Allows admin or owner to edit/delete.
    """
    
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Admin can do anything
        try:
            if request.user.profile.is_admin:
                return True
        except UserProfile.DoesNotExist:
            pass
        
        # Owner can edit their own objects
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return False


class IsAuthenticated(BasePermission):
    """
    Allows access only to authenticated users.
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
