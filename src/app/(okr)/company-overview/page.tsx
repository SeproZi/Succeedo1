'use client';
import { useMemo, useCallback } from 'react';
import { useOkrStore } from '@/hooks/use-okr-store';
import { PillarProgress } from '@/components/app/pillar-progress';
import type { OkrItem, OkrPillar } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Building } from 'lucide-react';
import Link from 'next/link';

export default function CompanyOverviewPage() {
    const { data: { okrs, departments } } = useOkrStore();

    const calculateProgress = useCallback((okrId: string, allItems: OkrItem[]): number => {
        const children = allItems.filter(okr => okr.parentId === okrId);
        if (children.length === 0) return 0;
        const totalProgress = children.reduce((sum, child) => sum + child.progress, 0);
        return Math.round(totalProgress / children.length);
    }, []);

    const okrsWithCalculatedProgress = useMemo(() => {
        return okrs.map(okr => {
            if (okr.type === 'objective') {
                return { ...okr, progress: calculateProgress(okr.id, okrs) };
            }
            return okr;
        });
    }, [okrs, calculateProgress]);

    const { companyProgress, companyPillarProgress } = useMemo(() => {
        const objectives = okrsWithCalculatedProgress.filter(okr => okr.type === 'objective');
        const overall = objectives.length > 0
            ? Math.round(objectives.reduce((sum, okr) => sum + okr.progress, 0) / objectives.length)
            : 0;
        
        const pillars: OkrPillar[] = ['People', 'Product', 'Tech'];
        const pillarProg: Record<OkrPillar, number> = { People: 0, Product: 0, Tech: 0 };

        pillars.forEach(pillar => {
            const pillarObjectives = objectives.filter(o => o.pillar === pillar);
            if (pillarObjectives.length > 0) {
                pillarProg[pillar] = Math.round(pillarObjectives.reduce((sum, okr) => sum + okr.progress, 0) / pillarObjectives.length);
            }
        });

        return {
            companyProgress: overall,
            companyPillarProgress: pillarProg,
        };
    }, [okrsWithCalculatedProgress]);

    const departmentProgress = useMemo(() => {
        return departments.map(dept => {
            const departmentTeamIds = okrsWithCalculatedProgress
                .filter(okr => okr.owner.type === 'team' && okr.owner.departmentId === dept.id)
                .map(okr => okr.owner.id);

            const departmentOkrs = okrsWithCalculatedProgress.filter(okr =>
                (okr.owner.type === 'department' && okr.owner.id === dept.id) ||
                (okr.owner.type === 'team' && departmentTeamIds.includes(okr.owner.id))
            );

            const objectives = departmentOkrs.filter(okr => okr.type === 'objective');
            const progress = objectives.length > 0
                ? Math.round(objectives.reduce((sum, okr) => sum + okr.progress, 0) / objectives.length)
                : 0;

            return {
                ...dept,
                progress,
                objectiveCount: objectives.length,
            };
        });
    }, [departments, okrsWithCalculatedProgress]);


  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        <h1 className="text-3xl font-bold font-headline text-primary">Company Overview</h1>

        <div className="mb-8">
            <h2 className="text-2xl font-bold font-headline text-primary mb-4">Overall Company Progress</h2>
            <PillarProgress overall={companyProgress} pillarProgress={companyPillarProgress} />
        </div>

        <div>
             <h2 className="text-2xl font-bold font-headline text-primary mb-4">Department Progress</h2>
             {departments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {departmentProgress.map(dept => (
                        <Link href={`/department/${dept.id}`} key={dept.id}>
                            <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer h-full">
                                <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                                     <div className="bg-primary/10 text-primary p-3 rounded-lg">
                                        <Building className="h-6 w-6" />
                                     </div>
                                     <CardTitle className="text-xl font-headline">{dept.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground mb-2">{dept.objectiveCount} Objectives</p>
                                    <div className="flex items-center gap-3">
                                        <Progress value={dept.progress} className="h-2.5" />
                                        <span className="font-bold text-lg text-primary">{dept.progress}%</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
             ) : (
                <div className="text-center py-12 px-6 bg-card rounded-xl">
                    <h3 className="text-xl font-medium text-card-foreground">No Departments Found</h3>
                    <p className="text-muted-foreground mt-2">Create your first department to see an overview here.</p>
                </div>
             )}
        </div>
    </div>
  );
}
