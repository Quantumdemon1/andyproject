
import React, { useState } from "react";
import MainLayout from "@/components/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Shield, Users, FileImage, CreditCard, LineChart, User, Ban, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  fetchAllUsers, 
  banUser, 
  unbanUser, 
  promoteToCreator, 
  demoteFromCreator,
  getAdminStats,
  type AdminUserData
} from "@/api/adminApi";

const AdminPanel = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch users data
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: fetchAllUsers,
  });

  // Fetch admin stats
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: getAdminStats,
  });

  const handleUserAction = async (userId: string, action: 'ban' | 'unban' | 'promote' | 'demote') => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    let success = false;
    let actionDescription = '';

    try {
      switch (action) {
        case 'ban':
          success = await banUser(userId);
          actionDescription = `${user.display_name || user.username} has been banned.`;
          break;
        case 'unban':
          success = await unbanUser(userId);
          actionDescription = `${user.display_name || user.username} has been unbanned.`;
          break;
        case 'promote':
          success = await promoteToCreator(userId);
          actionDescription = `${user.display_name || user.username} is now a creator.`;
          break;
        case 'demote':
          success = await demoteFromCreator(userId);
          actionDescription = `${user.display_name || user.username} is no longer a creator.`;
          break;
      }

      if (success) {
        toast({
          title: "Success",
          description: actionDescription,
        });
        // Refetch users data
        queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      }
    } catch (error) {
      console.error('Error performing user action:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      user.username?.toLowerCase().includes(query) ||
      user.display_name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query)
    );
  });

  return (
    <MainLayout title="ADMIN PANEL" backButton>
      <div className="p-4 max-w-6xl mx-auto">
        <Card className="mb-8">
          <CardHeader className="bg-gradient-to-r from-aura-purple to-aura-blue text-white">
            <div className="flex items-center gap-2">
              <Shield size={24} />
              <div>
                <CardTitle>Admin Dashboard</CardTitle>
                <CardDescription className="text-gray-200">
                  Manage users, content, and platform settings
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          {stats && (
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-aura-blue">{stats.totalUsers}</div>
                  <div className="text-sm text-gray-500">Total Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-aura-purple">{stats.totalPosts}</div>
                  <div className="text-sm text-gray-500">Total Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">{stats.totalNotifications}</div>
                  <div className="text-sm text-gray-500">Notifications</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-500">{users.filter(u => u.role === 'creator').length}</div>
                  <div className="text-sm text-gray-500">Creators</div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        <Tabs defaultValue="users" className="mb-8">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="users">
              <Users size={16} className="mr-2" /> Users
            </TabsTrigger>
            <TabsTrigger value="content">
              <FileImage size={16} className="mr-2" /> Content
            </TabsTrigger>
            <TabsTrigger value="payments">
              <CreditCard size={16} className="mr-2" /> Payments
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <LineChart size={16} className="mr-2" /> Analytics
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Search, moderate and manage platform users
                </CardDescription>
                <div className="mt-4 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input 
                    placeholder="Search users by name or username..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Loading users...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map(user => (
                        <div key={user.id} className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
                          <div className="flex items-center space-x-4">
                            <Avatar>
                              {user.avatar_url ? (
                                <AvatarImage src={user.avatar_url} />
                              ) : (
                                <AvatarFallback>
                                  <User size={20} />
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.display_name || user.username || 'Unknown User'}</p>
                              <p className="text-sm text-gray-500">@{user.username || 'no-username'}</p>
                              <div className="flex mt-1 space-x-2">
                                {user.role === 'creator' && (
                                  <Badge variant="outline" className="bg-aura-blue/20 text-aura-blue border-aura-blue">
                                    Creator
                                  </Badge>
                                )}
                                {user.role === 'admin' && (
                                  <Badge variant="outline" className="bg-aura-purple/20 text-aura-purple border-aura-purple">
                                    Admin
                                  </Badge>
                                )}
                                {user.is_banned && (
                                  <Badge variant="outline" className="bg-red-500/20 text-red-500 border-red-500">
                                    Banned
                                  </Badge>
                                )}
                                {user.is_online && (
                                  <Badge variant="outline" className="bg-green-500/20 text-green-500 border-green-500">
                                    Online
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {user.is_banned ? (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleUserAction(user.id, 'unban')}
                              >
                                <CheckCircle size={16} className="mr-1" /> Unban
                              </Button>
                            ) : (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-red-500 border-red-500 hover:bg-red-500/10"
                                onClick={() => handleUserAction(user.id, 'ban')}
                              >
                                <Ban size={16} className="mr-1" /> Ban
                              </Button>
                            )}
                            
                            {user.role === 'creator' ? (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleUserAction(user.id, 'demote')}
                              >
                                Revoke Creator
                              </Button>
                            ) : user.role !== 'admin' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleUserAction(user.id, 'promote')}
                              >
                                Make Creator
                              </Button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center py-4 text-gray-500">No users found</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle>Content Management</CardTitle>
                <CardDescription>
                  Review and moderate user-generated content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-10 text-gray-500">
                  Content moderation features coming soon
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payment Management</CardTitle>
                <CardDescription>
                  Review transactions and manage payment settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-10 text-gray-500">
                  Payment management features coming soon
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics & Reporting</CardTitle>
                <CardDescription>
                  View platform statistics and generate reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-10 text-gray-500">
                  Analytics features coming soon
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default AdminPanel;
