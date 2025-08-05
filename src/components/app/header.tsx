'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

type HeaderProps = {
  onAddObjective: () => void;
};

const Logo = () => (
    <svg width="32" height="32" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M50,0 C22.3858,0 0,22.3858 0,50 L50,50 L50,0 Z" fill="#FBBF24"/>
      <path d="M100,0 C100,27.6142 77.6142,50 50,50 L50,0 L100,0 Z" fill="#F472B6"/>
      <path d="M0,100 C0,72.3858 22.3858,50 50,50 L50,100 L0,100 Z" fill="#67E8F9"/>
      <path d="M100,100 C100,72.3858 77.6142,50 50,50 L50,100 L100,100 Z" fill="#2DD4BF"/>
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
