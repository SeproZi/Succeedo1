
'use client';

import { create } from 'zustand';
import type { AppData, Department, OkrItem, Team, TimelinePeriod } from '@/lib/types';
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    query,
    updateDoc,
    where,
    writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface OkrState {
  data: AppData;
  loading: boolean;
  currentYear: number;
  currentPeriod: TimelinePeriod;
  availableYears: number[];
  initData: () => Promise<void>;
  addYear: (year: number) => void;
  setYear: (year: number) => void;
  setPeriod: (period: TimelinePeriod) => void;
  addDepartment: (title: string) => Promise<string | undefined>;
  updateDepartment: (id: string, title: string) => Promise<void>;
  deleteDepartment: (id: string) => Promise<void>;
  addTeam: (title: string, departmentId: string) => Promise<void>;
  updateTeam: (id: string, title: string) => Promise<void>;
  deleteTeam: (id: string) => Promise<void>;
  addOkr: (okr: Omit<OkrItem, 'id' | 'progress'>) => void;
  updateOkr: (id: string, updates: Partial<Omit<OkrItem, 'id'>>) => void;
  deleteOkr: (id: string) => void;
  updateOkrProgress: (id: string, progress: number) => void;
  updateOkrNotes: (id: string, notes: string) => void;
}

const getInitialYears = (data: AppData) => {
    const year = new Date().getFullYear();
    const years = new Set<number>();
    years.add(year - 1);
    years.add(year);
    years.add(year + 1);
    data.okrs.forEach(okr => years.add(okr.year));
    return Array.from(years).sort();
}

export const useOkrStore = create<OkrState>((set, get) => ({
    data: { departments: [], teams: [], okrs: [] },
    loading: true,
    currentYear: new Date().getFullYear(),
    currentPeriod: 'P1',
    availableYears: [],
    initData: async () => {
        try {
            const departmentsSnapshot = await getDocs(collection(db, "departments"));
            const departments = departmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Department));

            const teamsSnapshot = await getDocs(collection(db, "teams"));
            const teams = teamsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team));
            
            // TODO: Fetch OKRs later
            const okrs: OkrItem[] = [];

            const newData = { departments, teams, okrs };
            
            set({ data: newData, loading: false, availableYears: getInitialYears(newData) });
        } catch (error) {
            console.error("Error fetching initial data from Firestore:", error);
            set({ loading: false });
        }
    },
    addYear: (year) => set(state => {
        if (state.availableYears.includes(year)) return state;
        const newYears = [...state.availableYears, year].sort();
        return { availableYears: newYears };
    }),
    setYear: (year) => set({ currentYear: year }),
    setPeriod: (period) => set({ currentPeriod: period }),
    addDepartment: async (title) => {
        try {
            const docRef = await addDoc(collection(db, 'departments'), { title });
            const newDepartment = { id: docRef.id, title };
            set(state => ({
                data: { ...state.data, departments: [...state.data.departments, newDepartment] }
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
                data: { ...state.data, departments: state.data.departments.map(d => d.id === id ? { ...d, title } : d) }
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
            teamsSnapshot.forEach(doc => {
                batch.delete(doc.ref);
                // TODO: Delete associated OKRs
            });
            
            await batch.commit();

            set(state => {
                const teamsToDelete = state.data.teams.filter(t => t.departmentId === id).map(t => t.id);
                return {
                    data: {
                        ...state.data,
                        departments: state.data.departments.filter(d => d.id !== id),
                        teams: state.data.teams.filter(t => t.departmentId !== id),
                        // okrs: state.data.okrs.filter(o => !okrsToDelete.includes(o.id)), // Add back when OKRs are managed
                    }
                };
            });
        } catch (error) {
            console.error("Error deleting department:", error);
        }
    },
    addTeam: async (title, departmentId) => {
        try {
            const docRef = await addDoc(collection(db, 'teams'), { title, departmentId });
            const newTeam = { id: docRef.id, title, departmentId };
            set(state => ({
                data: { ...state.data, teams: [...state.data.teams, newTeam] }
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
                data: { ...state.data, teams: state.data.teams.map(t => t.id === id ? { ...t, title } : t) }
            }));
        } catch (error) {
            console.error("Error updating team:", error);
        }
    },
    deleteTeam: async (id) => {
        try {
            const teamRef = doc(db, 'teams', id);
            await deleteDoc(teamRef);
            // TODO: Delete associated OKRs
            set(state => ({
                data: {
                    ...state.data,
                    teams: state.data.teams.filter(t => t.id !== id),
                    // okrs: state.data.okrs.filter(o => o.owner.type === 'team' && o.owner.id !== id),
                }
            }));
        } catch (error) {
            console.error("Error deleting team:", error);
        }
    },
    addOkr: (okr) => set(state => ({
        data: { ...state.data, okrs: [...state.data.okrs, { ...okr, id: Date.now().toString(), progress: 0 }] }
    })),
    updateOkr: (id, updates) => set(state => ({
        data: { ...state.data, okrs: state.data.okrs.map(o => o.id === id ? { ...o, ...updates } : o) }
    })),
    deleteOkr: (id) => set(state => ({
        data: { ...state.data, okrs: state.data.okrs.filter(o => o.id !== id && o.parentId !== id) }
    })),
    updateOkrProgress: (id, progress) => set(state => ({
        data: { ...state.data, okrs: state.data.okrs.map(o => o.id === id ? { ...o, progress } : o) }
    })),
    updateOkrNotes: (id, notes) => set(state => ({
        data: { ...state.data, okrs: state.data.okrs.map(o => o.id === id ? { ...o, notes } : o) }
    })),
}));
