import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client (needs service role for updates)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const requestUrl = new URL(req.url);
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || requestUrl.origin;

        console.log('Moolre Callback Received:', body);

        // Extract payment details from Moolre callback
        // Typical Moolre callback structure (verify with actual docs):
        const {
            status,
            externalref, // This is our orderNumber
            reference,   // Moolre's reference
            amount,
            // Add other fields Moolre sends
        } = body;

        if (!externalref) {
            console.error('Missing externalref in callback');
            return NextResponse.json({ success: false, message: 'Invalid callback data' }, { status: 400 });
        }

        // Verify payment was successful
        // Check Moolre's documentation for exact success status value
        const isSuccess = status === 'success' || status === 'completed' || status === 1;

        if (isSuccess) {
            // Update order in database
            const { data: order, error: updateError } = await supabase
                .from('orders')
                .update({
                    payment_status: 'paid',
                    status: 'processing',
                    metadata: {
                        moolre_reference: reference,
                        payment_verified_at: new Date().toISOString()
                    }
                })
                .eq('order_number', externalref)
                .select()
                .single();

            if (updateError) {
                console.error('Failed to update order:', updateError);
                return NextResponse.json({ success: false, message: 'Database update failed' }, { status: 500 });
            }

            // Send order confirmation notification
            fetch(`${baseUrl}/api/notifications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'order_created',
                    payload: order
                })
            }).catch(err => console.error('Notification error:', err));

            console.log(`Order ${externalref} marked as paid`);

            return NextResponse.json({ success: true, message: 'Payment verified' });
        } else {
            // Payment failed or pending
            console.log(`Payment failed/pending for order ${externalref}, status: ${status}`);

            // Optionally update order status to 'payment_failed'
            await supabase
                .from('orders')
                .update({
                    payment_status: 'failed',
                    metadata: {
                        moolre_reference: reference,
                        failure_reason: body.message || 'Payment failed'
                    }
                })
                .eq('order_number', externalref);

            return NextResponse.json({ success: false, message: 'Payment not successful' });
        }

    } catch (error: any) {
        console.error('Callback Error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

// Also handle GET requests (some payment gateways send verification requests)
export async function GET(req: Request) {
    return NextResponse.json({ message: 'Moolre callback endpoint' });
}
