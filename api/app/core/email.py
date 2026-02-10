from pathlib import Path

from fastapi_mail import ConnectionConfig
from pydantic import SecretStr

from .config import settings


def get_email_config() -> ConnectionConfig:
    if (
        settings.MAIL_USERNAME is None
        or settings.MAIL_PASSWORD is None
        or settings.MAIL_FROM is None
        or settings.MAIL_PORT is None
        or settings.MAIL_SERVER is None
    ):
        raise ValueError("Email configuration is not fully set")

    conf = ConnectionConfig(
        MAIL_USERNAME=settings.MAIL_USERNAME,
        MAIL_PASSWORD=SecretStr(settings.MAIL_PASSWORD),
        MAIL_FROM=settings.MAIL_FROM,
        MAIL_PORT=settings.MAIL_PORT,
        MAIL_SERVER=settings.MAIL_SERVER,
        MAIL_FROM_NAME=settings.MAIL_FROM_NAME,
        MAIL_STARTTLS=settings.MAIL_STARTTLS,
        MAIL_SSL_TLS=settings.MAIL_SSL_TLS,
        USE_CREDENTIALS=settings.USE_CREDENTIALS,
        VALIDATE_CERTS=settings.VALIDATE_CERTS,
        TEMPLATE_FOLDER=Path(__file__).parent.parent / settings.TEMPLATE_DIR,
    )
    return conf
