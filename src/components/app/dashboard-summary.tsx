'use client';

import { TrendingUp } from 'lucide-react';
import { PolarGrid, PolarAngleAxis, RadialBar, RadialBarChart } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
} from '@/components/ui/chart';

type DashboardSummaryProps = {
  progress: number;
};

export function DashboardSummary({ progress }: DashboardSummaryProps) {
  const chartData = [{ name: 'Progress', value: progress, fill: 'var(--color-main)' }];

  return (
    <Card className="shadow-lg">
      <CardHeader className="items-center pb-0">
        <CardTitle className="font-headline text-2xl">Overall Progress</CardTitle>
        <CardDescription>An overview of all company objectives</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={{
            main: {
              label: 'Progress',
              color: 'hsl(var(--chart-1))',
            },
          }}
          className="mx-auto aspect-square h-[250px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={90}
            endAngle={-270}
            innerRadius="70%"
            outerRadius="100%"
            barSize={20}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted last:fill-background"
              polarRadius={[86, 74]}
            />
            <RadialBar dataKey="value" background cornerRadius={10} />
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              dataKey="value"
              tick={false}
            />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          <TrendingUp className="h-4 w-4 text-accent" /> Tracking progress towards goals
        </div>
        <div className="leading-none text-muted-foreground">
          {progress}% of all objectives completed
        </div>
      </CardFooter>
    </Card>
  );
}
