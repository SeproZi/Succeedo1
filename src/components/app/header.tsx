'use client';

import { Button } from '@/components/ui/button';
import { Plus, Zap } from 'lucide-react';

type HeaderProps = {
  onAddObjective: () => void;
};

export function Header({ onAddObjective }: HeaderProps) {
  return (
    <header className="bg-card shadow-sm sticky top-0 z-40 border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-3">
             <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                <Zap className="h-6 w-6" />
             </div>
            <h1 className="text-2xl font-bold font-headline text-primary">
              OKR Vision
            </h1>
          </div>
          <Button onClick={onAddObjective}>
            <Plus className="mr-2 h-4 w-4" />
            Add Objective
          </Button>
        </div>
      </div>
    </header>
  );
}
