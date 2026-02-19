from fastapi import APIRouter

from app.api.v1.endpoints import auth, gestures, analytics

api_router = APIRouter()

# Include all endpoint routers with their prefixes
api_router.include_router(auth.router,      prefix="/auth",      tags=["Auth"])
api_router.include_router(gestures.router,  prefix="/gestures",  tags=["Gestures"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])