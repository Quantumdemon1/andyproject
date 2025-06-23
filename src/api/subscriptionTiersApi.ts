
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface SubscriptionTier {
  id: string;
  creator_id: string;
  name: string;
  description?: string;
  price: number;
  benefits: string[];
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export async function getCreatorTiers(creatorId: string): Promise<SubscriptionTier[]> {
  try {
    const { data, error } = await supabase
      .from('subscription_tiers')
      .select('*')
      .eq('creator_id', creatorId)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching creator tiers:', error);
    toast({
      title: 'Error',
      description: 'Failed to load subscription tiers',
      variant: 'destructive'
    });
    return [];
  }
}

export async function createSubscriptionTier(tier: Omit<SubscriptionTier, 'id' | 'created_at' | 'updated_at'>): Promise<SubscriptionTier | null> {
  try {
    const { data, error } = await supabase
      .from('subscription_tiers')
      .insert(tier)
      .select()
      .single();

    if (error) throw error;

    toast({
      title: 'Success',
      description: 'Subscription tier created successfully',
    });

    return data;
  } catch (error) {
    console.error('Error creating subscription tier:', error);
    toast({
      title: 'Error',
      description: 'Failed to create subscription tier',
      variant: 'destructive'
    });
    return null;
  }
}

export async function updateSubscriptionTier(
  tierId: string, 
  updates: Partial<Omit<SubscriptionTier, 'id' | 'creator_id' | 'created_at' | 'updated_at'>>
): Promise<SubscriptionTier | null> {
  try {
    const { data, error } = await supabase
      .from('subscription_tiers')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', tierId)
      .select()
      .single();

    if (error) throw error;

    toast({
      title: 'Success',
      description: 'Subscription tier updated successfully',
    });

    return data;
  } catch (error) {
    console.error('Error updating subscription tier:', error);
    toast({
      title: 'Error',
      description: 'Failed to update subscription tier',
      variant: 'destructive'
    });
    return null;
  }
}

export async function deleteSubscriptionTier(tierId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('subscription_tiers')
      .update({ is_active: false })
      .eq('id', tierId);

    if (error) throw error;

    toast({
      title: 'Success',
      description: 'Subscription tier deleted successfully',
    });

    return true;
  } catch (error) {
    console.error('Error deleting subscription tier:', error);
    toast({
      title: 'Error',
      description: 'Failed to delete subscription tier',
      variant: 'destructive'
    });
    return false;
  }
}
