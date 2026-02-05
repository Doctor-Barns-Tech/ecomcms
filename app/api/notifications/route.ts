import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendOrderConfirmation, sendOrderStatusUpdate, sendWelcomeMessage, sendContactMessage, sendEmail, sendSMS } from '@/lib/notifications';
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from '@/lib/rate-limit';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: Request) {
    try {
        // Rate limiting
        const clientId = getClientIdentifier(request);
        const rateLimitResult = checkRateLimit(`notification:${clientId}`, RATE_LIMITS.notification);
        
        if (!rateLimitResult.success) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { 
                    status: 429,
                    headers: {
                        'X-RateLimit-Remaining': '0',
                        'X-RateLimit-Reset': rateLimitResult.resetIn.toString()
                    }
                }
            );
        }

        const body = await request.json();
        const { type, payload } = body;

        if (!payload) {
            return NextResponse.json({ error: 'Payload required' }, { status: 400 });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Authentication requirements based on notification type
        // 'campaign' requires admin/staff role
        // 'order_updated', 'order_status' requires admin/staff role (status updates from admin)
        // 'order_created', 'welcome', 'contact' can be triggered from checkout/forms
        
        const requiresAdminAuth = ['campaign', 'order_updated', 'order_status'].includes(type);

        if (requiresAdminAuth) {
            const authToken = request.headers.get('authorization')?.replace('Bearer ', '');
            if (!authToken) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }

            const { data: { user }, error } = await supabase.auth.getUser(authToken);
            if (error || !user) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }

            // Verify admin/staff role
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (!profile || (profile.role !== 'admin' && profile.role !== 'staff')) {
                return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
            }
        }

        if (type === 'order_created') {
            await sendOrderConfirmation(payload);
            return NextResponse.json({ success: true, message: 'Order confirmation sent' });
        }

        if (type === 'order_updated') {
            const { order, status } = payload;
            await sendOrderStatusUpdate(order, status);
            return NextResponse.json({ success: true, message: 'Status update sent' });
        }

        // Handle order_status from admin panel (different payload structure)
        if (type === 'order_status') {
            const { email, name, orderNumber, status, trackingNumber, phone } = payload;
            // Build order object for sendOrderStatusUpdate
            const orderData = {
                order_number: orderNumber,
                email: email,
                phone: phone,
                shipping_address: { firstName: name, phone: phone }
            };
            await sendOrderStatusUpdate(orderData, status);
            return NextResponse.json({ success: true, message: 'Status update sent' });
        }

        if (type === 'welcome') {
            await sendWelcomeMessage(payload);
            return NextResponse.json({ success: true, message: 'Welcome message sent' });
        }

        if (type === 'contact') {
            await sendContactMessage(payload);
            return NextResponse.json({ success: true, message: 'Contact message sent' });
        }

        if (type === 'campaign') {
            const { recipients, subject, message, channels } = payload;

            // recipients is array of { email, phone, name }
            // Basic loop - in production use a queue
            const results = { email: 0, sms: 0 };

            for (const recipient of recipients) {
                if (channels.email && recipient.email) {
                    await sendEmail({
                        to: recipient.email,
                        subject: subject,
                        html: `<h1>${subject}</h1><p>Hi ${recipient.name || 'Customer'},</p><p>${message.replace(/\n/g, '<br/>')}</p>`
                    });
                    results.email++;
                }

                if (channels.sms && recipient.phone) {
                    await sendSMS({
                        to: recipient.phone,
                        message: message
                    });
                    results.sms++;
                }
            }

            return NextResponse.json({ success: true, message: `Campaign sent to ${results.email} emails and ${results.sms} numbers.` });
        }

        return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 });

    } catch (error: any) {
        console.error('Notification API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
