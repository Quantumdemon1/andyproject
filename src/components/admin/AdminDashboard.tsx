
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '@/api/adminApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, Heart, MessageCircle } from 'lucide-react';

const AdminDashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: getDashboardStats,
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading dashboard...</div>;
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'text-blue-400'
    },
    {
      title: 'Total Posts',
      value: stats?.totalPosts || 0,
      icon: FileText,
      color: 'text-green-400'
    },
    {
      title: 'Total Likes',
      value: stats?.totalLikes || 0,
      icon: Heart,
      color: 'text-red-400'
    },
    {
      title: 'Total Comments',
      value: stats?.totalComments || 0,
      icon: MessageCircle,
      color: 'text-purple-400'
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title} className="bg-aura-charcoal border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.value.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-aura-charcoal border-white/10">
        <CardHeader>
          <CardTitle>Platform Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Average posts per user</span>
              <span className="text-white font-medium">
                {stats?.totalUsers && stats.totalUsers > 0 
                  ? (stats.totalPosts / stats.totalUsers).toFixed(2)
                  : '0'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Average likes per post</span>
              <span className="text-white font-medium">
                {stats?.totalPosts && stats.totalPosts > 0 
                  ? (stats.totalLikes / stats.totalPosts).toFixed(2)
                  : '0'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Average comments per post</span>
              <span className="text-white font-medium">
                {stats?.totalPosts && stats.totalPosts > 0 
                  ? (stats.totalComments / stats.totalPosts).toFixed(2)
                  : '0'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
