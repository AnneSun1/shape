from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from app.core.config import get_settings
from supabase import create_client

router = APIRouter(prefix="/health", tags=["health"])
settings = get_settings()

# Request/Response models
class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    user_id: str
    email: str
    access_token: str
    bearer_token: str
    message: str

@router.get("")
def ok(): 
    return {"ok": True}

@router.get("/auth-test")
def auth_test(request: Request):
    """Test endpoint to check if authentication is working"""
    user_ext = getattr(request.state, "user_ext", None)
    if user_ext:
        return {"authenticated": True, "user_id": user_ext}
    else:
        return {"authenticated": False, "message": "No valid JWT token provided"}

@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest):
    """Login with email and password, return JWT token"""
    try:
        if not settings.supabase_project_ref or not settings.supabase_anon_key:
            raise HTTPException(400, "Supabase credentials not configured")
        
        supabase = create_client(
            f"https://{settings.supabase_project_ref}.supabase.co",
            settings.supabase_anon_key
        )
        
        # Sign in with email and password
        response = supabase.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password
        })
        
        if response.session and response.user:
            return {
                "user_id": response.user.id,
                "email": response.user.email,
                "access_token": response.session.access_token,
                "bearer_token": f"Bearer {response.session.access_token}",
                "message": "Login successful! Use the bearer_token in Swagger UI Authorize button"
            }
        else:
            raise HTTPException(401, "Invalid email or password")
        
    except Exception as e:
        raise HTTPException(400, f"Login failed: {str(e)}")

@router.post("/signup", response_model=LoginResponse)
def signup(request: LoginRequest):
    """Sign up with email and password, return JWT token"""
    try:
        if not settings.supabase_project_ref or not settings.supabase_anon_key:
            raise HTTPException(400, "Supabase credentials not configured")
        
        supabase = create_client(
            f"https://{settings.supabase_project_ref}.supabase.co",
            settings.supabase_anon_key
        )
        
        # Sign up the user
        signup_response = supabase.auth.sign_up({
            "email": request.email,
            "password": request.password
        })
        
        if signup_response.user:
            # Sign in to get session
            signin_response = supabase.auth.sign_in_with_password({
                "email": request.email,
                "password": request.password
            })
            
            if signin_response.session:
                return {
                    "user_id": signin_response.user.id,
                    "email": signin_response.user.email,
                    "access_token": signin_response.session.access_token,
                    "bearer_token": f"Bearer {signin_response.session.access_token}",
                    "message": "Signup successful! Use the bearer_token in Swagger UI Authorize button"
                }
        
        raise HTTPException(400, "Failed to create user")
        
    except Exception as e:
        raise HTTPException(400, f"Signup failed: {str(e)}")
