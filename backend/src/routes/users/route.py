import uuid
import math
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import col, delete, func, select, or_, desc, asc

from src.routes.items.models import Item
from src.routes.users.models import (
    UpdatePassword,
    User,
    UserCreate,
    UserPublic,
    UserUpdate,
    UserUpdateMe,
    UsersPublic,
    UserRegister,
    UserSortField,
    SortOrder,
)
from src.routes.users import service as user_service
from src.routes.deps import (
    CurrentUser,
    AsyncSessionDep,
    get_current_active_superuser,
)
from src.config import settings
from src.core.security import get_password_hash, verify_password

from src.utils.auth import generate_new_account_email, send_email
from src.routes.models import Message


router = APIRouter(prefix="/users", tags=["users"])


@router.get(
    "/",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=UsersPublic,
)
async def read_users(
    session: AsyncSessionDep,
    page: int = Query(default=1, ge=1, description="Page number (starts from 1)"),
    size: int = Query(default=10, ge=1, le=100, description="Number of users per page"),
    search: Optional[str] = Query(default=None, description="Search in email and full name"),
    sort_by: UserSortField = Query(default=UserSortField.email, description="Field to sort by"),
    sort_order: SortOrder = Query(default=SortOrder.asc, description="Sort order (asc/desc)"),
) -> Any:
    """
    Retrieve users with pagination, filtering, and sorting.
    
    Args:
        page: Page number (1-based)
        size: Number of users per page (1-100)
        search: Search term for email and full name
        sort_by: Field to sort by (email, full_name)
        sort_order: Sort order (asc/desc)
    
    Returns:
        Paginated list of users with metadata
    """
    # Calculate offset
    offset = (page - 1) * size

    # Build base query
    base_filters = []
    
    # Add search filter
    if search:
        search_filter = or_(
            User.email.icontains(search),
            User.full_name.icontains(search) if User.full_name is not None else False
        )
        base_filters.append(search_filter)

    # Build count query
    count_statement = select(func.count()).select_from(User)
    if base_filters:
        count_statement = count_statement.where(*base_filters)
    
    count_result = await session.exec(count_statement)
    total = count_result.one()

    # Build data query with sorting
    statement = select(User)
    if base_filters:
        statement = statement.where(*base_filters)
    
    # Add sorting
    sort_column = getattr(User, sort_by.value)
    if sort_order == SortOrder.desc:
        statement = statement.order_by(desc(sort_column))
    else:
        statement = statement.order_by(asc(sort_column))
    
    # Add pagination
    statement = statement.offset(offset).limit(size)
    
    users_result = await session.exec(statement)
    users = users_result.all()

    # Calculate total pages
    pages = math.ceil(total / size) if total > 0 else 1

    return UsersPublic(
        data=users,
        page=page,
        size=size,
        total=total,
        pages=pages
    )


@router.post(
    "/", dependencies=[Depends(get_current_active_superuser)], response_model=UserPublic
)
async def create_user(*, session: AsyncSessionDep, user_in: UserCreate) -> Any:
    """
    Create new user.
    """
    user = await user_service.get_user_by_email(session=session, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )

    user = await user_service.create_user(session=session, user_create=user_in)
    if settings.emails_enabled and user_in.email:
        email_data = await generate_new_account_email(
            email_to=user_in.email, username=user_in.email, password=user_in.password
        )
        await send_email(
            email_to=user_in.email,
            subject=email_data.subject,
            html_content=email_data.html_content,
        )
    return user


@router.patch("/me", response_model=UserPublic)
async def update_user_me(
    *, session: AsyncSessionDep, user_in: UserUpdateMe, current_user: CurrentUser
) -> Any:
    """
    Update own user.
    """

    if user_in.email:
        existing_user = await user_service.get_user_by_email(
            session=session, email=user_in.email
        )
        if existing_user and existing_user.id != current_user.id:
            raise HTTPException(
                status_code=409, detail="User with this email already exists"
            )
    user_data = user_in.model_dump(exclude_unset=True)
    current_user.sqlmodel_update(user_data)
    session.add(current_user)
    await session.commit()
    await session.refresh(current_user)
    return current_user


@router.patch("/me/password", response_model=Message)
async def update_password_me(
    *, session: AsyncSessionDep, body: UpdatePassword, current_user: CurrentUser
) -> Any:
    """
    Update own password.
    """
    if not verify_password(body.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect password")
    if body.current_password == body.new_password:
        raise HTTPException(
            status_code=400, detail="New password cannot be the same as the current one"
        )
    hashed_password = get_password_hash(body.new_password)
    current_user.hashed_password = hashed_password
    session.add(current_user)
    await session.commit()
    return Message(message="Password updated successfully")


@router.get("/me", response_model=UserPublic)
async def read_user_me(current_user: CurrentUser) -> Any:
    """
    Get current user.
    """
    return current_user


@router.delete("/me", response_model=Message)
async def delete_user_me(session: AsyncSessionDep, current_user: CurrentUser) -> Any:
    """
    Delete own user.
    """
    if current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="Super users are not allowed to delete themselves"
        )
    await session.delete(current_user)
    await session.commit()
    return Message(message="User deleted successfully")


@router.post("/signup", response_model=UserPublic)
async def register_user(session: AsyncSessionDep, user_in: UserRegister) -> Any:
    """
    Create new user without the need to be logged in.
    """
    user = await user_service.get_user_by_email(session=session, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system",
        )
    user_create = UserCreate.model_validate(user_in)
    user = await user_service.create_user(session=session, user_create=user_create)
    return user


@router.get("/{user_id}", response_model=UserPublic)
async def read_user_by_id(
    user_id: uuid.UUID, session: AsyncSessionDep, current_user: CurrentUser
) -> Any:
    """
    Get a specific user by id.
    """
    user = await session.get(User, user_id)
    if user == current_user:
        return user
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=403,
            detail="The user doesn't have enough privileges",
        )
    return user


@router.patch(
    "/{user_id}",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=UserPublic,
)
async def update_user(
    *,
    session: AsyncSessionDep,
    user_id: uuid.UUID,
    user_in: UserUpdate,
) -> Any:
    """
    Update a user.
    """

    db_user = await session.get(User, user_id)
    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="The user with this id does not exist in the system",
        )
    if user_in.email:
        existing_user = await user_service.get_user_by_email(
            session=session, email=user_in.email
        )
        if existing_user and existing_user.id != user_id:
            raise HTTPException(
                status_code=409, detail="User with this email already exists"
            )

    db_user = await user_service.update_user(
        session=session, db_user=db_user, user_in=user_in
    )
    return db_user


@router.delete("/{user_id}", dependencies=[Depends(get_current_active_superuser)])
async def delete_user(
    session: AsyncSessionDep, current_user: CurrentUser, user_id: uuid.UUID
) -> Message:
    """
    Delete a user.
    """
    user = await session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user == current_user:
        raise HTTPException(
            status_code=403, detail="Super users are not allowed to delete themselves"
        )
    statement = delete(Item).where(col(Item.owner_id) == user_id)
    await session.exec(statement)
    await session.delete(user)
    await session.commit()
    return Message(message="User deleted successfully")
