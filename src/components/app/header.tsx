'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

type HeaderProps = {
  onAddObjective: () => void;
};

const Logo = () => (
    <svg width="32" height="32" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 50C0 22.3858 22.3858 0 50 0V50H0Z" fill="#FBBF24"/>
      <path d="M50 0C77.6142 0 100 22.3858 100 50H50V0Z" fill="#F472B6"/>
      <path d="M0 50V100C27.6142 100 50 77.6142 50 50H0Z" fill="#67E8F9"/>
      <path d="M50 50C50 77.6142 72.3858 100 100 100V50H50Z" fill="#2DD4BF"/>
    </svg>
  );

export function Header({ onAddObjective }: HeaderProps) {
  return (
    <header className="bg-card shadow-sm sticky top-0 z-40 border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-3">
             <div className="p-1">
                <Logo />
             </div>
             <div>
                <h1 className="text-2xl font-bold font-headline text-primary">
                Succeedo
                </h1>
                <p className="text-xs text-muted-foreground -mt-1">powered by Proceedo</p>
            </div>
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
