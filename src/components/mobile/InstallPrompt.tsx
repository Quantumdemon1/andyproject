
import React from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { usePWA } from '@/hooks/usePWA';

const InstallPrompt: React.FC = () => {
  const { isInstallable, installApp } = usePWA();
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    if (isInstallable) {
      // Show prompt after a short delay
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [isInstallable]);

  if (!isVisible || !isInstallable) return null;

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 p-4 bg-background/95 backdrop-blur-sm border animate-slide-in-bottom">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Download className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Install Aura</h3>
            <p className="text-xs text-muted-foreground">
              Add to home screen for quick access
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            onClick={installApp}
            className="text-xs"
          >
            Install
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsVisible(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default InstallPrompt;
