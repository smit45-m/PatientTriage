"""JWT Token Handler and Security Utilities for PatientTriage.ai"""
import os
import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
import jwt
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "patient_triage_super_secret_hackathon_key_2026")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

security = HTTPBearer(auto_error=False)


def hash_password(password: str, salt: Optional[str] = None) -> tuple[str, str]:
    """Hash a password using PBKDF2-HMAC-SHA256 with a unique salt."""
    if not salt:
        salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    )
    return key.hex(), salt


def verify_password(plain_password: str, password_hash: str, salt: str) -> bool:
    """Verify that a plain password matches the stored hash given its salt."""
    key = hashlib.pbkdf2_hmac(
        'sha256',
        plain_password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    )
    return secrets.compare_digest(key.hex(), password_hash)


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create an RFC 7519 compliant JSON Web Token (JWT)."""
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    
    to_encode.update({
        "exp": expire,
        "iat": now,
        "iss": "PatientTriage.ai"
    })
    
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and validate a JWT access token."""
    try:
        payload = jwt.decode(
            token,
            JWT_SECRET_KEY,
            algorithms=[JWT_ALGORITHM],
            issuer="PatientTriage.ai"
        )
        return payload
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None


async def get_current_user_optional(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Optional[Dict[str, Any]]:
    """Extract and validate the currently authenticated user, or return None."""
    if not credentials or not credentials.credentials:
        return None
    
    payload = decode_access_token(credentials.credentials)
    if not payload:
        return None
    
    return payload


async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Dict[str, Any]:
    """Dependency that strictly requires a valid Bearer JWT token."""
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    payload = decode_access_token(credentials.credentials)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired JWT token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return payload
