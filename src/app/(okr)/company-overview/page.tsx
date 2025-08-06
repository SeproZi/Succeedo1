'use client';
import { useMemo, useCallback } from 'react';
import { useOkrStore } from '@/hooks/use-okr-store';
import { PillarProgress } from '@/components/app/pillar-progress';
import type { OkrItem, OkrPillar } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';

export default function CompanyOverviewPage() {
    const { data: { okrs, departments } } = useOkrStore();
    const pillars: OkrPillar[] = ['People', 'Product', 'Tech'];

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

    const companyPillarProgress = useMemo(() => {
        const objectives = okrsWithCalculatedProgress.filter(okr => okr.type === 'objective');
        const pillarProg: Record<OkrPillar, number> = { People: 0, Product: 0, Tech: 0 };

        pillars.forEach(pillar => {
            const pillarObjectives = objectives.filter(o => o.pillar === pillar);
            if (pillarObjectives.length > 0) {
                pillarProg[pillar] = Math.round(pillarObjectives.reduce((sum, okr) => sum + okr.progress, 0) / pillarObjectives.length);
            }
        });
        return pillarProg;
    }, [okrsWithCalculatedProgress, pillars]);
    
    const companyProgress = useMemo(() => {
        const progressValues = Object.values(companyPillarProgress);
        const validPillars = progressValues.filter(p => p > 0).length;
        if (validPillars === 0) return 0;
        return Math.round(progressValues.reduce((sum, p) => sum + p, 0) / validPillars);
    }, [companyPillarProgress]);


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
            
            const pillarProg: Record<OkrPillar, number> = { People: 0, Product: 0, Tech: 0 };
             pillars.forEach(pillar => {
                const pillarObjectives = objectives.filter(o => o.pillar === pillar);
                if (pillarObjectives.length > 0) {
                    pillarProg[pillar] = Math.round(pillarObjectives.reduce((sum, okr) => sum + okr.progress, 0) / pillarObjectives.length);
                }
            });

            const progressValues = Object.values(pillarProg);
            const validPillars = progressValues.filter(p => p > 0).length;
            const overallProgress = validPillars > 0 ? Math.round(progressValues.reduce((sum, p) => sum + p, 0) / validPillars) : 0;
            
            return {
                ...dept,
                progress: overallProgress,
                pillarProgress: pillarProg,
            };
        });
    }, [departments, okrsWithCalculatedProgress, pillars]);


  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        <h1 className="text-3xl font-bold font-headline text-primary">Company Overview</h1>

        <Card className="shadow-md">
            <CardHeader>
                <CardTitle className="text-2xl font-bold font-headline text-primary">Overall Company Progress</CardTitle>
            </CardHeader>
            <CardContent>
                <PillarProgress overall={companyProgress} pillarProgress={companyPillarProgress} />
            </CardContent>
        </Card>
        
        <div className="space-y-6">
             <h2 className="text-2xl font-bold font-headline text-primary">Department Progress</h2>
             {departments.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {departmentProgress.map(dept => (
                        <Link href={`/department/${dept.id}`} key={dept.id} className="block">
                             <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer h-full">
                                <CardHeader>
                                    <CardTitle className="text-xl font-headline">{dept.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-4">
                                        <p className="text-sm font-medium text-muted-foreground whitespace-nowrap">Overall Progress</p>
                                        <Progress value={dept.progress} className="h-2.5" />
                                        <p className="text-lg font-bold text-primary">{dept.progress}%</p>
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
