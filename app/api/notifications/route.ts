import { NextResponse } from 'next/server';
import { sendOrderConfirmation, sendOrderStatusUpdate } from '@/lib/notifications';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { type, payload } = body;

        if (!payload) {
            return NextResponse.json({ error: 'Payload required' }, { status: 400 });
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

        return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 });

    } catch (error: any) {
        console.error('Notification API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
