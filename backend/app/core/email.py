"""Email utility for sending emails via SMTP."""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


def send_email(to_email: str, subject: str, body_html: str, body_text: str = None,
               from_email: str = None, username: str = None, password: str = None) -> bool:
    """
    Send an email using SMTP.
    
    Args:
        to_email: Recipient email address
        subject: Email subject
        body_html: HTML body content
        body_text: Plain text body (optional)
        from_email: Sender email (defaults to MAIL_FROM)
        username: SMTP username (defaults to MAIL_USERNAME)
        password: SMTP password (defaults to MAIL_PASSWORD)
    
    Returns:
        True if email sent successfully, False otherwise
    """
    # Use defaults if not provided
    from_email = from_email or settings.MAIL_FROM
    username = username or settings.MAIL_USERNAME
    password = password or settings.MAIL_PASSWORD
    
    print(f"DEBUG: Attempting to send email to {to_email}")
    print(f"DEBUG: From: {from_email}, Username: {username}")
    print(f"DEBUG: Server: {settings.MAIL_SERVER}:{settings.MAIL_PORT}")
    
    try:
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = from_email
        msg['To'] = to_email
        
        # Add plain text and HTML parts
        if body_text:
            msg.attach(MIMEText(body_text, 'plain'))
        msg.attach(MIMEText(body_html, 'html'))
        
        print("DEBUG: Message created, connecting to SMTP...")
        
        # Connect to SMTP server with SSL (port 465)
        if settings.MAIL_PORT == 465:
            server = smtplib.SMTP_SSL(settings.MAIL_SERVER, settings.MAIL_PORT)
        else:
            server = smtplib.SMTP(settings.MAIL_SERVER, settings.MAIL_PORT)
            server.starttls()
        
        print("DEBUG: Connected, logging in...")
        
        # Login and send
        server.login(username, password)
        
        print("DEBUG: Logged in, sending email...")
        
        server.sendmail(from_email, to_email, msg.as_string())
        server.quit()
        
        print(f"DEBUG: Email sent successfully to {to_email}")
        logger.info(f"Email sent successfully to {to_email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        print(f"EMAIL ERROR: {str(e)}")  # Debug print
        import traceback
        traceback.print_exc()
        return False


def send_password_reset_email(to_email: str, reset_token: str, reset_url_base: str = None) -> bool:
    """
    Send a password reset email using noreply credentials.
    
    Args:
        to_email: Recipient email address
        reset_token: The password reset token
        reset_url_base: Base URL for reset link (optional)
    
    Returns:
        True if email sent successfully, False otherwise
    """
    # Use noreply credentials for password reset (fallback to main MAIL config)
    from_email = settings.NOREPLY_FROM or settings.MAIL_FROM
    username = settings.NOREPLY_USERNAME or settings.MAIL_USERNAME
    password = settings.NOREPLY_PASSWORD or settings.MAIL_PASSWORD
    
    # Default reset URL if not provided
    if not reset_url_base:
        reset_url_base = "https://clotherr.online/reset-password"
    
    reset_link = f"{reset_url_base}?token={reset_token}"
    
    subject = "Reset Your Clotherr Password"
    
    body_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ text-align: center; padding: 20px 0; }}
            .logo {{ font-size: 28px; font-weight: bold; color: #000; }}
            .content {{ background: #f9f9f9; padding: 30px; border-radius: 8px; }}
            .button {{ display: inline-block; background: #000; color: #fff !important; padding: 14px 28px; 
                       text-decoration: none; border-radius: 6px; margin: 20px 0; }}
            .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
            .token-box {{ background: #e8e8e8; padding: 15px; border-radius: 4px; font-family: monospace; 
                         word-break: break-all; margin: 15px 0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">CLOTHERR</div>
            </div>
            <div class="content">
                <h2>Password Reset Request</h2>
                <p>Hello,</p>
                <p>We received a request to reset your password for your Clotherr account. 
                   Click the button below to reset it:</p>
                
                <p style="text-align: center;">
                    <a href="{reset_link}" class="button">Reset Password</a>
                </p>
                
                <p>Or copy and paste this token in the reset password page:</p>
                <div class="token-box">{reset_token}</div>
                
                <p><strong>This link will expire in 30 minutes.</strong></p>
                
                <p>If you didn't request a password reset, you can safely ignore this email. 
                   Your password will remain unchanged.</p>
            </div>
            <div class="footer">
                <p>© 2024 Clotherr. All rights reserved.</p>
                <p>This is an automated message, please do not reply.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    body_text = f"""
    CLOTHERR - Password Reset
    
    Hello,
    
    We received a request to reset your password for your Clotherr account.
    
    Click here to reset your password: {reset_link}
    
    Or use this token: {reset_token}
    
    This link will expire in 30 minutes.
    
    If you didn't request a password reset, you can safely ignore this email.
    
    © 2024 Clotherr
    """
    
    return send_email(to_email, subject, body_html, body_text, from_email, username, password)
