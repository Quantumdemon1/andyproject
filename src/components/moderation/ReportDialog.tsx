
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Flag } from 'lucide-react';
import { createReport } from '@/api/reportsApi';

interface ReportDialogProps {
  targetType: 'user' | 'post' | 'comment';
  targetId: string;
  triggerButton?: React.ReactNode;
}

const ReportDialog: React.FC<ReportDialogProps> = ({ 
  targetType, 
  targetId, 
  triggerButton 
}) => {
  const [open, setOpen] = useState(false);
  const [reportType, setReportType] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const reportTypes = [
    { value: 'spam', label: 'Spam' },
    { value: 'harassment', label: 'Harassment' },
    { value: 'inappropriate_content', label: 'Inappropriate Content' },
    { value: 'copyright', label: 'Copyright Violation' },
    { value: 'fake_account', label: 'Fake Account' },
    { value: 'other', label: 'Other' }
  ];

  const handleSubmit = async () => {
    if (!reportType || !reason.trim()) return;

    setLoading(true);
    
    const reportData: any = {
      report_type: reportType,
      reason: reason.trim()
    };

    // Set the appropriate target field
    if (targetType === 'user') {
      reportData.reported_user_id = targetId;
    } else if (targetType === 'post') {
      reportData.reported_post_id = targetId;
    } else if (targetType === 'comment') {
      reportData.reported_comment_id = targetId;
    }

    const success = await createReport(reportData);
    
    if (success) {
      setOpen(false);
      setReportType('');
      setReason('');
    }
    
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button variant="outline" size="sm">
            <Flag className="h-4 w-4 mr-2" />
            Report
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Report {targetType}</DialogTitle>
          <DialogDescription>
            Help us keep the community safe by reporting inappropriate content or behavior.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Report Type</label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">
              Additional Details
            </label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide more details about why you're reporting this..."
              rows={3}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!reportType || !reason.trim() || loading}
            >
              {loading ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportDialog;
