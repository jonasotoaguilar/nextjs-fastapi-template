from fastapi import APIRouter

from app.modules.users.schemas import UserCreate, UserRead, UserUpdate

from .manager import AUTH_URL_PATH, auth_backend, fastapi_users

router = APIRouter()

# Authentication routes
router.include_router(
    fastapi_users.get_auth_router(auth_backend),
    prefix=f"/{AUTH_URL_PATH}/jwt",
    tags=["auth"],
)

router.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix=f"/{AUTH_URL_PATH}",
    tags=["auth"],
)

router.include_router(
    fastapi_users.get_reset_password_router(),
    prefix=f"/{AUTH_URL_PATH}",
    tags=["auth"],
)

router.include_router(
    fastapi_users.get_verify_router(UserRead),
    prefix=f"/{AUTH_URL_PATH}",
    tags=["auth"],
)

# User management routes
router.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix="/users",
    tags=["users"],
)
