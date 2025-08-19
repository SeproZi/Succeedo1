
'use client';

import { create } from 'zustand';
import type { AppData, Department, OkrItem, OkrOwner, OkrPillar, Team, TimelinePeriod } from '@/lib/types';
import {
    addDoc,
    collection,
    doc,
    getDocs,
    query,
    updateDoc,
    where,
    writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getCurrentPeriod, getOwnerKey } from '@/lib/utils';

// Exported for testability
export const getTimelineDefaults = (data: AppData) => {
    const years = new Set<number>();
    data.okrs.forEach(okr => years.add(okr.year));
    const availableYears = Array.from(years).sort((a,b) => b-a); // Sort descending to get latest

    if (availableYears.length > 0) {
        const latestYear = availableYears[0];
        const periodsForYear = data.okrs
            .filter(okr => okr.year === latestYear)
            .map(okr => okr.period)
            .sort((a, b) => b.localeCompare(a)); // P3, P2, P1
        
        const latestPeriod = periodsForYear.length > 0 ? periodsForYear[0] : getCurrentPeriod();
        return { availableYears: availableYears.sort((a,b) => a-b), latestYear, latestPeriod };
    }
    
    // Fallback if no data exists
    const systemYear = new Date().getFullYear();
    return { 
        availableYears: [systemYear], 
        latestYear: systemYear, 
        latestPeriod: getCurrentPeriod() 
    };
}

// Exported for testability
export const calculateProgress = (
    objectiveId: string, 
    allItems: OkrItem[], 
    allStoreOkrs: OkrItem[]
): number => {
    const directKeyResults = allItems.filter(okr => okr.parentId === objectiveId);
    
    const linkedTeamObjectives = allStoreOkrs.filter(okr => okr.linkedDepartmentOkrId === objectiveId);
    
    const allProgressSources = [
        ...directKeyResults,
        ...linkedTeamObjectives
    ];

    if (allProgressSources.length === 0) return 0;
    
    const totalProgress = allProgressSources.reduce((sum, item) => {
        // If it's a linked team objective, we need its calculated progress
        if (item.type === 'objective') {
            const teamKRs = allStoreOkrs.filter(kr => kr.parentId === item.id);
            if (teamKRs.length === 0) return sum;
            return sum + (teamKRs.reduce((s, kr) => s + kr.progress, 0) / teamKRs.length);
        }
        // Otherwise, it's a direct key result
        return sum + item.progress;
    }, 0);

    return Math.round(totalProgress / allProgressSources.length);
};

interface OkrState {
  data: AppData;
  loading: boolean;
  currentYear: number;
  currentPeriod: TimelinePeriod;
  availableYears: number[];
  initData: () => Promise<void>;
  clearData: () => void;
  addYear: (year: number) => void;
  setYear: (year: number) => void;
  setPeriod: (period: TimelinePeriod) => void;
  addDepartment: (title: string) => Promise<string | undefined>;
  updateDepartment: (id: string, title: string) => Promise<void>;
  deleteDepartment: (id: string) => Promise<void>;
  addTeam: (title: string, departmentId: string) => Promise<void>;
  updateTeam: (id: string, title: string) => Promise<void>;
  deleteTeam: (id: string) => Promise<void>;
  addOkr: (okr: Omit<OkrItem, 'id' | 'progress'>) => Promise<void>;
  updateOkr: (id: string, updates: Partial<Omit<OkrItem, 'id'>>) => Promise<void>;
  deleteOkr: (id: string) => Promise<void>;
  updateOkrProgress: (id: string, progress: number) => Promise<void>;
  updateOkrNotes: (id: string, notes: string) => Promise<void>;
  // Selectors
  selectFilteredOkrs: () => OkrItem[];
  selectCompanyOverview: () => { overallProgress: number, departmentProgress: Array<Department & { progress: number }> };
  selectDashboardData: (owner: OkrOwner) => { topLevelOkrs: OkrItem[], overallProgress: number, pillarProgress: Record<OkrPillar, number> };
}

const initialState = {
    data: { departments: [], teams: [], okrs: [] },
    loading: true,
    currentYear: new Date().getFullYear(),
    currentPeriod: getCurrentPeriod(),
    availableYears: [],
};

