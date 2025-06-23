
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchModerationActions } from '@/api/reportsApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Ban, Trash2, RotateCcw, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const AdminModerationTab = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-moderation-actions', currentPage],
    queryFn: () => fetchModerationActions(currentPage, 10),
  });

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'ban':
        return <Ban className="h-4 w-4 text-red-500" />;
      case 'unban':
        return <RotateCcw className="h-4 w-4 text-green-500" />;
      case 'delete_post':
      case 'delete_comment':
        return <Trash2 className="h-4 w-4 text-orange-500" />;
      case 'restore_post':
      case 'restore_comment':
        return <RotateCcw className="h-4 w-4 text-blue-500" />;
      case 'warn':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Shield className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'ban':
        return 'bg-red-100 text-red-800';
      case 'unban':
        return 'bg-green-100 text-green-800';
      case 'delete_post':
      case 'delete_comment':
        return 'bg-orange-100 text-orange-800';
      case 'restore_post':
      case 'restore_comment':
        return 'bg-blue-100 text-blue-800';
      case 'warn':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading moderation actions...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-400">Error loading moderation actions</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Moderation Actions Log</h2>
        <div className="text-sm text-gray-400">
          Total actions: {data?.totalCount || 0}
        </div>
      </div>

      <div className="space-y-4">
        {data?.actions.map((action) => (
          <Card key={action.id} className="bg-aura-charcoal border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {getActionIcon(action.action_type)}
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className={getActionColor(action.action_type)}>
                        {action.action_type.replace('_', ' ')}
                      </Badge>
                      {action.duration_hours && (
                        <Badge variant="outline">
                          {action.duration_hours}h duration
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-white font-medium mb-1">
                      Reason: {action.reason}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-400">
                      {action.admin_id && (
                        <div>
                          <span>Admin ID:</span>
                          <span className="ml-2 font-mono">{action.admin_id.slice(0, 8)}...</span>
                        </div>
                      )}
                      {action.target_user_id && (
                        <div>
                          <span>Target User:</span>
                          <span className="ml-2 font-mono">{action.target_user_id.slice(0, 8)}...</span>
                        </div>
                      )}
                      {action.target_post_id && (
                        <div>
                          <span>Target Post:</span>
                          <span className="ml-2 font-mono">{action.target_post_id.slice(0, 8)}...</span>
                        </div>
                      )}
                      {action.target_comment_id && (
                        <div>
                          <span>Target Comment:</span>
                          <span className="ml-2 font-mono">{action.target_comment_id.slice(0, 8)}...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm text-gray-400">
                    {formatDistanceToNow(new Date(action.created_at), { addSuffix: true })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="px-4 py-2 text-white">
            Page {currentPage} of {data.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(data.totalPages, prev + 1))}
            disabled={currentPage === data.totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdminModerationTab;
