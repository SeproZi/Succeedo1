
'use client';
import { useMemo, useCallback } from 'react';
import useOkrStore from '@/hooks/use-okr-store';
import { PillarProgress } from '@/components/app/pillar-progress';
import type { OkrItem, OkrPillar, TimelinePeriod } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

import { useAuth } from '@/components/app/auth-provider';
export default function CompanyOverviewClientPage() {
    const { 
        data: { okrs, departments, teams },
        loading,
        currentYear,
        currentPeriod,
        setYear,
        setPeriod,
        availableYears,
        addYear
    } = useOkrStore();
    const { authorizedUser } = useAuth();
    const { toast } = useToast();
    const pillars: OkrPillar[] = ['People', 'Product', 'Tech'];

    const filteredOkrs = useMemo(() => {
        return okrs.filter(okr => okr.year === currentYear && okr.period === currentPeriod);
    }, [okrs, currentYear, currentPeriod]);

    const calculateProgress = useCallback((okrId: string, allItems: OkrItem[]): number => {
        const children = allItems.filter(okr => okr.parentId === okrId);
        if (children.length === 0) return 0;
        const totalProgress = children.reduce((sum, child) => sum + child.progress, 0);
        return Math.round(totalProgress / children.length);
    }, []);

    const okrsWithCalculatedProgress = useMemo(() => {
        return filteredOkrs.map(okr => {
            if (okr.type === 'objective') {
                return { ...okr, progress: calculateProgress(okr.id, filteredOkrs) };
            }
            return okr;
        });
    }, [filteredOkrs, calculateProgress]);

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
            const departmentTeamIds = teams
                .filter(team => team.departmentId === dept.id)
                .map(team => team.id);

            const departmentOkrs = okrsWithCalculatedProgress.filter(okr =>
                (okr.owner.type === 'department' && okr.owner.id === dept.id) ||
                (okr.owner.type === 'team' && departmentTeamIds.includes(okr.owner.id))
            );

            const objectives = departmentOkrs.filter(okr => okr.type === 'objective');
            if (objectives.length === 0) {
                return { ...dept, progress: 0 };
            }
            
            const totalProgress = objectives.reduce((sum, okr) => sum + okr.progress, 0);
            const overallProgress = Math.round(totalProgress / objectives.length);
            
            return {
                ...dept,
                progress: overallProgress,
            };
        });
    }, [departments, teams, okrsWithCalculatedProgress]);

  const handleAddYear = () => {
    const newYearString = prompt('Enter the year to add:');
    if (newYearString) {
        const newYear = parseInt(newYearString, 10);
        if (!isNaN(newYear) && newYear > 2000) {
            addYear(newYear);
            toast({ title: "Year Added", description: `Year ${newYear} has been added.`});
        } else {
            toast({ title: "Invalid Year", description: "Please enter a valid year.", variant: "destructive"});
        }
    }
  };

  const handleExportData = async () => {
      try {
          if (!authorizedUser) {
              toast({ title: "Export Failed", description: "You must be logged in to export data.", variant: "destructive"});
              return;
          }
          const idToken = await authorizedUser.getIdToken();
          const response = await fetch('/api/export-okrs', { headers: { Authorization: `Bearer ${idToken}` } });
          if (!response.ok) {
              throw new Error('Export failed');
          }
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'okrs.csv';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
      } catch (error) {
          toast({ title: "Export Failed", description: "Could not export data.", variant: "destructive"});
      }
  };

  if (loading) {
    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
             <div className="flex flex-wrap items-center justify-between gap-4">
                <Skeleton className="h-9 w-64" />
                <div className="flex flex-wrap items-center gap-4">
                    <Skeleton className="h-10 w-[120px]" />
                    <Skeleton className="h-10 w-[120px]" />
                </div>
            </div>
            <Skeleton className="h-[120px] w-full" />
            <div className="space-y-6">
                <Skeleton className="h-8 w-56" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Skeleton className="h-[120px] w-full" />
                    <Skeleton className="h-[120px] w-full" />
                </div>
            </div>
        </div>
    )
  }


  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-3xl font-bold font-headline text-primary">Company Overview</h1>
            <Button onClick={handleExportData}>Export Data</Button>
            <div className="flex flex-wrap items-center gap-4">
                <Select value={String(currentYear)} onValueChange={(val) => setYear(Number(val))}>
                    <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                        {availableYears.map(year => (
                            <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                        ))}
                        <Separator className="my-1" />
                        <div className="p-2">
                            <Button variant="outline" size="sm" className="w-full" onClick={handleAddYear}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Year
                            </Button>
                        </div>
                    </SelectContent>
                </Select>
                <Select value={currentPeriod} onValueChange={(val) => setPeriod(val as TimelinePeriod)}>
                    <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Period" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="P1">Period 1</SelectItem>
                        <SelectItem value="P2">Period 2</SelectItem>
                        <SelectItem value="P3">Period 3</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>

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
                                        <p className="text-lg font-bold text-primary">{Math.round(dept.progress)}%</p>
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
