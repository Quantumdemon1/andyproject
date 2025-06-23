
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchReports, updateReportStatus } from '@/api/reportsApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const AdminReportsTab = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-reports', currentPage],
    queryFn: () => fetchReports(currentPage, 10),
  });

  const handleUpdateReport = async (reportId: string) => {
    if (!newStatus) return;
    
    const success = await updateReportStatus(reportId, newStatus, adminNotes);
    if (success) {
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
      setSelectedReport(null);
      setAdminNotes('');
      setNewStatus('');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'reviewed':
        return <AlertTriangle className="h-4 w-4 text-blue-500" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'dismissed':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'dismissed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading reports...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-400">Error loading reports</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Reports Management</h2>
        <div className="text-sm text-gray-400">
          Total reports: {data?.totalCount || 0}
        </div>
      </div>

      <div className="space-y-4">
        {data?.reports.map((report) => (
          <Card key={report.id} className="bg-aura-charcoal border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(report.status)}
                  <Badge className={getStatusColor(report.status)}>
                    {report.status}
                  </Badge>
                  <Badge variant="outline">
                    {report.report_type.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="text-sm text-gray-400">
                  {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-white mb-1">Report Details</h4>
                  <p className="text-gray-300">{report.reason}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Reporter ID:</span>
                    <p className="text-white font-mono">{report.reporter_id.slice(0, 8)}...</p>
                  </div>
                  {report.reported_user_id && (
                    <div>
                      <span className="text-gray-400">Reported User:</span>
                      <p className="text-white font-mono">{report.reported_user_id.slice(0, 8)}...</p>
                    </div>
                  )}
                  {report.reported_post_id && (
                    <div>
                      <span className="text-gray-400">Reported Post:</span>
                      <p className="text-white font-mono">{report.reported_post_id.slice(0, 8)}...</p>
                    </div>
                  )}
                  {report.reported_comment_id && (
                    <div>
                      <span className="text-gray-400">Reported Comment:</span>
                      <p className="text-white font-mono">{report.reported_comment_id.slice(0, 8)}...</p>
                    </div>
                  )}
                </div>

                {report.admin_notes && (
                  <div>
                    <h4 className="font-medium text-white mb-1">Admin Notes</h4>
                    <p className="text-gray-300 bg-gray-800 p-2 rounded">{report.admin_notes}</p>
                  </div>
                )}

                {selectedReport === report.id ? (
                  <div className="space-y-3 border-t pt-4">
                    <div>
                      <label className="text-sm font-medium text-white mb-2 block">
                        Update Status
                      </label>
                      <Select value={newStatus} onValueChange={setNewStatus}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select new status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="reviewed">Reviewed</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="dismissed">Dismissed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-white mb-2 block">
                        Admin Notes
                      </label>
                      <Textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Add notes about your decision..."
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleUpdateReport(report.id)}
                        disabled={!newStatus}
                        size="sm"
                      >
                        Update Report
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedReport(null);
                          setAdminNotes('');
                          setNewStatus('');
                        }}
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setSelectedReport(report.id)}
                    size="sm"
                  >
                    Review Report
                  </Button>
                )}
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

export default AdminReportsTab;
