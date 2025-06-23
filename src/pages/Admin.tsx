
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import MainLayout from '@/components/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminDashboard from '@/components/admin/AdminDashboard';
import AdminPostsTab from '@/components/admin/AdminPostsTab';
import AdminUsersTab from '@/components/admin/AdminUsersTab';

const Admin = () => {
  const { user } = useAuth();
  
  // Check if user is admin (you might want to implement proper role checking)
  const isAdmin = user?.email === 'admin@example.com'; // Update with your admin logic
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <MainLayout title="ADMIN PANEL">
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-aura-blue to-aura-purple bg-clip-text text-transparent">
          Admin Panel
        </h1>
        
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-aura-charcoal border border-white/10">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-aura-blue">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="posts" className="data-[state=active]:bg-aura-blue">
              Posts
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-aura-blue">
              Users
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="mt-6">
            <AdminDashboard />
          </TabsContent>
          
          <TabsContent value="posts" className="mt-6">
            <AdminPostsTab />
          </TabsContent>
          
          <TabsContent value="users" className="mt-6">
            <AdminUsersTab />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Admin;
