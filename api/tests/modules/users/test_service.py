import pytest
from app.modules.users.models import User
from app.modules.users.service import send_reset_password_email
from fastapi_mail import MessageSchema


@pytest.fixture
def mock_settings(mocker):
    mock = mocker.patch("app.modules.users.service.settings")
    # Set up mock settings with test values
    mock.MAIL_USERNAME = "test_user"
    mock.MAIL_PASSWORD = "test_pass"
    mock.MAIL_FROM = "test@example.com"
    mock.MAIL_PORT = 587
    mock.MAIL_SERVER = "smtp.test.com"
    mock.MAIL_FROM_NAME = "Test Sender"
    mock.MAIL_STARTTLS = True
    mock.MAIL_SSL_TLS = False
    mock.USE_CREDENTIALS = True
    mock.VALIDATE_CERTS = True
    mock.TEMPLATE_DIR = "email_templates"
    mock.FRONTEND_URL = "http://test-frontend.com"
    return mock


@pytest.fixture
def mock_user():
    return User(
        email="user@example.com",
    )


@pytest.mark.asyncio
async def test_send_reset_password_email(mock_settings, mock_user, mocker):
    # Mock FastMail in the module where it's used
    mock_fastmail = mocker.patch("app.modules.users.service.FastMail")
    mock_fastmail_instance = mock_fastmail.return_value
    mock_fastmail_instance.send_message = mocker.AsyncMock()

    # Mock get_email_config
    mocker.patch("app.modules.users.service.get_email_config")

    # Test data
    test_token = "test-token-123"

    # Call the function
    await send_reset_password_email(mock_user, test_token)

    # Verify FastMail was instantiated
    mock_fastmail.assert_called_once()

    # Verify send_message was called
    mock_fastmail_instance.send_message.assert_called_once()

    # Verify the message schema
    message_arg = mock_fastmail_instance.send_message.call_args[0][0]
    assert isinstance(message_arg, MessageSchema)
    assert message_arg.subject == "Password recovery"
    assert [r.email for r in message_arg.recipients] == [mock_user.email]

    # Verify template body contains correct data
    expected_link = (
        f"http://test-frontend.com/password-recovery/confirm?token={test_token}"
    )
    assert message_arg.template_body == {
        "username": mock_user.email,
        "link": expected_link,
    }

    # Verify template name
    template_name = mock_fastmail_instance.send_message.call_args[1]["template_name"]
    assert template_name == "password_reset.html"
