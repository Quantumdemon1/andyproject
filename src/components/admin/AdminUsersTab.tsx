
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchAllUsers, banUser, unbanUser } from '@/api/adminApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { UserX, UserCheck, Users, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const AdminUsersTab = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-users', currentPage],
    queryFn: () => fetchAllUsers(currentPage, 10),
  });

  const handleBanUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to ban this user?')) {
      const success = await banUser(userId);
      if (success) {
        queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      }
    }
  };

  const handleUnbanUser = async (userId: string) => {
    const success = await unbanUser(userId);
    if (success) {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading users...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-400">Error loading users</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Users Management</h2>
        <div className="text-sm text-gray-400">
          Total users: {data?.totalCount || 0}
        </div>
      </div>

      <div className="space-y-4">
        {data?.users.map((user) => (
          <Card key={user.id} className="bg-aura-charcoal border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback>{user.username[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-white">
                        {user.display_name || user.username}
                      </h3>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                      {user.is_banned && (
                        <Badge variant="destructive">Banned</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-400">@{user.username}</p>
                    
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{user.follower_count} followers</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FileText className="h-4 w-4" />
                        <span>{user.post_count} posts</span>
                      </div>
                      {user.last_seen && (
                        <span>
                          Last seen {formatDistanceToNow(new Date(user.last_seen), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  {user.is_banned ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnbanUser(user.id)}
                      className="text-green-400 border-green-400 hover:bg-green-400/10"
                    >
                      <UserCheck className="h-4 w-4 mr-1" />
                      Unban
                    </Button>
                  ) : (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleBanUser(user.id)}
                    >
                      <UserX className="h-4 w-4 mr-1" />
                      Ban
                    </Button>
                  )}
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

export default AdminUsersTab;
