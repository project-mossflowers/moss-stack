from fastapi import APIRouter
from src.routes.auth import route as auth
from src.routes.users import route as users
from src.routes.items import route as items
from src.routes.private import route as private
from src.config import settings


router = APIRouter()
router.include_router(auth.router)
router.include_router(users.router)
router.include_router(items.router)

if settings.ENVIRONMENT == "local":
    router.include_router(private.router)


@router.get("/health-check/", tags=["system"])
async def health_check() -> bool:
    return True
