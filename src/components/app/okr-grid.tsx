'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { OkrItem, OkrPillar } from '@/lib/types';
import { Target, KeyRound } from 'lucide-react';

type OkrGridProps = {
  objectives: OkrItem[];
  allOkrs: OkrItem[];
  onGridItemClick: (id: string) => void;
};

const pillars: OkrPillar[] = ['People', 'Product', 'Tech'];

export function OkrGrid({ objectives, allOkrs, onGridItemClick }: OkrGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {pillars.map(pillar => (
        <div key={pillar} className="space-y-4">
          <Card className="bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="text-center text-lg font-bold tracking-wider">
                {pillar}
              </CardTitle>
            </CardHeader>
          </Card>
          {objectives
            .filter(obj => obj.pillar === pillar)
            .map(obj => (
              <div key={obj.id}>
                <GridItem item={obj} onClick={onGridItemClick} />
                <div className="space-y-2 mt-2 pl-4 border-l-2 border-border ml-2">
                  {allOkrs
                    .filter(kr => kr.parentId === obj.id)
                    .map(kr => (
                      <GridItem key={kr.id} item={kr} onClick={onGridItemClick} />
                    ))}
                </div>
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}

function GridItem({ item, onClick }: { item: OkrItem; onClick: (id: string) => void }) {
  const isObjective = item.type === 'objective';
  const Icon = isObjective ? Target : KeyRound;
  
  return (
    <Card
      className="cursor-pointer hover:shadow-lg hover:border-accent transition-all duration-200"
      onClick={() => onClick(item.id)}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
            <Icon className={`h-5 w-5 mt-0.5 ${isObjective ? 'text-primary' : 'text-yellow-500'}`} />
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
