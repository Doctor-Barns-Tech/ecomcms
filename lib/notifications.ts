import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 'missing_api_key');
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@standardecom.com';
const EMAIL_FROM = process.env.EMAIL_FROM || 'Sarah Lawson Imports <noreply@sarahlawsonimports.com>';

// Helper to mask sensitive data in logs
function maskPhone(phone: string): string {
    if (!phone || phone.length < 6) return '***';
    return phone.slice(0, 4) + '****' + phone.slice(-2);
}

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
    if (!process.env.RESEND_API_KEY) {
        console.warn('[Email] RESEND_API_KEY not configured');
        return null;
    }
    try {
        const data = await resend.emails.send({
            from: EMAIL_FROM,
            to,
            subject,
            html,
        });
        console.log('[Email] Sent successfully to:', to.split('@')[0] + '@***');
        return data;
    } catch (error: any) {
        console.error('[Email] Failed:', error.message);
        return null;
    }
}

// Helper to format phone number for SMS (Ghana specific for now)
// Helper to format phone number for SMS (Ghana specific for now)
function formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters (including + for now)
    let cleaned = phone.replace(/\D/g, '');

    // If starts with 0 (e.g. 024...), replace 0 with 233
    if (cleaned.startsWith('0')) {
        cleaned = '233' + cleaned.substring(1);
    }

    // If length is 9 (e.g. 24...), prepend 233
    if (cleaned.length === 9) {
        cleaned = '233' + cleaned;
    }

    // Ensure it starts with correct country code before prepending +
    if (!cleaned.startsWith('233') && cleaned.length === 12) {
        // Assuming it's some other format, but if it starts with 233, it's fine.
    }

    // Return with + prefix as per E.164
    return '+' + cleaned;
}

export async function sendSMS({ to, message }: { to: string; message: string }) {
    // Moolre SMS API only requires X-API-VASKEY header for authentication
    // See: https://docs.moolre.com/#/send-sms
    // Allow MOOLRE_SMS_API_KEY or fall back to MOOLRE_API_KEY
    const smsVasKey = process.env.MOOLRE_SMS_API_KEY || process.env.MOOLRE_API_KEY;

    if (!smsVasKey) {
        console.warn('[SMS] Missing MOOLRE_SMS_API_KEY or MOOLRE_API_KEY');
        return null;
    }

    const recipient = formatPhoneNumber(to);

    try {
        console.log(`[SMS] Sending to ${maskPhone(recipient)}`);
        const response = await fetch('https://api.moolre.com/open/sms/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-VASKEY': smsVasKey
            },
            body: JSON.stringify({
                type: 1,
                senderid: 'SarahLawson',
                messages: [
                    {
                        recipient: recipient,
                        message: message
                    }
                ]
            })
        });

        const result = await response.json();
        console.log('[SMS] Result:', result.status === 1 ? 'Success' : 'Failed', '| Code:', result.code);
        if (result.status !== 1) {
            console.log('[SMS] Full Response:', JSON.stringify(result, null, 2));
        }
        return result;
    } catch (error: any) {
        console.error('[SMS] Error:', error.message);
        return null;
    }
}

export async function sendOrderConfirmation(order: any) {
    const { id, email, phone: orderPhone, shipping_address, total, created_at, order_number, metadata } = order;

    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/+$/, '');

    // Build customer name from available sources
    const getName = () => {
        // Try shipping_address first
        if (shipping_address?.full_name) return shipping_address.full_name;
        if (shipping_address?.firstName) {
            return shipping_address.lastName 
                ? `${shipping_address.firstName} ${shipping_address.lastName}` 
                : shipping_address.firstName;
        }
        // Fall back to metadata
        if (metadata?.first_name) {
            return metadata.last_name 
                ? `${metadata.first_name} ${metadata.last_name}` 
                : metadata.first_name;
        }
        return 'Customer';
    };
    const name = getName();

    // Prefer top-level phone, then shipping address phone
    const phone = orderPhone || shipping_address?.phone;

    // Get tracking number from metadata
    const trackingNumber = metadata?.tracking_number || '';
    const trackingUrl = `${baseUrl}/order-tracking?order=${order_number || id}`;

    console.log(`[Notification] Preparing for Order #${order_number} | Phone: ${phone ? 'Present' : 'Missing'} | Tracking: ${trackingNumber || 'None'}`);

    // 1. Email to Customer
    const customerEmailHtml = `
    <h1>Order Confirmation</h1>
    <p>Hi ${name},</p>
    <p>Thank you for your order! We've received it and are getting it ready.</p>
    <p><strong>Order ID:</strong> ${order_number || id}</p>
    <p><strong>Tracking Number:</strong> ${trackingNumber || 'Generating...'}</p>
    <p><strong>Total:</strong> GH₵${Number(total).toFixed(2)}</p>
    <br/>
    <p>Track your order here: <a href="${trackingUrl}">${trackingUrl}</a></p>
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
    <p><strong>Tracking:</strong> ${trackingNumber}</p>
    <p><strong>Customer:</strong> ${name} (${email})</p>
    <p><strong>Total:</strong> GH₵${Number(total).toFixed(2)}</p>
    <p><a href="${baseUrl}/admin/orders/${id}">View Order</a></p>
  `;

    await sendEmail({
        to: ADMIN_EMAIL,
        subject: `New Order #${order_number || id}`,
        html: adminEmailHtml
    });

    // 3. SMS to Customer (if phone exists)
    if (phone) {
        const smsMessage = trackingNumber
            ? `Hi ${name}, your order #${order_number || id} is confirmed! Tracking: ${trackingNumber}. Track here: ${trackingUrl}`
            : `Hi ${name}, your order #${order_number || id} at Sarah Lawson Imports is confirmed! Track here: ${trackingUrl}`;
        
        await sendSMS({
            to: phone,
            message: smsMessage
        });
    }
}

