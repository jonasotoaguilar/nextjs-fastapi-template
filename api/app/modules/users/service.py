import urllib.parse

from fastapi_mail import FastMail, MessageSchema, MessageType

from app.core.config import settings
from app.core.email import get_email_config
from app.modules.users.models import User


async def send_reset_password_email(user: User, token: str) -> None:
    conf = get_email_config()
    email = user.email
    base_url = f"{settings.FRONTEND_URL}/password-recovery/confirm?"
    params = {"token": token}
    encoded_params = urllib.parse.urlencode(params)
    link = f"{base_url}{encoded_params}"
    message = MessageSchema(
        subject="Password recovery",
        recipients=[email],
        template_body={"username": email, "link": link},
        subtype=MessageType.html,
    )

    fm = FastMail(conf)
    await fm.send_message(message, template_name="password_reset.html")
