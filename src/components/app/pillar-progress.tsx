'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { OkrPillar } from '@/lib/types';
import { Users, Briefcase, Wrench, Trophy } from 'lucide-react';

type PillarProgressProps = {
  overall: number;
  pillarProgress: Record<OkrPillar, number>;
};

const pillarDetails = {
  People: { icon: Users, color: 'bg-sky-500', indicator: 'bg-sky-500' },
  Product: { icon: Briefcase, color: 'bg-violet-500', indicator: 'bg-violet-500' },
  Tech: { icon: Wrench, color: 'bg-emerald-500', indicator: 'bg-emerald-500' },
};

export function PillarProgress({ overall, pillarProgress }: PillarProgressProps) {
  return (
    <Card className="shadow-sm bg-card/80 backdrop-blur-sm">
      <CardContent className="p-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          
          {/* Overall Progress */}
          <div className="flex items-center gap-3 p-2 rounded-lg">
            <div className="bg-primary/10 text-primary p-2 rounded-lg">
                <Trophy className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-baseline">
                <p className="text-sm font-medium text-muted-foreground">Overall</p>
                <p className="text-lg font-bold">{overall}%</p>
              </div>
              <Progress value={overall} className="h-1.5 mt-1" />
            </div>
          </div>

          {/* Pillar Progress */}
          {(Object.keys(pillarProgress) as OkrPillar[]).map(pillar => {
            const details = pillarDetails[pillar];
            return (
              <div key={pillar} className="flex items-center gap-3 p-2 rounded-lg">
                <div className={`p-2 rounded-lg ${details.color} bg-opacity-10`}>
                    <details.icon className="h-5 w-5 text-white" />
                </div>
                 <div className="flex-1">
                    <div className="flex justify-between items-baseline">
                        <p className="text-sm font-medium text-muted-foreground">{pillar}</p>
                        <p className="text-lg font-bold">{pillarProgress[pillar]}%</p>
                    </div>
                    <Progress value={pillarProgress[pillar]} className="h-1.5 mt-1" indicatorClassName={details.indicator}/>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
