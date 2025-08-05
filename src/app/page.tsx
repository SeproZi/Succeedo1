'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import { Header } from '@/components/app/header';
import { PillarProgress } from '@/components/app/pillar-progress';
import { OkrGrid } from '@/components/app/okr-grid';
import { OkrCard } from '@/components/app/okr-card';
import { AddOkrDialog } from '@/components/app/add-okr-dialog';
import { AiSuggestionsDialog } from '@/components/app/ai-suggestions-dialog';
import type { OkrItem, OkrPillar } from '@/lib/types';
import { suggestKeyResultsAction } from '@/lib/actions';

const initialData: OkrItem[] = [
  { id: '1', title: 'Foster a world-class engineering team', type: 'objective', progress: 0, parentId: null, pillar: 'People', priority: 'P1' },
  { id: '2', title: 'Hire 5 senior engineers', type: 'keyResult', progress: 40, parentId: '1', notes: '2 frontend, 2 backend, 1 SRE' },
  { id: '3', title: 'Implement a new professional development plan', type: 'keyResult', progress: 80, parentId: '1', notes: 'Mentorship program is live.' },
  { id: '10', title: 'Improve team satisfaction by 15%', type: 'keyResult', progress: 30, parentId: '1', notes: '' },
  
  { id: '4', title: 'Launch New Product Line', type: 'objective', progress: 0, parentId: null, pillar: 'Product', priority: 'P2' },
  { id: '5', title: 'Achieve $1M in revenue', type: 'keyResult', progress: 75, parentId: '4', notes: 'Initial revenue target is for Q3.' },
  { id: '6', title: 'Secure 10 enterprise clients', type: 'keyResult', progress: 50, parentId: '4', notes: '' },
  { id: '7', title: 'Increase Website Traffic by 50%', type: 'keyResult', progress: 40, parentId: '4', notes: 'Focus on SEO keywords related to our new product line.' },

  { id: '8', title: 'Modernize Core Platform Technology', type: 'objective', progress: 0, parentId: null, pillar: 'Tech', priority: 'P3' },
  { id: '9', title: 'Migrate to a new cloud provider', type: 'keyResult', progress: 60, parentId: '8', notes: 'AWS migration is 60% complete.' },
  { id: '11', title: 'Reduce API latency by 30%', type: 'keyResult', progress: 90, parentId: '8', notes: '' },
  { id: '12', title: 'Achieve 99.9% uptime', type: 'keyResult', progress: 95, parentId: '8', notes: '' },
];


export default function OkrDashboardPage() {
  const [okrs, setOkrs] = useState<OkrItem[]>(initialData);
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [isAiDialogOpen, setAiDialogOpen] = useState(false);
  const [editingOkr, setEditingOkr] = useState<OkrItem | { parentId: string | null } | null>(null);
  const [aiSuggestionObjective, setAiSuggestionObjective] = useState<OkrItem | null>(null);

  const okrCardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const calculateProgress = useCallback((okrId: string, allOkrs: OkrItem[]): number => {
    const children = allOkrs.filter(okr => okr.parentId === okrId);
    if (children.length === 0) return 0;

    const totalProgress = children.reduce((sum, child) => {
      if (child.type === 'keyResult') {
        return sum + child.progress;
      }
      // Note: This recursive call for sub-objectives is not used in the current flat structure, but good for future-proofing
      return sum + calculateProgress(child.id, allOkrs); 
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

  const { topLevelOkrs, overallProgress, pillarProgress, allObjectives } = useMemo(() => {
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
      allObjectives: objectives,
    };
  }, [okrsWithCalculatedProgress]);

  const handleOpenAddDialog = (data: Partial<OkrItem> | { parentId: string | null } | null) => {
    setEditingOkr(data as OkrItem | { parentId: string | null } | null);
    setAddDialogOpen(true);
  };

  const handleOpenAiDialog = (objective: OkrItem) => {
    setAiSuggestionObjective(objective);
    setAiDialogOpen(true);
  };

  const handleAddOrUpdateOkr = (data: Omit<OkrItem, 'progress' | 'id'> & { id?: string }) => {
    if ('id' in data && data.id) {
      // Update
      setOkrs(prev => prev.map(okr => okr.id === data.id ? { ...okr, ...data } : okr));
    } else {
      // Add
      const newOkr: OkrItem = {
        ...data,
        id: Date.now().toString(),
        progress: 0,
        notes: data.type === 'keyResult' ? '' : undefined,
        priority: data.type === 'objective' ? data.priority : undefined,
      };
      setOkrs(prev => [...prev, newOkr]);
    }
  };

  const handleDeleteOkr = (id: string) => {
    setOkrs(prev => prev.filter(okr => okr.id !== id && okr.parentId !== id));
  };

  const handleUpdateProgress = (id: string, progress: number) => {
    setOkrs(prev => prev.map(okr => okr.id === id ? { ...okr, progress } : okr));
  };
  
  const handleUpdateNotes = (id: string, notes: string) => {
    setOkrs(prev => prev.map(okr => okr.id === id ? { ...okr, notes } : okr));
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

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header onAddObjective={() => handleOpenAddDialog({ parentId: null, type: 'objective' })} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        
        <h2 className="text-3xl font-bold font-headline text-primary mb-2">
            PD 2025 P1
        </h2>

        <div className="mb-8">
            <PillarProgress overall={overallProgress} pillarProgress={pillarProgress} />
        </div>

        <div className="mb-12">
            <OkrGrid 
                objectives={topLevelOkrs} 
                allOkrs={okrsWithCalculatedProgress} 
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
                      onUpdateProgress={handleUpdateProgress}
                      onAddOrUpdate={handleOpenAddDialog}
                      onDelete={handleDeleteOkr}
                      onSuggestKRs={() => handleOpenAiDialog(okr)}
                      onUpdateNotes={handleUpdateNotes}
                    />
                 </div>
              ))
            ) : (
              <div className="text-center py-12 px-6 bg-card rounded-xl">
                  <h3 className="text-xl font-medium text-card-foreground">No Objectives Yet</h3>
                  <p className="text-muted-foreground mt-2 mb-4">Get started by adding your first company objective.</p>
                  <button onClick={() => handleOpenAddDialog({ parentId: null, type: 'objective' })} className="bg-accent text-accent-foreground px-4 py-2 rounded-md font-semibold">Add Objective</button>
              </div>
            )}
          </div>
      </main>

      {isAddDialogOpen && (
        <AddOkrDialog
          isOpen={isAddDialogOpen}
          setOpen={setAddDialogOpen}
          okrData={editingOkr}
          onSave={handleAddOrUpdateOkr}
          objectives={allObjectives}
        />
      )}

      {isAiDialogOpen && aiSuggestionObjective && (
        <AiSuggestionsDialog
          isOpen={isAiDialogOpen}
          setOpen={setAiDialogOpen}
          objective={aiSuggestionObjective}
          onAddKeyResult={(title) => {
            handleAddOrUpdateOkr({
              title,
              type: 'keyResult',
              parentId: aiSuggestionObjective.id,
            });
          }}
        />
      )}
    </div>
  );
}
