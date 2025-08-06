
'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import { PillarProgress } from '@/components/app/pillar-progress';
import { OkrGrid } from '@/components/app/okr-grid';
import { OkrCard } from '@/components/app/okr-card';
import { AddOkrDialog } from '@/components/app/add-okr-dialog';
import type { OkrItem, OkrPillar, OkrOwner, TimelinePeriod } from '@/lib/types';
import useOkrStore from '@/hooks/use-okr-store';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { useToast } from '@/hooks/use-toast';
import { SidebarTrigger } from '../ui/sidebar';

type OkrDashboardProps = {
    owner: OkrOwner;
    title: string;
};

export function OkrDashboard({ owner, title }: OkrDashboardProps) {
  const { 
    data: { okrs: allOkrs }, 
    currentYear, 
    currentPeriod, 
    setYear, 
    setPeriod, 
    availableYears, 
    addYear 
  } = useOkrStore();
  const { toast } = useToast();

  const okrs = useMemo(() => 
    allOkrs.filter(okr => 
        JSON.stringify(okr.owner) === JSON.stringify(owner) &&
        okr.year === currentYear &&
        okr.period === currentPeriod
    ), 
    [allOkrs, owner, currentYear, currentPeriod]
  );

  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [editingOkr, setEditingOkr] = useState<Partial<OkrItem> | { parentId: string | null } | null>(null);

  const okrCardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const calculateProgress = useCallback((okrId: string, allItems: OkrItem[]): number => {
    const children = allItems.filter(okr => okr.parentId === okrId);
    if (children.length === 0) return 0;

    const totalProgress = children.reduce((sum, child) => {
      return sum + child.progress;
    }, 0);

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

  const { topLevelOkrs, overallProgress, pillarProgress } = useMemo(() => {
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
      topLevelOkrs: objectives,
      overallProgress: overall,
      pillarProgress: pillarProg,
    };
  }, [okrsWithCalculatedProgress]);

  const handleOpenAddDialog = (data: Partial<OkrItem> | { parentId: string | null } | null) => {
    setEditingOkr(data);
    setAddDialogOpen(true);
  };
  
  const handleGridItemClick = (id: string) => {
    okrCardRefs.current[id]?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
     okrCardRefs.current[id]?.classList.add('animate-pulse-once');
     setTimeout(() => {
        okrCardRefs.current[id]?.classList.remove('animate-pulse-once');
     }, 1000)
  };

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

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <SidebarTrigger className="md:hidden"/>
                <h1 className="text-3xl font-bold font-headline text-primary">{title}</h1>
            </div>
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
                <Button onClick={() => handleOpenAddDialog({ parentId: null, type: 'objective' })}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Objective
                </Button>
            </div>
        </div>

        <div className="mb-8">
            <PillarProgress overall={overallProgress} pillarProgress={pillarProgress} />
        </div>

        <div className="mb-12">
            <OkrGrid 
                objectives={topLevelOkrs} 
                onGridItemClick={handleGridItemClick}
            />
        </div>

        <div className="space-y-6">
            <h2 className="text-3xl font-bold font-headline text-primary mb-6">
                Objectives Details
            </h2>
            {topLevelOkrs.length > 0 ? (
              topLevelOkrs.map(okr => (
                 <div key={okr.id} ref={el => okrCardRefs.current[okr.id] = el} className="scroll-mt-24">
                    <OkrCard
                      okr={okr}
                      allOkrs={okrsWithCalculatedProgress}
                      level={0}
                      onAddOrUpdate={(data) => handleOpenAddDialog({...data, owner})}
                    />
                 </div>
              ))
            ) : (
              <div className="text-center py-12 px-6 bg-card rounded-xl">
                  <h3 className="text-xl font-medium text-card-foreground">No Objectives Yet</h3>
                  <p className="text-muted-foreground mt-2 mb-4">Get started by adding your first objective for {currentYear} - {currentPeriod}.</p>
                  <Button onClick={() => handleOpenAddDialog({ parentId: null, type: 'objective' })}>Add Objective</Button>
              </div>
            )}
          </div>
      </div>
      {isAddDialogOpen && (
        <AddOkrDialog
          isOpen={isAddDialogOpen}
          setOpen={setAddDialogOpen}
          okrData={{ ...editingOkr, owner }}
          owner={owner}
        />
      )}
    </>
  );
}
