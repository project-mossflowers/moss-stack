from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import RedirectResponse
from src.config import settings
from src.routes.deps import AsyncSessionDep
from src.routes.auth import service as auth_service
from typing import Any
import secrets
import string

router = APIRouter(tags=["oauth2"])

def generate_state() -> str:
    """Generate a random state string for OAuth2 CSRF protection"""
    return ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(32))

@router.get("/auth/oauth2/status")
async def get_oauth2_status() -> dict[str, Any]:
    """
    Check OAuth2 provider configuration status
    """
    return {
        "google": {
            "enabled": settings.GOOGLE_OAUTH_ENABLED,
            "configured": bool(settings.GOOGLE_CLIENT_ID and settings.GOOGLE_CLIENT_SECRET)
        },
        "apple": {
            "enabled": settings.APPLE_OAUTH_ENABLED,
            "configured": bool(settings.APPLE_CLIENT_ID and settings.APPLE_CLIENT_SECRET)
        },
        "github": {
            "enabled": settings.GITHUB_OAUTH_ENABLED,
            "configured": bool(settings.GITHUB_CLIENT_ID and settings.GITHUB_CLIENT_SECRET)
        }
    }

@router.get("/auth/oauth2/{provider}")
async def oauth2_login(provider: str) -> RedirectResponse:
    """
    Initiate OAuth2 login with specified provider
    """
    provider = provider.lower()
    
    if provider == "google":
        if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
            raise HTTPException(status_code=400, detail="Google OAuth2 is not configured")
        
        state = generate_state()
        # Store state in session or database for CSRF protection
        # For now, we'll use a simple approach
        
        auth_url = (
            f"https://accounts.google.com/o/oauth2/v2/auth?"
            f"client_id={settings.GOOGLE_CLIENT_ID}&"
            f"redirect_uri={settings.GOOGLE_REDIRECT_URI}&"
            f"response_type=code&"
            f"scope=openid email profile&"
            f"state={state}"
        )
        return RedirectResponse(url=auth_url)
    
    elif provider == "apple":
        if not settings.APPLE_CLIENT_ID or not settings.APPLE_CLIENT_SECRET:
            raise HTTPException(status_code=400, detail="Apple OAuth2 is not configured")
        
        state = generate_state()
        # Store state in session or database for CSRF protection
        
        auth_url = (
            f"https://appleid.apple.com/auth/authorize?"
            f"client_id={settings.APPLE_CLIENT_ID}&"
            f"redirect_uri={settings.APPLE_REDIRECT_URI}&"
            f"response_type=code&"
            f"scope=openid email name&"
            f"state={state}"
        )
        return RedirectResponse(url=auth_url)
    
    elif provider == "github":
        if not settings.GITHUB_CLIENT_ID or not settings.GITHUB_CLIENT_SECRET:
            raise HTTPException(status_code=400, detail="GitHub OAuth2 is not configured")
        
        state = generate_state()
        # Store state in session or database for CSRF protection
        
        auth_url = (
            f"https://github.com/login/oauth/authorize?"
            f"client_id={settings.GITHUB_CLIENT_ID}&"
            f"redirect_uri={settings.GITHUB_REDIRECT_URI}&"
            f"response_type=code&"
            f"scope=user:email&"
            f"state={state}"
        )
        return RedirectResponse(url=auth_url)
    
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported OAuth2 provider: {provider}")

