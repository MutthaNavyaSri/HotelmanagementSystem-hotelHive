import jwt
from datetime import datetime, timedelta
from django.conf import settings
from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth.models import User


class JWTAuthentication(TokenAuthentication):
    """Custom JWT Authentication"""
    
    def authenticate(self, request):
        """
        Authenticate the request using JWT token in Authorization header
        """
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if not auth_header:
            return None
        
        try:
            auth_type, token = auth_header.split()
            
            if auth_type.lower() != 'bearer':
                raise AuthenticationFailed('Invalid authentication header. Use "Bearer <token>"')
            
            # Decode JWT token
            payload = jwt.decode(
                token,
                settings.JWT_SECRET,
                algorithms=[settings.JWT_ALGORITHM]
            )
            
            # Get user from payload
            user_id = payload.get('user_id')
            
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                raise AuthenticationFailed('User not found')
            
            # Check token expiration
            exp = payload.get('exp')
            if exp and datetime.fromtimestamp(exp) < datetime.now():
                raise AuthenticationFailed('Token has expired')
            
            return (user, None)
        
        except ValueError:
            raise AuthenticationFailed('Invalid authorization header')
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Invalid token')


def generate_jwt_token(user):
    """Generate JWT token for user"""
    payload = {
        'user_id': user.id,
        'email': user.email,
        'username': user.username,
        'exp': datetime.utcnow() + timedelta(hours=settings.JWT_EXPIRATION_HOURS),
        'iat': datetime.utcnow(),
    }
    
    token = jwt.encode(
        payload,
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM
    )
    
    return token
