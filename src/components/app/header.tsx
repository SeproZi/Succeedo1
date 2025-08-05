'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

type HeaderProps = {
  onAddObjective: () => void;
};

const Logo = () => (
    <svg width="32" height="32" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M75,0 C95,0 100,10 100,25 C100,40 85,50 75,50 L25,50 C10,50 0,40 0,25 C0,10 10,0 25,0 L75,0 Z" transform="rotate(20, 50, 50)" fill="#FBBF24" />
        <path d="M25,100 C5,100 0,90 0,75 C0,60 15,50 25,50 L75,50 C90,50 100,60 100,75 C100,90 90,100 75,100 L25,100 Z" transform="rotate(20, 50, 50)" fill="#67E8F9" />
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
