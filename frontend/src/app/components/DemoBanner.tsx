import React, { useState, useEffect } from 'react';
import { X, Info } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';

export function DemoBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenBanner = localStorage.getItem('agiletrack_demo_banner_seen');
    if (!hasSeenBanner) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('agiletrack_demo_banner_seen', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <Alert className="bg-primary/5 border-primary/10">
      <Info className="h-4 w-4 text-primary" />
      <AlertDescription className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="font-medium text-foreground mb-1">Welcome to AgileTrack Demo!</p>
          <p className="text-sm text-muted-foreground">
            Try different demo accounts to see role-based features:{' '}
            <span className="font-medium text-foreground">Admin</span> (sarah@agiletrack.com),{' '}
            <span className="font-medium text-foreground">Manager</span> (marcus@agiletrack.com), or{' '}
            <span className="font-medium text-foreground">Developer</span> (emily@agiletrack.com)
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="flex-shrink-0 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertDescription>
    </Alert>
  );
}