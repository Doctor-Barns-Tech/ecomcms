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
            from: 'Sarah Lawson Imports <orders@yourdomain.com>', // User needs to configure this
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

// Helper to format phone number for SMS (Ghana specific for now)
function formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');

    // If starts with 0, replace with 233
    if (cleaned.startsWith('0')) {
        cleaned = '233' + cleaned.substring(1);
    }

    // If starts with +, remove it (Moolre usually prefers no +)
    if (phone.startsWith('+')) {
        cleaned = phone.replace('+', '');
    }

    // Ensure it has country code if missing (and length is 9, e.g. 244...)
    // But 0244 is 10 digits. 244 is 9.
    if (cleaned.length === 9) {
        cleaned = '233' + cleaned;
    }

    return cleaned;
}

export async function sendSMS({ to, message }: { to: string; message: string }) {
    if (!process.env.MOOLRE_API_KEY) {
        console.warn('MOOLRE_API_KEY is missing. SMS not sent.');
        return null;
    }

    const recipient = formatPhoneNumber(to);

    try {
        console.log(`Sending SMS to ${recipient}: ${message}`);
        const response = await fetch('https://api.moolre.com/open/sms/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-VASKEY': process.env.MOOLRE_API_KEY
            },
            body: JSON.stringify({
                type: 1,
                senderid: 'Standard', // Use a generic/short name. Max 11 chars.
                messages: [
                    {
                        recipient: recipient,
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
            message: `Hi ${name}, thanks for your order #${order_number || id} at Sarah Lawson Imports! We will update you when it ships.`
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

export async function sendWelcomeMessage(user: { email: string, firstName: string, phone?: string }) {
    const { email, firstName, phone } = user;

    // Email
    await sendEmail({
        to: email,
        subject: `Welcome to Sarah Lawson Imports!`,
        html: `
      <h1>Welcome, ${firstName}!</h1>
      <p>Thank you for joining the Sarah Lawson Imports family.</p>
      <p>We're thrilled to have you with us. Explore our collection of premium beauty products and enjoy your shopping journey.</p>
      <br/>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/shop">Start Shopping</a>
    `
    });

    // SMS
    if (phone) {
        await sendSMS({
            to: phone,
            message: `Welcome ${firstName}! Thanks for joining Sarah Lawson Imports.`
        });
    }
}

export async function sendContactMessage(data: { name: string, email: string, subject: string, message: string }) {
    const { name, email, subject, message } = data;

    // 1. Acknowledge to User
    await sendEmail({
        to: email,
        subject: `We received your message: ${subject}`,
        html: `
      <p>Hi ${name},</p>
      <p>Thanks for contacting Sarah Lawson Imports.</p>
      <p>We have received your message regarding "${subject}" and will get back to you shortly.</p>
    `
    });

    // 2. Alert Admin
    await sendEmail({
        to: ADMIN_EMAIL,
        subject: `Contact: ${subject}`,
        html: `
      <h1>New Contact Message</h1>
      <p><strong>From:</strong> ${name} (${email})</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `
    });
}
