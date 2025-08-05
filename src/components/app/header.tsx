'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

type HeaderProps = {
  onAddObjective: () => void;
};

const Logo = () => (
    <svg width="32" height="32" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor: 'rgba(251, 191, 38, 0.2)', stopOpacity: 1}} />
            <stop offset="100%" style={{stopColor: 'rgba(251, 191, 38, 0)', stopOpacity: 1}} />
            </linearGradient>
            <filter id="blur1">
                <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
            </filter>
        </defs>
        <path d="M 0,50 A 50,50 0 0,1 50,0 H 0 Z" fill="#FBBF24" filter="url(#blur1)"/>
        <path d="M 50,0 A 50,50 0 0,1 100,50 V 0 Z" fill="#F472B6" filter="url(#blur1)"/>
        <path d="M 0,50 H 50 A 50,50 0 0,1 0,100 Z" fill="#67E8F9" filter="url(#blur1)"/>
        <path d="M 50,50 H 100 V 100 A 50,50 0 0,1 50,50 Z" fill="#2DD4BF" filter="url(#blur1)" />

        <path d="M 0,50 A 50,50 0 0,1 50,0" fill="none" />
        <path d="M 50,0 A 50,50 0 0,1 100,50" fill="none" />
        <path d="M 0,50 A 50,50 0 0,1 50,100" fill="none" />
        <path d="M 50,100 A 50,50 0 0,1 100,50" fill="none" />

        <path d="M 0 50 Q 25 25, 50 0" fill="#FBBF24" />
        <path d="M 50 0 Q 75 25, 100 50" fill="#F472B6" />
        <path d="M 0 50 H 50 A 50 50 0 0 1 0 100Z" fill="#67E8F9" />
        <path d="M 50 50 H 100 V 100 A 50 50 0 0 1 50 50Z" fill="#2DD4BF" />
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
