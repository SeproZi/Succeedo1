'use client';

import { create } from 'zustand';
import type { AppData, Department, OkrItem, Team, TimelinePeriod } from '@/lib/types';

const currentYear = new Date().getFullYear();

const initialData: AppData = {
    departments: [],
    teams: [],
    okrs: [],
};


interface OkrState {
  data: AppData;
  currentYear: number;
  currentPeriod: TimelinePeriod;
  availableYears: number[];
  addYear: (year: number) => void;
  setYear: (year: number) => void;
  setPeriod: (period: TimelinePeriod) => void;
  addDepartment: (title: string) => void;
  updateDepartment: (id: string, title: string) => void;
  deleteDepartment: (id: string) => void;
  addTeam: (title: string, departmentId: string) => void;
  updateTeam: (id: string, title: string) => void;
  deleteTeam: (id: string) => void;
  addOkr: (okr: Omit<OkrItem, 'id' | 'progress'>) => void;
  updateOkr: (id: string, updates: Partial<Omit<OkrItem, 'id'>>) => void;
  deleteOkr: (id: string) => void;
  updateOkrProgress: (id: string, progress: number) => void;
  updateOkrNotes: (id: string, notes: string) => void;
}

const getInitialYears = () => {
    const year = new Date().getFullYear();
    const years = new Set<number>();
    years.add(year - 1);
    years.add(year);
    years.add(year + 1);
    initialData.okrs.forEach(okr => years.add(okr.year));
    return Array.from(years).sort();
}

export const useOkrStore = create<OkrState>((set) => ({
    data: initialData,
    currentYear: new Date().getFullYear(),
    currentPeriod: 'P1',
    availableYears: getInitialYears(),
    addYear: (year) => set(state => {
        if (state.availableYears.includes(year)) return state;
        const newYears = [...state.availableYears, year].sort();
        return { availableYears: newYears };
    }),
    setYear: (year) => set({ currentYear: year }),
    setPeriod: (period) => set({ currentPeriod: period }),
    addDepartment: (title) => set(state => ({
        data: { ...state.data, departments: [...state.data.departments, { id: Date.now().toString(), title }] }
    })),
    updateDepartment: (id, title) => set(state => ({
        data: { ...state.data, departments: state.data.departments.map(d => d.id === id ? { ...d, title } : d) }
    })),
    deleteDepartment: (id) => set(state => {
        const teamsToDelete = state.data.teams.filter(t => t.departmentId === id).map(t => t.id);
        const okrsToDelete = state.data.okrs.filter(o =>
            (o.owner.type === 'department' && o.owner.id === id) ||
            (o.owner.type === 'team' && teamsToDelete.includes(o.owner.id))
        ).map(o => o.id);
        
        return {
            data: {
                ...state.data,
                departments: state.data.departments.filter(d => d.id !== id),
                teams: state.data.teams.filter(t => t.departmentId !== id),
                okrs: state.data.okrs.filter(o => !okrsToDelete.includes(o.id)),
            }
        };
    }),
    addTeam: (title, departmentId) => set(state => ({
        data: { ...state.data, teams: [...state.data.teams, { id: Date.now().toString(), title, departmentId }] }
    })),
    updateTeam: (id, title) => set(state => ({
        data: { ...state.data, teams: state.data.teams.map(t => t.id === id ? { ...t, title } : t) }
    })),
    deleteTeam: (id) => set(state => {
        const okrsToDelete = state.data.okrs.filter(o =>
            o.owner.type === 'team' && o.owner.id === id
        ).map(o => o.id);

        return {
            data: {
                ...state.data,
                teams: state.data.teams.filter(t => t.id !== id),
                okrs: state.data.okrs.filter(o => !okrsToDelete.includes(o.id)),
            }
        };
    }),
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
