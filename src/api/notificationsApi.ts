
import { supabase } from '@/integrations/supabase/client';
import {toast} from '@/components/ui/use-toast';

export interface Notification {
  id: string;
  user_id: string;
  type: 'like' | 'comment' | 'follow' | 'subscription' | 'tip';
  title: string;
  content: string;
  read_at?: string;
  related_post_id?: string;
  related_user_id?: string;
  created_at: string;
}

export async function fetchNotifications(): Promise<Notification[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    
    // Type assertion to ensure the data matches our interface
    return (data || []) as Notification[];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    toast({
      title: 'Error',
      description: 'Failed to load notifications',
      variant: 'destructive'
    });
    return [];
  }
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', notificationId);

    if (error) throw error;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    toast({
      title: 'Error',
      description: 'Failed to mark notification as read',
      variant: 'destructive'
    });
  }
}

export async function markAllNotificationsAsRead(): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .is('read_at', null);

    if (error) throw error;

    toast({
      title: 'Success',
      description: 'All notifications marked as read',
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    toast({
      title: 'Error',
      description: 'Failed to mark notifications as read',
      variant: 'destructive'
    });
  }
}
