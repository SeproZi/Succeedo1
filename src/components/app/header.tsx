'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

type HeaderProps = {
  onAddObjective: () => void;
};

const Logo = () => (
    <svg width="32" height="32" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M95,25 A25,25 0 0,0 70,0 L50,0 A50,50 0 0,1 50,100 L70,100 A25,25 0 0,0 95,75 L95,25 Z" fill="#F472B6"/>
        <path d="M30,0 L50,0 A50,50 0 0,1 50,100 L30,100 A25,25 0 0,1 5,75 L5,25 A25,25 0 0,1 30,0 Z" fill="#2DD4BF"/>
        <path d="M70,0 A25,25 0 0,0 95,25 L95,25 L70,50 A25,25 0 0,1 50,50 L50,50 A50,50 0 0,0 50,0 Z" fill="#FBBF24"/>
        <path d="M5,75 A25,25 0 0,1 30,100 L50,100 A50,50 0 0,0 50,50 L50,50 A25,25 0 0,1 30,50 L5,25 Z" fill="#67E8F9"/>
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
