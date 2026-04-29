from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import User
from app.models.schemas import UserRegister, UserLogin, TokenResponse, GoogleLogin
from app.core.security import get_password_hash, verify_password, create_access_token
from google.oauth2 import id_token
from google.auth.transport import requests
from app.core.config import settings

router = APIRouter()

@router.post("/register", response_model=TokenResponse)
def register(user: UserRegister, db: Session = Depends(get_db)):
    email_clean = user.email.strip().lower()
    
    db_user = db.query(User).filter(User.email == email_clean).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_pw = get_password_hash(user.password)
    new_user = User(name=user.name, email=email_clean, hashed_pw=hashed_pw)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token = create_access_token(data={"sub": str(new_user.id)})
    return {"access_token": access_token, "token_type": "bearer", "name": new_user.name}

@router.post("/login", response_model=TokenResponse)
def login(user: UserLogin, db: Session = Depends(get_db)):
    email_clean = user.email.strip().lower()
    
    db_user = db.query(User).filter(User.email == email_clean).first()
    if not db_user or not verify_password(user.password, db_user.hashed_pw):
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    access_token = create_access_token(data={"sub": str(db_user.id)})
    return {"access_token": access_token, "token_type": "bearer", "name": db_user.name}

@router.post("/google", response_model=TokenResponse)
def google_login(data: GoogleLogin, db: Session = Depends(get_db)):
    try:
        # Verify the ID token from Google
        idinfo = id_token.verify_oauth2_token(
            data.credential, 
            requests.Request(), 
            settings.GOOGLE_CLIENT_ID,
            clock_skew=10 # Allow 10 seconds leeway for clock skew
        )

        email = idinfo['email'].strip().lower()
        name = idinfo.get('name', email.split('@')[0])
        
        # Check if user exists
        db_user = db.query(User).filter(User.email == email).first()
        
        if not db_user:
            # Create new user for first-time Google login
            db_user = User(name=name, email=email, hashed_pw=None) # No password for OAuth
            db.add(db_user)
            db.commit()
            db.refresh(db_user)
            
        access_token = create_access_token(data={"sub": str(db_user.id)})
        return {"access_token": access_token, "token_type": "bearer", "name": db_user.name}

    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Google authentication failed: {str(e)}")
