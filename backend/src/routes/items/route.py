import uuid
import math
from typing import Any

from fastapi import APIRouter, HTTPException, Query
from sqlmodel import func, select

from src.routes.deps import AsyncSessionDep
from src.routes.items.models import (
    Item,
    ItemCreate,
    ItemPublic,
    ItemsPublic,
    ItemUpdate,
)
from src.routes.deps import CurrentUser
from src.routes.models import Message


router = APIRouter(prefix="/items", tags=["items"])


@router.get("/", response_model=ItemsPublic)
async def read_items(
    session: AsyncSessionDep, 
    current_user: CurrentUser,
    page: int = Query(default=1, ge=1, description="Page number (starts from 1)"),
    size: int = Query(default=10, ge=1, le=100, description="Number of items per page"),
) -> Any:
    """
    Retrieve items with pagination.
    
    Args:
        page: Page number (1-based)
        size: Number of items per page (1-100)
    
    Returns:
        Paginated list of items with metadata
    """
    # Calculate offset
    offset = (page - 1) * size

    if current_user.is_superuser:
        # Get total count
        count_statement = select(func.count()).select_from(Item)
        count_result = await session.exec(count_statement)
        total = count_result.one()
        
        # Get items
        statement = select(Item).offset(offset).limit(size)
        items_result = await session.exec(statement)
        items = items_result.all()
    else:
        # Get total count for user's items
        count_statement = (
            select(func.count())
            .select_from(Item)
            .where(Item.owner_id == current_user.id)
        )
        count_result = await session.exec(count_statement)
        total = count_result.one()
        
        # Get user's items
        statement = (
            select(Item)
            .where(Item.owner_id == current_user.id)
            .offset(offset)
            .limit(size)
        )
        items_result = await session.exec(statement)
        items = items_result.all()

    # Calculate total pages
    pages = math.ceil(total / size) if total > 0 else 1

    return ItemsPublic(
        data=items,
        page=page,
        size=size,
        total=total,
        pages=pages
    )


@router.get("/{id}", response_model=ItemPublic)
async def read_item(
    session: AsyncSessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Any:
    """
    Get item by ID.
    """
    item = await session.get(Item, id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    if not current_user.is_superuser and (item.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    return item


@router.post("/", response_model=ItemPublic)
async def create_item(
    *, session: AsyncSessionDep, current_user: CurrentUser, item_in: ItemCreate
) -> Any:
    """
    Create new item.
    """
    item = Item.model_validate(item_in, update={"owner_id": current_user.id})
    session.add(item)
    await session.commit()
    await session.refresh(item)
    return item


@router.put("/{id}", response_model=ItemPublic)
async def update_item(
    *,
    session: AsyncSessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    item_in: ItemUpdate,
) -> Any:
    """
    Update an item.
    """
    item = await session.get(Item, id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    if not current_user.is_superuser and (item.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    update_dict = item_in.model_dump(exclude_unset=True)
    item.sqlmodel_update(update_dict)
    session.add(item)
    await session.commit()
    await session.refresh(item)
    return item


@router.delete("/{id}")
async def delete_item(
    session: AsyncSessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Message:
    """
    Delete an item.
    """
    item = await session.get(Item, id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    if not current_user.is_superuser and (item.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    await session.delete(item)
    await session.commit()
    return Message(message="Item deleted successfully")