export async function sendOrderStatusUpdate(order: any, newStatus: string) {
    const { id, email, phone: orderPhone, shipping_address, order_number, metadata } = order;

    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/+$/, '');

    // Build customer name from available sources
    const getName = () => {
        if (shipping_address?.full_name) return shipping_address.full_name;
        if (shipping_address?.firstName) {
            return shipping_address.lastName 
                ? `${shipping_address.firstName} ${shipping_address.lastName}` 
                : shipping_address.firstName;
        }
        if (metadata?.first_name) {
            return metadata.last_name 
                ? `${metadata.first_name} ${metadata.last_name}` 
                : metadata.first_name;
        }
        return 'Customer';
    };
    const name = getName();
    const phone = orderPhone || shipping_address?.phone;
    const trackingNumber = metadata?.tracking_number || '';
    const trackingUrl = `${baseUrl}/order-tracking?order=${order_number || id}`;

    console.log(`[Notification] Status update for Order #${order_number} to ${newStatus} | Tracking: ${trackingNumber}`);

    const subject = `Order Update #${order_number || id}`;
    let message = `Your order #${order_number || id} status has been updated to ${newStatus}.`;
    let smsMessage = message;

    if (newStatus === 'shipped') {
        message = `Good news! Your order #${order_number || id} has been shipped and is on its way.`;
        smsMessage = trackingNumber
            ? `Good news ${name}! Order #${order_number || id} has shipped. Tracking: ${trackingNumber}. Track: ${trackingUrl}`
            : `Good news ${name}! Order #${order_number || id} has shipped. Track: ${trackingUrl}`;
    } else if (newStatus === 'delivered') {
        message = `Your order #${order_number || id} has been delivered. Enjoy!`;
        smsMessage = `Hi ${name}, your order #${order_number || id} has been delivered. Enjoy your purchase!`;
    } else if (newStatus === 'processing') {
        smsMessage = trackingNumber
            ? `Hi ${name}, your order #${order_number || id} is being processed. Tracking: ${trackingNumber}. Track: ${trackingUrl}`
            : `Hi ${name}, your order #${order_number || id} is being processed. Track: ${trackingUrl}`;
    } else {
        smsMessage = `Hi ${name}, order #${order_number || id} status: ${newStatus}. Track: ${trackingUrl}`;
    }

    // Email with tracking info
    const trackingHtml = trackingNumber 
        ? `<p><strong>Tracking Number:</strong> ${trackingNumber}</p>` 
        : '';
    
    await sendEmail({
        to: email,
        subject: subject,
        html: `<h1>Order Update</h1><p>Hi ${name},</p><p>${message}</p>${trackingHtml}<p><a href="${trackingUrl}">Track Your Order</a></p>`
    });

    // SMS
    if (phone) {
        await sendSMS({
            to: phone,
            message: smsMessage
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

export async function sendPaymentLink(order: any) {
    const { id, email, phone: orderPhone, shipping_address, total, order_number, metadata } = order;

    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/+$/, '');
    const paymentUrl = `${baseUrl}/pay/${id}`;

    // Build customer name from available sources
    const getName = () => {
        if (shipping_address?.full_name) return shipping_address.full_name;
        if (shipping_address?.firstName) {
            return shipping_address.lastName 
                ? `${shipping_address.firstName} ${shipping_address.lastName}` 
                : shipping_address.firstName;
        }
        if (metadata?.first_name) {
            return metadata.last_name 
                ? `${metadata.first_name} ${metadata.last_name}` 
                : metadata.first_name;
        }
        return 'Customer';
    };
    const name = getName();
    const phone = orderPhone || shipping_address?.phone;

    console.log(`[Notification] Sending payment link for Order #${order_number} | Phone: ${phone ? 'Present' : 'Missing'}`);

    // Email with payment link
    const emailHtml = `
    <h1>Complete Your Order</h1>
    <p>Hi ${name},</p>
    <p>Your order #${order_number} is waiting for payment.</p>
    <p><strong>Total:</strong> GH₵${Number(total).toFixed(2)}</p>
    <br/>
    <p><a href="${paymentUrl}" style="background-color: #047857; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Complete Payment</a></p>
    <br/>
    <p>Or copy this link: ${paymentUrl}</p>
    <br/>
    <p>This link will remain active until your order is completed or cancelled.</p>
  `;

    await sendEmail({
        to: email,
        subject: `Complete Your Order #${order_number}`,
        html: emailHtml
    });

    // SMS with payment link
    if (phone) {
        const smsMessage = `Hi ${name}, complete your order #${order_number} (GH₵${Number(total).toFixed(2)}) here: ${paymentUrl}`;
        
        await sendSMS({
            to: phone,
            message: smsMessage
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
