import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('paddle-signature');
    
    // Verify webhook signature
    const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;
    if (webhookSecret && signature) {
      const ts = signature.split(';').find(s => s.startsWith('ts='))?.split('=')[1];
      const h1 = signature.split(';').find(s => s.startsWith('h1='))?.split('=')[1];
      
      const signedPayload = `${ts}:${body}`;
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(signedPayload)
        .digest('hex');
      
      if (h1 !== expectedSignature) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const event = JSON.parse(body);
    const supabase = createClient();

    switch (event.event_type) {
      case 'subscription.created':
      case 'subscription.activated': {
        const userId = event.data.custom_data?.user_id;
        if (userId) {
          await supabase.from('profiles').update({
            is_pro: true,
            subscription_id: event.data.id,
            subscription_status: 'active'
          }).eq('id', userId);
        }
        break;
      }

      case 'subscription.canceled':
      case 'subscription.paused': {
        const userId = event.data.custom_data?.user_id;
        if (userId) {
          await supabase.from('profiles').update({
            is_pro: false,
            subscription_status: event.data.status
          }).eq('id', userId);
        }
        break;
      }

      case 'subscription.updated': {
        const userId = event.data.custom_data?.user_id;
        if (userId) {
          await supabase.from('profiles').update({
            is_pro: event.data.status === 'active',
            subscription_status: event.data.status
          }).eq('id', userId);
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Paddle webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
