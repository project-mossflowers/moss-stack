from sqlmodel.ext.asyncio.session import AsyncSession

from src.core.security import verify_password
from src.routes.users.models import User
from src.routes.users.service import get_user_by_email


async def authenticate(
    *, session: AsyncSession, email: str, password: str
) -> User | None:
    db_user = await get_user_by_email(session=session, email=email)
    if not db_user:
        return None
    if not verify_password(password, db_user.hashed_password):
        return None
    return db_user
