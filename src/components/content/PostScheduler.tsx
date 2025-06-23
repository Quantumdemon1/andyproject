
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Calendar, Clock, Send } from 'lucide-react';
import { format, addMinutes } from 'date-fns';

interface PostSchedulerProps {
  onScheduleChange: (scheduledFor: Date | null) => void;
  className?: string;
}

const PostScheduler: React.FC<PostSchedulerProps> = ({
  onScheduleChange,
  className = ''
}) => {
  const [isScheduled, setIsScheduled] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  // Set default to 15 minutes from now
  React.useEffect(() => {
    const now = new Date();
    const defaultTime = addMinutes(now, 15);
    setSelectedDate(format(defaultTime, 'yyyy-MM-dd'));
    setSelectedTime(format(defaultTime, 'HH:mm'));
  }, []);

  const handleScheduleToggle = (enabled: boolean) => {
    setIsScheduled(enabled);
    if (!enabled) {
      onScheduleChange(null);
    } else {
      updateScheduledTime();
    }
  };

  const updateScheduledTime = () => {
    if (selectedDate && selectedTime) {
      const scheduledDateTime = new Date(`${selectedDate}T${selectedTime}`);
      onScheduleChange(scheduledDateTime);
    }
  };

  React.useEffect(() => {
    if (isScheduled) {
      updateScheduledTime();
    }
  }, [selectedDate, selectedTime, isScheduled]);

  const getScheduledTimeText = () => {
    if (!isScheduled || !selectedDate || !selectedTime) return '';
    const scheduledDateTime = new Date(`${selectedDate}T${selectedTime}`);
    return format(scheduledDateTime, 'PPP p');
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Schedule Post
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="schedule-toggle" className="text-sm">
            Schedule for later
          </Label>
          <Switch
            id="schedule-toggle"
            checked={isScheduled}
            onCheckedChange={handleScheduleToggle}
          />
        </div>

        {isScheduled && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="schedule-date" className="text-xs text-gray-400">
                  Date
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="schedule-date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="schedule-time" className="text-xs text-gray-400">
                  Time
                </Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="schedule-time"
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {getScheduledTimeText() && (
              <div className="bg-aura-blue/10 border border-aura-blue/20 rounded-lg p-3">
                <p className="text-sm text-aura-blue">
                  <Send className="inline h-4 w-4 mr-1" />
                  Will be published on {getScheduledTimeText()}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PostScheduler;
