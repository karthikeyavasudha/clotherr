from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from app.core.config import settings
from pathlib import Path

conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=587,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

async def send_order_confirmation_email(email_to: str, order_id: str, total_amount: float, items: list = []):
    """
    Send an order confirmation email to the user with product details.
    """
    
    items_html = ""
    for item in items:
        items_html += f"""
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">{item['name']}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">{item['quantity']}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹{item['price']:.2f}</td>
        </tr>
        """

    html = f"""
    <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #000; text-align: center;">Order Confirmed!</h2>
                <p>Hi there,</p>
                <p>Thank you for your order at Clotherr. We have received your order and are processing it.</p>
                
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p style="margin: 0;"><strong>Order ID:</strong> {order_id}</p>
                </div>

                <h3 style="border-bottom: 2px solid #000; padding-bottom: 10px;">Order Summary</h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <thead>
                        <tr style="background-color: #f5f5f5;">
                            <th style="padding: 10px; text-align: left;">Product</th>
                            <th style="padding: 10px; text-align: center;">Qty</th>
                            <th style="padding: 10px; text-align: right;">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items_html}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Total:</td>
                            <td style="padding: 10px; text-align: right; font-weight: bold;">₹{total_amount:.2f}</td>
                        </tr>
                    </tfoot>
                </table>
                
                <p>We will notify you once your items are shipped.</p>
                
                <p style="margin-top: 30px; font-size: 12px; color: #888; text-align: center;">
                    © 2025 Clotherr. All rights reserved.
                </p>
            </div>
        </body>
    </html>
    """

    message = MessageSchema(
        subject=f"Order Confirmation - #{order_id[:8]}",
        recipients=[email_to],
        body=html,
        subtype=MessageType.html
    )

    fm = FastMail(conf)
    await fm.send_message(message)
