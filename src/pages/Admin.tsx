
import React, { useState } from "react";
import MainLayout from "@/components/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Shield, Users, FileImage, CreditCard, LineChart, Bell, User, Ban, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface UserData {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  bio: string;
  is_creator: boolean;
  is_banned: boolean;
}

const AdminPanel = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserData[]>([]);

  // Mock data for demonstration
  React.useEffect(() => {
    const mockUsers = [
      {
        id: "1",
        username: "artmaster",
        display_name: "Art Master",
        avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
        bio: "Digital artist specializing in surreal landscapes and futuristic designs.",
        is_creator: true,
        is_banned: false
      },
      {
        id: "2",
        username: "photoexplorers",
        display_name: "Photo Explorers",
        avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
        bio: "Capturing moments around the world. Travel photographer sharing unique perspectives.",
        is_creator: true,
        is_banned: false
      },
      {
        id: "3",
        username: "contentuser",
        display_name: "Regular User",
        avatar_url: "",
        bio: "Just a regular user enjoying content.",
        is_creator: false,
        is_banned: false
      },
      {
        id: "4",
        username: "banneduser",
        display_name: "Banned Account",
        avatar_url: "",
        bio: "This account has been banned for violating community guidelines.",
        is_creator: false,
        is_banned: true
      }
    ];

    setUsers(mockUsers);
  }, []);

  const handleUserAction = (userId: string, action: 'ban' | 'unban' | 'promote' | 'demote') => {
    setUsers(prevUsers => 
      prevUsers.map(user => {
        if (user.id === userId) {
          switch (action) {
            case 'ban':
              toast({
                title: "User banned",
                description: `${user.display_name} has been banned.`,
              });
              return { ...user, is_banned: true };
            case 'unban':
              toast({
                title: "User unbanned",
                description: `${user.display_name} has been unbanned.`,
              });
              return { ...user, is_banned: false };
            case 'promote':
              toast({
                title: "User promoted",
                description: `${user.display_name} is now a creator.`,
              });
              return { ...user, is_creator: true };
            case 'demote':
              toast({
                title: "User demoted",
                description: `${user.display_name} is no longer a creator.`,
              });
              return { ...user, is_creator: false };
            default:
              return user;
          }
        }
        return user;
      })
    );
  };

  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      user.username.toLowerCase().includes(query) ||
      user.display_name.toLowerCase().includes(query)
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
                            <p className="font-medium">{user.display_name}</p>
                            <p className="text-sm text-gray-500">@{user.username}</p>
                            <div className="flex mt-1 space-x-2">
                              {user.is_creator && (
                                <Badge variant="outline" className="bg-aura-blue/20 text-aura-blue border-aura-blue">
                                  Creator
                                </Badge>
                              )}
                              {user.is_banned && (
                                <Badge variant="outline" className="bg-red-500/20 text-red-500 border-red-500">
                                  Banned
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
                          
                          {user.is_creator ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleUserAction(user.id, 'demote')}
                            >
                              Revoke Creator
                            </Button>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleUserAction(user.id, 'promote')}
                            >
                              Make Creator
                            </Button>
                          )}
                          
                          <Button variant="outline" size="sm">View Details</Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-4 text-gray-500">No users found</p>
                  )}
                </div>
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
