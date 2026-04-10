import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from './ui/sheet';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';

interface Action {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive';
}

interface DetailsDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: Action[];
}

export function DetailsDrawer({
  isOpen,
  onOpenChange,
  title,
  subtitle,
  children,
  actions,
}: DetailsDrawerProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="p-6 border-b bg-card/50">
          <SheetTitle className="text-xl font-bold tracking-tight">{title}</SheetTitle>
          {subtitle && (
            <SheetDescription className="text-sm font-medium">
              {subtitle}
            </SheetDescription>
          )}
        </SheetHeader>
        
        <ScrollArea className="flex-1">
          <div className="p-6">
            {children}
          </div>
        </ScrollArea>

        {actions && actions.length > 0 && (
          <SheetFooter className="p-6 border-t bg-card/50 flex-row gap-3">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'default'}
                onClick={action.onClick}
                className="flex-1"
              >
                {action.label}
              </Button>
            ))}
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
