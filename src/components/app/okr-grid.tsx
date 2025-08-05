'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { OkrItem, OkrPillar, OkrPriority } from '@/lib/types';
import { Target, KeyRound } from 'lucide-react';
import { cn } from '@/lib/utils';


type OkrGridProps = {
  objectives: OkrItem[];
  onGridItemClick: (id: string) => void;
};

const pillars: OkrPillar[] = ['People', 'Product', 'Tech'];

export function OkrGrid({ objectives, onGridItemClick }: OkrGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
      {pillars.map(pillar => (
        <div key={pillar} className="space-y-4">
          <Card className="bg-primary/10 border-primary/20 border">
            <div className="p-3">
              <h3 className="text-center text-lg font-bold tracking-wider text-primary">
                {pillar}
              </h3>
            </div>
          </Card>
          {objectives
            .filter(obj => obj.pillar === pillar)
            .map(obj => (
              <div key={obj.id}>
                <GridItem item={obj} onClick={onGridItemClick} />
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}

const priorityStyles: Record<OkrPriority, string> = {
    P1: 'border-l-red-500',
    P2: 'border-l-amber-500',
    P3: 'border-l-transparent',
};

function GridItem({ item, onClick }: { item: OkrItem; onClick: (id: string) => void }) {
  const isObjective = item.type === 'objective';
  const Icon = isObjective ? Target : KeyRound;
  
  return (
    <Card
      className={cn(
        "cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4",
        item.priority && priorityStyles[item.priority]
      )}
      onClick={() => onClick(item.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
            <Icon className={`h-5 w-5 mt-0.5 ${isObjective ? 'text-primary' : 'text-amber-500'}`} />
            <div className="flex-1">
                <p className="font-semibold text-card-foreground leading-tight">{item.title}</p>
                <div className="flex items-center gap-2 mt-2">
                    <Progress value={item.progress} className="h-1.5" />
                    <span className="text-xs font-mono text-muted-foreground">{item.progress}%</span>
                </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
