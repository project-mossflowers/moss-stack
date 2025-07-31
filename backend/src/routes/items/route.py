import uuid
import math
from typing import Any, Optional

from fastapi import APIRouter, HTTPException, Query
from sqlmodel import func, select, or_, desc, asc

from src.routes.deps import AsyncSessionDep
from src.routes.items.models import (
    Item,
    ItemCreate,
    ItemPublic,
    ItemsPublic,
    ItemUpdate,
    SortOrder,
    ItemSortField,
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
    search: Optional[str] = Query(default=None, description="Search in title and description"),
    sort_by: ItemSortField = Query(default=ItemSortField.created_at, description="Field to sort by"),
    sort_order: SortOrder = Query(default=SortOrder.desc, description="Sort order (asc/desc)"),
) -> Any:
    """
    Retrieve items with pagination, filtering, and sorting.
    
    Args:
        page: Page number (1-based)
        size: Number of items per page (1-100)
        search: Search term for title and description
        sort_by: Field to sort by (title, created_at, updated_at)
        sort_order: Sort order (asc/desc)
    
    Returns:
        Paginated list of items with metadata
    """
    # Calculate offset
    offset = (page - 1) * size

    # Build base query
    base_filters = []
    
    # Add ownership filter
    if not current_user.is_superuser:
        base_filters.append(Item.owner_id == current_user.id)
    
    # Add search filter
    if search:
        search_filter = or_(
            Item.title.icontains(search),
            Item.description.icontains(search)
        )
        base_filters.append(search_filter)

    # Build count query
    count_statement = select(func.count()).select_from(Item)
    if base_filters:
        count_statement = count_statement.where(*base_filters)
    
    count_result = await session.exec(count_statement)
    total = count_result.one()

    # Build data query with sorting
    statement = select(Item)
    if base_filters:
        statement = statement.where(*base_filters)
    
    # Add sorting
    sort_column = getattr(Item, sort_by.value)
    if sort_order == SortOrder.desc:
        statement = statement.order_by(desc(sort_column))
    else:
        statement = statement.order_by(asc(sort_column))
    
    # Add pagination
    statement = statement.offset(offset).limit(size)
    
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
