'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { OkrPillar } from '@/lib/types';
import { Users, Briefcase, Wrench, Trophy } from 'lucide-react';

type PillarProgressProps = {
  overall: number;
  pillarProgress: Record<OkrPillar, number>;
};

const pillarDetails = {
  People: { icon: Users, color: 'bg-blue-500' },
  Product: { icon: Briefcase, color: 'bg-purple-500' },
  Tech: { icon: Wrench, color: 'bg-green-500' },
};

export function PillarProgress({ overall, pillarProgress }: PillarProgressProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-2 rounded-lg">
            <div className="bg-primary text-primary-foreground p-3 rounded-md">
                <Trophy className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Overall Progress</p>
              <p className="text-2xl font-bold">{overall}%</p>
              <Progress value={overall} className="h-2 mt-1" />
            </div>
          </div>
          {(Object.keys(pillarProgress) as OkrPillar[]).map(pillar => {
            const details = pillarDetails[pillar];
            return (
              <div key={pillar} className="flex items-center gap-3 p-2 rounded-lg">
                <div className={`${details.color} text-white p-3 rounded-md`}>
                    <details.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{pillar}</p>
                  <p className="text-2xl font-bold">{pillarProgress[pillar]}%</p>
                  <Progress value={pillarProgress[pillar]} className="h-2 mt-1" indicatorClassName={details.color}/>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