const useOkrStore = create<OkrState>((set, get) => ({
    ...initialState,
    initData: async () => {
        set({ loading: true });
        try {
            const departmentsSnapshot = await getDocs(query(collection(db, "departments")));
            const departments = departmentsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Department))
                .sort((a,b) => a.title.localeCompare(b.title));

            const teamsSnapshot = await getDocs(query(collection(db, "teams")));
            const teams = teamsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Team))
                .sort((a,b) => a.title.localeCompare(b.title));
            
            const okrsSnapshot = await getDocs(query(collection(db, 'okrs')));
            const okrs = okrsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as OkrItem));

            const newData = { departments, teams, okrs };
            const { availableYears, latestYear, latestPeriod } = getTimelineDefaults(newData);
            
            set({ 
                data: newData, 
                loading: false, 
                availableYears,
                currentYear: latestYear,
                currentPeriod: latestPeriod,
            });
        } catch (error) {
            console.error("Error fetching initial data from Firestore:", error);
            set({ loading: false });
        }
    },
    clearData: () => set({ ...initialState, loading: false }),
    addYear: (year) => set(state => {
        if (state.availableYears.includes(year)) return state;
        const newYears = [...state.availableYears, year].sort((a,b) => a-b);
        return { availableYears: newYears };
    }),
    setYear: (year) => set({ currentYear: year }),
    setPeriod: (period) => set({ currentPeriod: period }),
    addDepartment: async (title) => {
        try {
            const docRef = await addDoc(collection(db, 'departments'), { title });
            const newDepartment: Department = { id: docRef.id, title };
            set(state => ({
                data: { ...state.data, departments: [...state.data.departments, newDepartment].sort((a,b) => a.title.localeCompare(b.title)) }
            }));
            return docRef.id;
        } catch (error) {
            console.error("Error adding department:", error);
            return undefined;
        }
    },
    updateDepartment: async (id, title) => {
        try {
            const deptRef = doc(db, 'departments', id);
            await updateDoc(deptRef, { title });
            set(state => ({
                data: { ...state.data, departments: state.data.departments.map(d => d.id === id ? { ...d, title } : d).sort((a,b) => a.title.localeCompare(b.title)) }
            }));
        } catch (error) {
            console.error("Error updating department:", error);
        }
    },
    deleteDepartment: async (id) => {
        try {
            const batch = writeBatch(db);
            const deptRef = doc(db, 'departments', id);
            batch.delete(deptRef);

            const teamsQuery = query(collection(db, 'teams'), where('departmentId', '==', id));
            const teamsSnapshot = await getDocs(teamsQuery);
            teamsSnapshot.forEach(doc => batch.delete(doc.ref));

            const okrsQuery = query(collection(db, 'okrs'), where('owner.departmentId', '==', id));
            const okrsSnapshot = await getDocs(okrsQuery);
            okrsSnapshot.forEach(doc => batch.delete(doc.ref));

            await batch.commit();

            set(state => ({
                data: {
                    departments: state.data.departments.filter(d => d.id !== id),
                    teams: state.data.teams.filter(t => t.departmentId !== id),
                    okrs: state.data.okrs.filter(o => o.owner.departmentId !== id),
                }
            }));
        } catch (error) {
            console.error("Error deleting department:", error);
        }
    },
    addTeam: async (title, departmentId) => {
        try {
            const docRef = await addDoc(collection(db, 'teams'), { title, departmentId });
            const newTeam: Team = { id: docRef.id, title, departmentId };
            set(state => ({
                data: { ...state.data, teams: [...state.data.teams, newTeam].sort((a,b) => a.title.localeCompare(b.title)) }
            }));
        } catch (error) {
            console.error("Error adding team:", error);
        }
    },
    updateTeam: async (id, title) => {
        try {
            const teamRef = doc(db, 'teams', id);
            await updateDoc(teamRef, { title });
            set(state => ({
                data: { ...state.data, teams: state.data.teams.map(t => t.id === id ? { ...t, title } : t).sort((a,b) => a.title.localeCompare(b.title)) }
            }));
        } catch (error) {
            console.error("Error updating team:", error);
        }
    },
    deleteTeam: async (id) => {
        try {
            const batch = writeBatch(db);
            const teamRef = doc(db, 'teams', id);
            batch.delete(teamRef);
            
            const okrsQuery = query(collection(db, 'okrs'), where('owner.id', '==', id));
            const okrsSnapshot = await getDocs(okrsQuery);
            okrsSnapshot.forEach(doc => batch.delete(doc.ref));

            await batch.commit();

            set(state => ({
                data: {
                    ...state.data,
                    teams: state.data.teams.filter(t => t.id !== id),
                    okrs: state.data.okrs.filter(o => o.owner.id !== id),
                }
            }));
        } catch (error) {
            console.error("Error deleting team:", error);
        }
    },
    addOkr: async (okr) => {
        try {
            const newOkrData = { ...okr, progress: 0 };
            const docRef = await addDoc(collection(db, 'okrs'), newOkrData);
            const finalOkr = { ...newOkrData, id: docRef.id } as OkrItem;

            set(state => ({
                data: { ...state.data, okrs: [...state.data.okrs, finalOkr] }
            }));
        } catch(error) {
            console.error("Error adding OKR: ", error);
        }
    },
    updateOkr: async (id, updates) => {
        try {
            const okrRef = doc(db, 'okrs', id);
            await updateDoc(okrRef, updates);
            set(state => ({
                data: { ...state.data, okrs: state.data.okrs.map(o => o.id === id ? { ...o, ...updates } : o) }
            }));
        } catch(error) {
            console.error("Error updating OKR: ", error);
        }
    },
    deleteOkr: async (id) => {
        try {
            const batch = writeBatch(db);
            const okrRef = doc(db, 'okrs', id);
            batch.delete(okrRef);

            const childrenQuery = query(collection(db, 'okrs'), where('parentId', '==', id));
            const childrenSnapshot = await getDocs(childrenQuery);
            childrenSnapshot.forEach(doc => batch.delete(doc.ref));

            await batch.commit();

            set(state => {
                const childrenIds = state.data.okrs.filter(o => o.parentId === id).map(o => o.id);
                return {
                    data: { ...state.data, okrs: state.data.okrs.filter(o => o.id !== id && !childrenIds.includes(o.id)) }
                }
            });
        } catch (error) {
            console.error("Error deleting OKR: ", error);
        }
    },
    updateOkrProgress: async (id, progress) => {
        try {
            const okrRef = doc(db, 'okrs', id);
            await updateDoc(okrRef, { progress });
            set(state => ({
                data: { ...state.data, okrs: state.data.okrs.map(o => o.id === id ? { ...o, progress } : o) }
            }));
        } catch (error) {
            console.error("Error updating OKR progress: ", error);
        }
    },
    updateOkrNotes: async (id, notes) => {
        try {
            const okrRef = doc(db, 'okrs', id);
            await updateDoc(okrRef, { notes });
            set(state => ({
                data: { ...state.data, okrs: state.data.okrs.map(o => o.id === id ? { ...o, notes } : o) }
            }));
        } catch (error) {
            console.error("Error updating OKR notes: ", error);
        }
    },
    // Selectors
    selectFilteredOkrs: () => {
        const { data, currentYear, currentPeriod } = get();
        return data.okrs.filter(okr => okr.year === currentYear && okr.period === currentPeriod);
    },
    selectCompanyOverview: () => {
        const { data, selectFilteredOkrs } = get();
        const { departments, teams } = data;
        const filteredOkrs = selectFilteredOkrs();

        const okrsWithProgress = filteredOkrs.map(okr => 
            okr.type === 'objective' ? { ...okr, progress: calculateProgress(okr.id, filteredOkrs, get().data.okrs) } : okr
        );

        const departmentProgress = departments.map(dept => {
            const departmentTeamIds = teams.filter(t => t.departmentId === dept.id).map(t => t.id);
            const departmentObjectives = okrsWithProgress.filter(okr => 
                okr.type === 'objective' &&
                ((okr.owner.type === 'department' && okr.owner.id === dept.id) ||
                (okr.owner.type === 'team' && departmentTeamIds.includes(okr.owner.id)))
            );
            if (departmentObjectives.length === 0) return { ...dept, progress: 0 };
            const totalProgress = departmentObjectives.reduce((sum, okr) => sum + okr.progress, 0);
            return { ...dept, progress: Math.round(totalProgress / departmentObjectives.length) };
        });

        const overallProgress = departmentProgress.length > 0
            ? Math.round(departmentProgress.reduce((sum, dept) => sum + dept.progress, 0) / departmentProgress.length)
            : 0;
            
        return { overallProgress, departmentProgress };
    },
    selectDashboardData: (owner: OkrOwner) => {
        const { selectFilteredOkrs, data } = get();
        const okrsForOwner = selectFilteredOkrs().filter(okr => getOwnerKey(okr.owner) === getOwnerKey(owner));
        
        const okrsWithCalculatedProgress = okrsForOwner.map(okr => 
            okr.type === 'objective' ? { ...okr, progress: calculateProgress(okr.id, okrsForOwner, data.okrs) } : okr
        );

        const objectives = okrsWithCalculatedProgress.filter(okr => okr.type === 'objective');
        const overallProgress = objectives.length > 0
          ? Math.round(objectives.reduce((sum, okr) => sum + okr.progress, 0) / objectives.length)
          : 0;
        
        const pillars: OkrPillar[] = ['People', 'Product', 'Tech'];
        const pillarProgress: Record<OkrPillar, number> = { People: 0, Product: 0, Tech: 0 };

        pillars.forEach(pillar => {
          const pillarObjectives = objectives.filter(o => o.pillar === pillar);
          if (pillarObjectives.length > 0) {
            pillarProgress[pillar] = Math.round(pillarObjectives.reduce((sum, okr) => sum + okr.progress, 0) / pillarObjectives.length);
          }
        });

        return {
          topLevelOkrs: okrsWithCalculatedProgress.filter(okr => !okr.parentId),
          overallProgress,
          pillarProgress,
        };
    }
}));

export default useOkrStore;
