'use client';

import { useState, useMemo, useCallback } from 'react';
import { Header } from '@/components/app/header';
import { DashboardSummary } from '@/components/app/dashboard-summary';
import { OkrCard } from '@/components/app/okr-card';
import { AddOkrDialog } from '@/components/app/add-okr-dialog';
import { AiSuggestionsDialog } from '@/components/app/ai-suggestions-dialog';
import type { OkrItem } from '@/lib/types';

const initialData: OkrItem[] = [
  { id: '1', title: 'Launch New Product Line', type: 'objective', progress: 0, parentId: null },
  { id: '2', title: 'Achieve $1M in revenue', type: 'keyResult', progress: 75, parentId: '1', notes: 'Initial revenue target is for Q3.' },
  { id: '3', title: 'Secure 10 enterprise clients', type: 'keyResult', progress: 50, parentId: '1', notes: '' },
  { id: '4', title: 'Increase Website Traffic by 50%', type: 'objective', progress: 0, parentId: null },
  { id: '5', title: 'Publish 20 blog posts', type: 'keyResult', progress: 80, parentId: '4', notes: 'Focus on SEO keywords related to our new product line.' },
  { id: '6', title: 'Improve SEO ranking to top 5 for target keywords', type: 'keyResult', progress: 40, parentId: '4', notes: '' },
  { id: '7', title: 'Run a successful social media campaign', type: 'objective', progress: 0, parentId: '4' },
  { id: '8', title: 'Reach 100k followers on Twitter', type: 'keyResult', progress: 60, parentId: '7', notes: '' },
];

export default function OkrDashboardPage() {
  const [okrs, setOkrs] = useState<OkrItem[]>(initialData);
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [isAiDialogOpen, setAiDialogOpen] = useState(false);
  const [editingOkr, setEditingOkr] = useState<OkrItem | { parentId: string | null } | null>(null);
  const [aiSuggestionObjective, setAiSuggestionObjective] = useState<OkrItem | null>(null);

  const calculateProgress = useCallback((okrId: string, allOkrs: OkrItem[]): number => {
    const children = allOkrs.filter(okr => okr.parentId === okrId);
    if (children.length === 0) return 0;

    const totalProgress = children.reduce((sum, child) => {
      if (child.type === 'keyResult') {
        return sum + child.progress;
      }
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

  const { topLevelOkrs, overallProgress, allObjectives } = useMemo(() => {
    const topLevel = okrsWithCalculatedProgress.filter(okr => okr.parentId === null);
    const objectives = okrsWithCalculatedProgress.filter(okr => okr.type === 'objective');
    const overall = topLevel.length > 0
      ? Math.round(topLevel.reduce((sum, okr) => sum + okr.progress, 0) / topLevel.length)
      : 0;

    return {
      topLevelOkrs: topLevel,
      overallProgress: overall,
      allObjectives: objectives,
    };
  }, [okrsWithCalculatedProgress]);

  const handleOpenAddDialog = (data: OkrItem | { parentId: string | null } | null) => {
    setEditingOkr(data);
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

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header onAddObjective={() => handleOpenAddDialog({ parentId: null })} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <DashboardSummary progress={overallProgress} />

        <div className="mt-8">
          <h2 className="text-3xl font-bold font-headline text-primary mb-6">
            Company Objectives
          </h2>
          <div className="space-y-6">
            {topLevelOkrs.length > 0 ? (
              topLevelOkrs.map(okr => (
                <OkrCard
                  key={okr.id}
                  okr={okr}
                  allOkrs={okrsWithCalculatedProgress}
                  level={0}
                  onUpdateProgress={handleUpdateProgress}
                  onAddOrUpdate={handleOpenAddDialog}
                  onDelete={handleDeleteOkr}
                  onSuggestKRs={handleOpenAiDialog}
                  onUpdateNotes={handleUpdateNotes}
                />
              ))
            ) : (
              <div className="text-center py-12 px-6 bg-card rounded-xl">
                  <h3 className="text-xl font-medium text-card-foreground">No Objectives Yet</h3>
                  <p className="text-muted-foreground mt-2 mb-4">Get started by adding your first company objective.</p>
                  <button onClick={() => handleOpenAddDialog({ parentId: null })} className="bg-accent text-accent-foreground px-4 py-2 rounded-md font-semibold">Add Objective</button>
              </div>
            )}
          </div>
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
