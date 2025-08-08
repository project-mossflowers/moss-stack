from sqlmodel.ext.asyncio.session import AsyncSession
import ldap3
from ldap3 import Server, Connection, ALL, SUBTREE
import logging

from src.core.security import verify_password, get_password_hash
from src.routes.users.models import User
from src.routes.users.service import get_user_by_email, get_user_by_username
from src.config import settings

logger = logging.getLogger(__name__)


async def authenticate(
    *, session: AsyncSession, email: str, password: str
) -> User | None:
    db_user = await get_user_by_email(session=session, email=email)
    if not db_user:
        return None
    if not verify_password(password, db_user.hashed_password):
        return None
    return db_user


async def authenticate_by_username(
    *, session: AsyncSession, username: str, password: str
) -> User | None:
    db_user = await get_user_by_username(session=session, username=username)
    if not db_user:
        return None
    if not verify_password(password, db_user.hashed_password):
        return None
    return db_user


async def authenticate_ldap(
    *, session: AsyncSession, username: str, password: str
) -> User | None:
    """
    Authenticate user via LDAP and create/update user record in database
    """
    if not settings.LDAP_ENABLED or not settings.LDAP_SERVER:
        logger.warning("LDAP authentication attempted but LDAP is not enabled")
        return None
    
    try:
        # Create LDAP server connection
        server = Server(
            settings.LDAP_SERVER,
            port=settings.LDAP_PORT,
            use_ssl=settings.LDAP_USE_SSL,
            get_info=ALL
        )
        
        # First, bind with service account if configured
        if settings.LDAP_BIND_DN and settings.LDAP_BIND_PASSWORD:
            conn = Connection(
                server,
                user=settings.LDAP_BIND_DN,
                password=settings.LDAP_BIND_PASSWORD,
                auto_bind=True
            )
        else:
            conn = Connection(server)
            conn.bind()
        
        # Search for user
        search_filter = settings.LDAP_USER_FILTER.format(username=username)
        conn.search(
            search_base=settings.LDAP_SEARCH_BASE,
            search_filter=search_filter,
            search_scope=SUBTREE,
            attributes=[
                settings.LDAP_EMAIL_ATTRIBUTE,
                settings.LDAP_FIRST_NAME_ATTRIBUTE,
                settings.LDAP_LAST_NAME_ATTRIBUTE,
                'cn'
            ]
        )
        
        if not conn.entries:
            logger.warning(f"User {username} not found in LDAP")
            return None
        
        user_entry = conn.entries[0]
        user_dn = user_entry.entry_dn
        
        # Try to authenticate with user credentials
        auth_conn = Connection(server, user=user_dn, password=password)
        if not auth_conn.bind():
            logger.warning(f"LDAP authentication failed for user {username}")
            return None
        
        # Get user attributes
        email_attr = getattr(user_entry, settings.LDAP_EMAIL_ATTRIBUTE, None)
        if email_attr and hasattr(email_attr, 'value') and email_attr.value:
            email = email_attr.value
        elif email_attr and hasattr(email_attr, 'values') and email_attr.values:
            email = email_attr.values[0]
        else:
            logger.error(f"Email attribute not found or empty for user {username}")
            return None
            
        first_name_attr = getattr(user_entry, settings.LDAP_FIRST_NAME_ATTRIBUTE, None)
        first_name = ""
        if first_name_attr and hasattr(first_name_attr, 'value') and first_name_attr.value:
            first_name = first_name_attr.value
        elif first_name_attr and hasattr(first_name_attr, 'values') and first_name_attr.values:
            first_name = first_name_attr.values[0]
            
        last_name_attr = getattr(user_entry, settings.LDAP_LAST_NAME_ATTRIBUTE, None)
        last_name = ""
        if last_name_attr and hasattr(last_name_attr, 'value') and last_name_attr.value:
            last_name = last_name_attr.value
        elif last_name_attr and hasattr(last_name_attr, 'values') and last_name_attr.values:
            last_name = last_name_attr.values[0]
            
        cn_attr = getattr(user_entry, 'cn', None)
        if cn_attr and hasattr(cn_attr, 'value') and cn_attr.value:
            full_name = cn_attr.value
        elif cn_attr and hasattr(cn_attr, 'values') and cn_attr.values:
            full_name = cn_attr.values[0]
        else:
            full_name = f"{first_name} {last_name}".strip()
        
        # Ensure email is a string
        if isinstance(email, list):
            email = email[0] if email else ""
        email = str(email) if email else ""
        
        logger.info(f"LDAP user {username} mapped to email: {email}")
        
        auth_conn.unbind()
        conn.unbind()
        
        # Check if user exists in database
        db_user = await get_user_by_email(session=session, email=email)
        
        if db_user:
            # Handle email conflict based on strategy
            if db_user.username and db_user.username != username:
                if settings.LDAP_CONFLICT_STRATEGY == "fail":
                    logger.warning(f"Email conflict: LDAP user {username} maps to email {email} which is already associated with existing user {db_user.username}")
                    return None
                elif settings.LDAP_CONFLICT_STRATEGY == "create_new":
                    # Generate a unique email for this LDAP user
                    unique_email = f"{username}@ldap.local"
                    logger.info(f"Creating new user with unique email: {unique_email}")
                    return await create_ldap_user(session, username, unique_email, full_name)
            
            # Update existing user if needed (merge strategy)
            updated = False
            if db_user.full_name != full_name:
                db_user.full_name = full_name
                updated = True
            if not db_user.username:
                db_user.username = username
                updated = True
            
            if updated:
                session.add(db_user)
                await session.commit()
                await session.refresh(db_user)
            
            return db_user
        else:
            # Check for username conflict
            existing_user_by_username = await get_user_by_username(session=session, username=username)
            if existing_user_by_username:
                if settings.LDAP_CONFLICT_STRATEGY == "fail":
                    logger.warning(f"Username conflict: LDAP username {username} is already associated with existing user {existing_user_by_username.email}")
                    return None
                elif settings.LDAP_CONFLICT_STRATEGY == "create_new":
                    # Generate a unique username for this LDAP user
                    unique_username = f"{username}_ldap"
                    logger.info(f"Creating new user with unique username: {unique_username}")
                    return await create_ldap_user(session, unique_username, email, full_name)
            
            # Create new user with username directly in database
            return await create_ldap_user(session, username, email, full_name)
            
    except ldap3.core.exceptions.LDAPException as e:
        logger.error(f"LDAP error during authentication for user {username}: {e}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error during LDAP authentication for user {username}: {e}")
        return None


async def create_ldap_user(
    session: AsyncSession, 
    username: str, 
    email: str, 
    full_name: str
) -> User:
    """Helper function to create LDAP user"""
    hashed_password = get_password_hash("ldap-user-no-password")
    new_user = User(
        email=email,
        username=username,
        hashed_password=hashed_password,
        full_name=full_name,
        is_active=True,
        is_superuser=False
    )
    session.add(new_user)
    await session.commit()
    await session.refresh(new_user)
    logger.info(f"Created new LDAP user: {username} with email {email}")
    return new_user


async def authenticate_hybrid(
    *, session: AsyncSession, username: str, password: str
) -> User | None:
    """
    Try LDAP authentication first, fall back to local authentication
    """
    # Try LDAP authentication first if enabled
    if settings.LDAP_ENABLED:
        ldap_user = await authenticate_ldap(session=session, username=username, password=password)
        if ldap_user:
            return ldap_user
    
    # Fall back to local authentication
    # Try username lookup first (for regular users with username)
    user_by_username = await authenticate_by_username(session=session, username=username, password=password)
    if user_by_username:
        return user_by_username
    
    # Fall back to email lookup (for regular users with email)
    return await authenticate(session=session, email=username, password=password)