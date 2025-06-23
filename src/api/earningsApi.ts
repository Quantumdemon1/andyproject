
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface EarningsData {
  totalRevenue: number;
  subscriptionRevenue: number;
  purchaseRevenue: number;
  monthlyRevenue: number;
  recentTransactions: Transaction[];
  payoutBalance: number;
}

export interface Transaction {
  id: string;
  type: 'subscription' | 'purchase';
  amount: number;
  currency: string;
  created_at: string;
  description: string;
  status: string;
}

export async function fetchCreatorEarnings(creatorId: string): Promise<EarningsData> {
  try {
    // Get subscription revenue
    const { data: subscriptions, error: subsError } = await supabase
      .from('subscriptions')
      .select('price, created_at, status')
      .eq('creator_id', creatorId)
      .eq('status', 'active');

    if (subsError) throw subsError;

    // Get purchase revenue
    const { data: purchases, error: purchasesError } = await supabase
      .from('art_purchases')
      .select('amount, created_at, artwork_name, status')
      .eq('seller_id', creatorId)
      .eq('status', 'paid');

    if (purchasesError) throw purchasesError;

    const subscriptionRevenue = subscriptions?.reduce((total, sub) => total + Number(sub.price), 0) || 0;
    const purchaseRevenue = purchases?.reduce((total, purchase) => total + Number(purchase.amount), 0) || 0;
    const totalRevenue = subscriptionRevenue + purchaseRevenue;

    // Calculate monthly revenue (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const monthlySubscriptions = subscriptions?.filter(sub => 
      new Date(sub.created_at) >= thirtyDaysAgo
    ) || [];
    const monthlyPurchases = purchases?.filter(purchase => 
      new Date(purchase.created_at) >= thirtyDaysAgo
    ) || [];

    const monthlyRevenue = 
      monthlySubscriptions.reduce((total, sub) => total + Number(sub.price), 0) +
      monthlyPurchases.reduce((total, purchase) => total + Number(purchase.amount), 0);

    // Recent transactions (last 10)
    const recentTransactions: Transaction[] = [
      ...subscriptions?.slice(0, 5).map(sub => ({
        id: `sub_${sub.created_at}`,
        type: 'subscription' as const,
        amount: Number(sub.price),
        currency: 'USD',
        created_at: sub.created_at,
        description: 'Monthly subscription',
        status: sub.status
      })) || [],
      ...purchases?.slice(0, 5).map(purchase => ({
        id: purchase.id || `purchase_${purchase.created_at}`,
        type: 'purchase' as const,
        amount: Number(purchase.amount),
        currency: 'USD',
        created_at: purchase.created_at,
        description: purchase.artwork_name,
        status: purchase.status
      })) || []
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10);

    return {
      totalRevenue,
      subscriptionRevenue,
      purchaseRevenue,
      monthlyRevenue,
      recentTransactions,
      payoutBalance: totalRevenue * 0.85 // Assuming 15% platform fee
    };
  } catch (error) {
    console.error('Error fetching creator earnings:', error);
    toast({
      title: 'Error',
      description: 'Failed to fetch earnings data',
      variant: 'destructive'
    });
    return {
      totalRevenue: 0,
      subscriptionRevenue: 0,
      purchaseRevenue: 0,
      monthlyRevenue: 0,
      recentTransactions: [],
      payoutBalance: 0
    };
  }
}

export async function requestPayout(amount: number): Promise<boolean> {
  try {
    const { data, error } = await supabase.functions.invoke('request-payout', {
      body: { amount }
    });

    if (error) throw error;

    toast({
      title: 'Payout Requested',
      description: `Payout of $${amount} has been requested and will be processed within 2-3 business days.`
    });

    return true;
  } catch (error) {
    console.error('Error requesting payout:', error);
    toast({
      title: 'Payout Error',
      description: 'Failed to request payout. Please try again.',
      variant: 'destructive'
    });
    return false;
  }
}
