
'use client';
import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { PillarProgress } from '@/components/app/pillar-progress';
import { OkrGrid } from '@/components/app/okr-grid';
import { OkrCard } from '@/components/app/okr-card';
import { AddOkrDialog } from '@/components/app/add-okr-dialog';
import type { OkrItem, OkrOwner, TimelinePeriod, OkrPillar } from '@/lib/types';
import useOkrStore from '@/hooks/use-okr-store';
import { Button } from '@/components/ui/button';
import { Plus, Sparkles, ChevronDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { useToast } from '@/hooks/use-toast';
import { SidebarTrigger } from '../ui/sidebar';
import { Skeleton } from '../ui/skeleton';
import { ConfirmationDialog } from './confirmation-dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

type OkrDashboardProps = {
    owner: OkrOwner;
    title: string;
};

function PriorityLegend() {
    return (
        <div className="flex justify-start items-center gap-4 text-xs text-muted-foreground">
             <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-purple-700/20 border border-purple-700/30"></span>
                <span>Critical</span>
            </div>
            <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-cyan-500/20 border border-cyan-500/30"></span>
                <span>High</span>
            </div>
            <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-card border border-border"></span>
                <span>Normal</span>
            </div>
        </div>
    )
}

export function OkrDashboard({ owner, title }: OkrDashboardProps) {
  const { 
    loading,
    currentYear, 
    currentPeriod, 
    setYear, 
    setPeriod, 
    availableYears, 
    addYear,
    selectDashboardData,
    deleteOkr,
    addOkr,
    data
  } = useOkrStore();
  
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const { topLevelOkrs, overallProgress, pillarProgress } = selectDashboardData(owner);
  const okrsForOwner = useOkrStore(state => state.selectFilteredOkrs().filter(okr => okr.owner.id === owner.id));
  const allStoreOkrs = useOkrStore(state => state.selectFilteredOkrs());

  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [editingOkr, setEditingOkr] = useState<Partial<OkrItem> | { parentId: string | null } | null>(null);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [okrToDelete, setOkrToDelete] = useState<OkrItem | null>(null);
  const [highlightedOkrId, setHighlightedOkrId] = useState<string | null>(null);


  const okrCardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  
  const handleGridItemClick = (id: string) => {
    const targetElement = okrCardRefs.current[id];
    if (targetElement) {
        targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
        });
        targetElement.classList.add('animate-pulse-once');
        setTimeout(() => {
            targetElement.classList.remove('animate-pulse-once');
        }, 1000);
    }
  };

  const handleCardClick = (id: string) => {
    const targetId = `grid-item-${id}`;
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
        targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
        });
        targetElement.classList.add('animate-pulse-once');
        setTimeout(() => {
            targetElement.classList.remove('animate-pulse-once');
        }, 1000);
    }
  }

  useEffect(() => {
    const highlightId = searchParams.get('highlight');
    setHighlightedOkrId(highlightId);
    if (highlightId) {
        const timer = setTimeout(() => {
            const targetElement = okrCardRefs.current[highlightId];
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });
            }
        }, 100); // Small delay to allow refs to be set
        return () => clearTimeout(timer);
    }
  }, [searchParams]);

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
  
  const handleDeleteClick = (okr: OkrItem) => {
    setOkrToDelete(okr);
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    if (okrToDelete) {
        deleteOkr(okrToDelete.id);
        toast({ title: "OKR Deleted", description: `"${okrToDelete.title}" has been deleted.` });
        setOkrToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  // Open the dialog when editingOkr is set
  useEffect(() => {
    if (editingOkr !== null) {
      setAddDialogOpen(true);
    }
  }, [editingOkr]);

  const pillars: OkrPillar[] = ['People', 'Product', 'Tech'];

  if (loading) {
    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <SidebarTrigger className="md:hidden"/>
                    <Skeleton className="h-9 w-48" />
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    <Skeleton className="h-10 w-[120px]" />
                    <Skeleton className="h-10 w-[120px]" />
                    <Skeleton className="h-10 w-36" />
                </div>
            </div>
             <Skeleton className="h-[96px] w-full" />
             <Skeleton className="h-[200px] w-full" />
             <div className="space-y-6">
                <Skeleton className="h-9 w-64" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
             </div>
        </div>
    )
  }

  const ownerEntity = owner.type === 'department'
    ? data.departments.find(d => d.id === owner.id)
    : data.teams.find(t => t.id === owner.id);


  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8">
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
                <Button onClick={() => setEditingOkr({ parentId: null, type: 'objective'})}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Objective
                </Button>
            </div>
        </div>

        <div className="mt-6">
            <PillarProgress overall={overallProgress} pillarProgress={pillarProgress} />
        </div>
        
        <div className="mt-2 mb-4">
            <PriorityLegend />
        </div>

        <div id="okr-grid-container">
            <OkrGrid 
                objectives={topLevelOkrs.filter(okr => okr.type === 'objective')}
                allOkrs={allStoreOkrs}
                onGridItemClick={handleGridItemClick}
                onEdit={(okr) => setEditingOkr({ ...okr, owner })}
                onDelete={(id) => handleDeleteClick(topLevelOkrs.find(o => o.id === id)!)}
                owner={owner}
                pillarDescriptions={ownerEntity?.pillarDescriptions}
            />
        </div>

        <div className="space-y-4 mt-6">
            <h2 className="text-3xl font-bold font-headline text-primary mb-4">
                Objectives Details
            </h2>
            {topLevelOkrs.length > 0 ? (
                pillars.map(pillar => {
                    const pillarOkrs = topLevelOkrs.filter(okr => okr.pillar === pillar);
                    if (pillarOkrs.length === 0) return null;
                    
                    return (
                        <Collapsible key={pillar} defaultOpen={true} className="space-y-4">
                            <div className="border-b-2 border-primary/10 pb-2">
                                <CollapsibleTrigger className="flex w-full items-center justify-between group">
                                    <h3 className="text-lg font-semibold font-headline text-primary/80">{pillar}</h3>
                                    <ChevronDown className="h-5 w-5 text-primary/80 transition-transform group-data-[state=closed]:-rotate-90" />
                                </CollapsibleTrigger>
                            </div>
                            <CollapsibleContent className="space-y-4 data-[state=closed]:animate-none data-[state=open]:animate-none">
                                {pillarOkrs.map(okr => (
                                    <div 
                                        key={okr.id} 
                                        ref={el => okrCardRefs.current[okr.id] = el} 
                                        className={cn(
                                            "scroll-mt-24",
                                            highlightedOkrId === okr.id && 'animate-pulse-once'
                                        )}
                                    >
                                        <OkrCard
                                            okr={okr}
                                            allOkrs={okrsForOwner}
                                            allStoreOkrs={allStoreOkrs}
                                            level={0}
                                            onAddOrUpdate={(data) => setEditingOkr({ ...data, owner })}
                                            onCardClick={handleCardClick}
                                        />
                                    </div>
                                ))}
                            </CollapsibleContent>
                        </Collapsible>
                    );
                })
            ) : (
              <div className="text-center py-12 px-6 bg-card rounded-xl">
                  <h3 className="text-xl font-medium text-card-foreground">No Objectives Yet</h3>
                  <p className="text-muted-foreground mt-2 mb-4">Get started by adding your first objective for {currentYear} - {currentPeriod}.</p>
                   <Button onClick={() => setEditingOkr({ parentId: null, type: 'objective' })}>Add Objective</Button>
              </div>
            )}
          </div>
      </div>
      <AddOkrDialog
        isOpen={isAddDialogOpen}
        setOpen={(open) => { setAddDialogOpen(open); if (!open) setEditingOkr(null); }}
        okrData={{ ...editingOkr, owner }}
        owner={owner}
      />
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        setOpen={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete OKR?"
    description={`Are you sure you want to delete "${okrToDelete?.title}"? This action cannot be undone.`}/>
    </>
  );
}
