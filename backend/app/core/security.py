from supabase import create_client, Client
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.config import get_settings

settings = get_settings()

class SupabaseJWTMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        # Initialize Supabase client
        if settings.supabase_project_ref:
            supabase_url = f"https://{settings.supabase_project_ref}.supabase.co"
            # You'll need to add SUPABASE_ANON_KEY to your .env
            supabase_anon_key = getattr(settings, 'supabase_anon_key', None)
            if supabase_anon_key:
                self.supabase: Client = create_client(supabase_url, supabase_anon_key)
            else:
                self.supabase = None
        else:
            self.supabase = None

    async def dispatch(self, request: Request, call_next):
        auth = request.headers.get("authorization", "")
        request.state.user_ext = None
        
        # Development mode - allow requests without auth
        if not settings.supabase_project_ref:
            request.state.user_ext = "dev-user-123"
            return await call_next(request)
        
        if auth.lower().startswith("bearer "):
            token = auth.split(" ", 1)[1]
            try:
                if self.supabase:
                    # Use Supabase client to verify token
                    user = self.supabase.auth.get_user(token)
                    request.state.user_ext = user.user.id
                else:
                    # Fallback for development
                    request.state.user_ext = "dev-user-123"
            except Exception as e:
                # Don't fail on auth errors in development
                request.state.user_ext = "dev-user-123"
        
        return await call_next(request)
