import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 'missing_api_key');
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@standardecom.com';

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY is missing. Email not sent.');
        return null;
    }
    try {
        const data = await resend.emails.send({
            from: 'Standard Store <onboarding@resend.dev>', // Default Resend test domain
            to,
            subject,
            html,
        });
        console.log('Email sent:', data);
        return data;
    } catch (error) {
        console.error('Email Error:', error);
        return null;
    }
}

export async function sendSMS({ to, message }: { to: string; message: string }) {
    if (!process.env.MOOLRE_API_KEY) {
        console.warn('MOOLRE_API_KEY is missing. SMS not sent.');
        return null;
    }

    // Basic phone number formatting (ensure it has country code if possible, or assume Moolre handles raw)
    // Moolre usually expects international format without + or with it, documentation doesn't specify strictly but examples show simple strings.

    try {
        console.log(`Sending SMS to ${to}: ${message}`);
        const response = await fetch('https://api.moolre.com/open/sms/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-VASKEY': process.env.MOOLRE_API_KEY
            },
            body: JSON.stringify({
                type: 1,
                senderid: 'Standard', // Customizable
                messages: [
                    {
                        recipient: to,
                        message: message
                    }
                ]
            })
        });

        const result = await response.json();
        console.log('SMS Result:', result);
        return result;
    } catch (error) {
        console.error('SMS Error:', error);
        return null;
    }
}

export async function sendOrderConfirmation(order: any) {
    const { id, email, shipping_address, total, created_at, order_number } = order;
    const name = shipping_address?.firstName || 'Customer';
    const phone = shipping_address?.phone;

    // 1. Email to Customer
    const customerEmailHtml = `
    <h1>Order Confirmation</h1>
    <p>Hi ${name},</p>
    <p>Thank you for your order! We've received it and are getting it ready.</p>
    <p><strong>Order ID:</strong> ${order_number || id}</p>
    <p><strong>Total:</strong> GH₵${total.toFixed(2)}</p>
    <br/>
    <p>We will notify you when your order ships.</p>
  `;

    await sendEmail({
        to: email,
        subject: `Order Confirmation #${order_number || id}`,
        html: customerEmailHtml
    });

    // 2. Email to Admin
    const adminEmailHtml = `
    <h1>New Order Received</h1>
    <p><strong>Order ID:</strong> ${order_number || id}</p>
    <p><strong>Customer:</strong> ${name} (${email})</p>
    <p><strong>Total:</strong> GH₵${total.toFixed(2)}</p>
    <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/orders/${id}">View Order</a></p>
  `;

    await sendEmail({
        to: ADMIN_EMAIL,
        subject: `New Order #${order_number || id}`,
        html: adminEmailHtml
    });

    // 3. SMS to Customer (if phone exists)
    if (phone) {
        await sendSMS({
            to: phone,
            message: `Hi ${name}, thanks for your order #${order_number || id} at Standard Store! We will update you when it ships.`
        });
    }
}

export async function sendOrderStatusUpdate(order: any, newStatus: string) {
    const { id, email, shipping_address, order_number } = order;
    const name = shipping_address?.firstName || 'Customer';
    const phone = shipping_address?.phone;

    const subject = `Order Update #${order_number || id}`;
    let message = `Your order #${order_number || id} status has been updated to ${newStatus}.`;

    if (newStatus === 'shipped') {
        message = `Good news! Your order #${order_number || id} has been shipped and is on its way.`;
    } else if (newStatus === 'delivered') {
        message = `Your order #${order_number || id} has been delivered. Enjoy!`;
    }

    // Email
    await sendEmail({
        to: email,
        subject: subject,
        html: `<h1>Order Update</h1><p>Hi ${name},</p><p>${message}</p>`
    });

    // SMS
    if (phone) {
        await sendSMS({
            to: phone,
            message: message
        });
    }
}