@router.get("/auth/oauth2/{provider}/callback")
async def oauth2_callback(
    provider: str,
    code: str,
    state: str,
    session: AsyncSessionDep,
    request: Request
) -> Any:
    """
    Handle OAuth2 callback from provider
    """
    provider = provider.lower()
    
    if provider == "google":
        if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
            raise HTTPException(status_code=400, detail="Google OAuth2 is not configured")
        
        # Exchange authorization code for access token
        from authlib.integrations.requests_client import OAuth2Session
        import requests
        
        client = OAuth2Session(
            client_id=settings.GOOGLE_CLIENT_ID,
            redirect_uri=settings.GOOGLE_REDIRECT_URI,
            scope="openid email profile"
        )
        
        try:
            token = client.fetch_token(
                "https://oauth2.googleapis.com/token",
                code=code,
                client_secret=settings.GOOGLE_CLIENT_SECRET,
            )
            
            # Get user info from Google
            response = requests.get(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                headers={"Authorization": f"Bearer {token['access_token']}"}
            )
            user_info = response.json()
            
            # Create or update user
            user = await auth_service.create_or_update_oauth2_user(
                session=session,
                provider="google",
                provider_user_id=user_info["id"],
                email=user_info["email"],
                name=user_info.get("name", ""),
                picture=user_info.get("picture", "")
            )
            
            # Generate JWT token
            from src.core import security
            from datetime import timedelta
            
            access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
            from src.routes.auth.models import Token
            jwt_token = Token(
                access_token=security.create_access_token(
                    user.id, expires_delta=access_token_expires
                )
            )
            
            # Redirect to frontend with token
            return RedirectResponse(
                url=f"{settings.FRONTEND_URL}/oauth2/callback?access_token={jwt_token.access_token}"
            )
            
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Google OAuth2 authentication failed: {str(e)}")
    
    elif provider == "apple":
        if not settings.APPLE_CLIENT_ID or not settings.APPLE_CLIENT_SECRET:
            raise HTTPException(status_code=400, detail="Apple OAuth2 is not configured")
        
        # Apple OAuth2 implementation would go here
        # Note: Apple Sign In requires additional setup and verification
        raise HTTPException(status_code=501, detail="Apple OAuth2 not implemented yet")
    
    elif provider == "github":
        if not settings.GITHUB_CLIENT_ID or not settings.GITHUB_CLIENT_SECRET:
            raise HTTPException(status_code=400, detail="GitHub OAuth2 is not configured")
        
        # Exchange authorization code for access token
        from authlib.integrations.requests_client import OAuth2Session
        import requests
        
        client = OAuth2Session(
            client_id=settings.GITHUB_CLIENT_ID,
            redirect_uri=settings.GITHUB_REDIRECT_URI,
            scope="user:email"
        )
        
        try:
            token = client.fetch_token(
                "https://github.com/login/oauth/access_token",
                code=code,
                client_secret=settings.GITHUB_CLIENT_SECRET,
            )
            
            # Get user info from GitHub
            response = requests.get(
                "https://api.github.com/user",
                headers={"Authorization": f"token {token['access_token']}"}
            )
            user_info = response.json()
            
            # Get user email (GitHub may not provide email in user info)
            email = user_info.get("email")
            if not email:
                # Get user email from GitHub API
                email_response = requests.get(
                    "https://api.github.com/user/emails",
                    headers={"Authorization": f"token {token['access_token']}"}
                )
                emails = email_response.json()
                primary_email = next((e for e in emails if e.get("primary") and e.get("verified")), None)
                if primary_email:
                    email = primary_email.get("email")
                elif emails:
                    email = emails[0].get("email")
            
            if not email:
                raise HTTPException(status_code=400, detail="Could not retrieve email from GitHub")
            
            # Create or update user
            user = await auth_service.create_or_update_oauth2_user(
                session=session,
                provider="github",
                provider_user_id=str(user_info["id"]),
                email=email,
                name=user_info.get("name", user_info.get("login", "")),
                picture=user_info.get("avatar_url", "")
            )
            
            # Generate JWT token
            from src.core import security
            from datetime import timedelta
            
            access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
            from src.routes.auth.models import Token
            jwt_token = Token(
                access_token=security.create_access_token(
                    user.id, expires_delta=access_token_expires
                )
            )
            
            # Redirect to frontend with token
            return RedirectResponse(
                url=f"{settings.FRONTEND_URL}/oauth2/callback?access_token={jwt_token.access_token}"
            )
            
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"GitHub OAuth2 authentication failed: {str(e)}")
    
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported OAuth2 provider: {provider}")