
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface Report {
  id: string;
  reporter_id: string;
  reported_user_id?: string;
  reported_post_id?: string;
  reported_comment_id?: string;
  report_type: 'spam' | 'harassment' | 'inappropriate_content' | 'copyright' | 'fake_account' | 'other';
  reason: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  admin_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ModerationAction {
  id: string;
  admin_id?: string;
  target_user_id?: string;
  target_post_id?: string;
  target_comment_id?: string;
  action_type: 'warn' | 'ban' | 'unban' | 'delete_post' | 'delete_comment' | 'restore_post' | 'restore_comment';
  reason: string;
  duration_hours?: number;
  created_at: string;
}

export async function createReport(reportData: {
  reported_user_id?: string;
  reported_post_id?: string;
  reported_comment_id?: string;
  report_type: string;
  reason: string;
}): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('reports')
      .insert({
        reporter_id: user.id,
        ...reportData
      });

    if (error) throw error;

    toast({
      title: 'Report Submitted',
      description: 'Thank you for your report. We will review it shortly.',
    });

    return true;
  } catch (error) {
    console.error('Error creating report:', error);
    toast({
      title: 'Error',
      description: 'Failed to submit report. Please try again.',
      variant: 'destructive'
    });
    return false;
  }
}

export async function fetchReports(page: number = 1, limit: number = 20): Promise<{
  reports: Report[];
  totalCount: number;
  totalPages: number;
}> {
  try {
    const offset = (page - 1) * limit;

    // Get total count
    const { count: totalCount, error: countError } = await supabase
      .from('reports')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    // Get reports
    const { data: reportsData, error: reportsError } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (reportsError) throw reportsError;

    return {
      reports: reportsData || [],
      totalCount: totalCount || 0,
      totalPages: Math.ceil((totalCount || 0) / limit)
    };
  } catch (error) {
    console.error('Error fetching reports:', error);
    toast({
      title: 'Error',
      description: 'Failed to fetch reports',
      variant: 'destructive'
    });
    return { reports: [], totalCount: 0, totalPages: 0 };
  }
}

export async function updateReportStatus(
  reportId: string, 
  status: string, 
  adminNotes?: string
): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('reports')
      .update({
        status,
        admin_notes: adminNotes,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', reportId);

    if (error) throw error;

    toast({
      title: 'Report Updated',
      description: 'Report status has been updated successfully.'
    });

    return true;
  } catch (error) {
    console.error('Error updating report:', error);
    toast({
      title: 'Error',
      description: 'Failed to update report status',
      variant: 'destructive'
    });
    return false;
  }
}

export async function fetchModerationActions(page: number = 1, limit: number = 20): Promise<{
  actions: ModerationAction[];
  totalCount: number;
  totalPages: number;
}> {
  try {
    const offset = (page - 1) * limit;

    // Get total count
    const { count: totalCount, error: countError } = await supabase
      .from('moderation_actions')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    // Get actions
    const { data: actionsData, error: actionsError } = await supabase
      .from('moderation_actions')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (actionsError) throw actionsError;

    return {
      actions: actionsData || [],
      totalCount: totalCount || 0,
      totalPages: Math.ceil((totalCount || 0) / limit)
    };
  } catch (error) {
    console.error('Error fetching moderation actions:', error);
    return { actions: [], totalCount: 0, totalPages: 0 };
  }
}
