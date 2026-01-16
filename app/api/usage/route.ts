import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '../auth-helper';

const FREE_LIMIT = 5;

// GET - Check current usage
export async function GET(request: NextRequest) {
  try {
    const { user, supabase } = await getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is pro
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_pro')
      .eq('id', user.id)
      .single();

    const isPro = profile?.is_pro || false;

    if (isPro) {
      return NextResponse.json({ 
        isPro: true, 
        used: 0, 
        limit: Infinity,
        remaining: Infinity 
      });
    }

    // Get current month usage
    const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
    
    const { data: usage } = await supabase
      .from('usage_tracking')
      .select('count')
      .eq('user_id', user.id)
      .eq('month', currentMonth)
      .single();

    const used = usage?.count || 0;
    const remaining = Math.max(0, FREE_LIMIT - used);

    return NextResponse.json({ 
      isPro: false, 
      used, 
      limit: FREE_LIMIT,
      remaining 
    });
  } catch (error) {
    console.error('Usage check error:', error);
    return NextResponse.json({ error: 'Failed to check usage' }, { status: 500 });
  }
}

// POST - Increment usage
export async function POST(request: NextRequest) {
  try {
    const { user, supabase } = await getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is pro
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_pro')
      .eq('id', user.id)
      .single();

    const isPro = profile?.is_pro || false;

    // Pro users have unlimited usage
    if (isPro) {
      return NextResponse.json({ success: true, isPro: true });
    }

    // Get current month
    const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
    
    // Check current usage
    const { data: existingUsage } = await supabase
      .from('usage_tracking')
      .select('count')
      .eq('user_id', user.id)
      .eq('month', currentMonth)
      .single();

    const currentCount = existingUsage?.count || 0;

    // Check if limit reached
    if (currentCount >= FREE_LIMIT) {
      return NextResponse.json({ 
        error: 'Monthly limit reached. Upgrade to Pro for unlimited access.',
        limitReached: true,
        used: currentCount,
        limit: FREE_LIMIT
      }, { status: 403 });
    }

    // Upsert usage record
    const { error: upsertError } = await supabase
      .from('usage_tracking')
      .upsert({
        user_id: user.id,
        month: currentMonth,
        count: currentCount + 1
      }, {
        onConflict: 'user_id,month'
      });

    if (upsertError) {
      console.error('Usage upsert error:', upsertError);
      return NextResponse.json({ error: 'Failed to update usage' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      used: currentCount + 1,
      remaining: FREE_LIMIT - (currentCount + 1)
    });
  } catch (error) {
    console.error('Usage increment error:', error);
    return NextResponse.json({ error: 'Failed to update usage' }, { status: 500 });
  }
}
