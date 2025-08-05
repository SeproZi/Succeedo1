'use client';

import { create } from 'zustand';
import type { AppData, Department, OkrItem, Team } from '@/lib/types';

const initialData: AppData = {
    departments: [
        { id: '1', title: 'Engineering' },
        { id: '2', title: 'Product' },
        { id: '3', title: 'Sales' },
    ],
    teams: [
        { id: '101', title: 'Platform', departmentId: '1' },
        { id: '102', title: 'Frontend', departmentId: '1' },
        { id: '201', title: 'Growth', departmentId: '2' },
        { id: '202', title: 'Core', departmentId: '2' },
        { id: '301', title: 'Enterprise', departmentId: '3' },
    ],
    okrs: [
        // Engineering Department
        { id: '1001', title: 'Foster a world-class engineering team', type: 'objective', progress: 0, parentId: null, pillar: 'People', priority: 'P1', owner: { type: 'department', id: '1' } },
        { id: '1002', title: 'Hire 5 senior engineers', type: 'keyResult', progress: 40, parentId: '1001', notes: '2 frontend, 2 backend, 1 SRE', priority: 'P1', owner: { type: 'department', id: '1' } },
        { id: '1003', title: 'Implement a new professional development plan', type: 'keyResult', progress: 80, parentId: '1001', notes: 'Mentorship program is live.', priority: 'P2', owner: { type: 'department', id: '1' } },
        
        // Platform Team
        { id: '1101', title: 'Modernize Core Platform Technology', type: 'objective', progress: 0, parentId: null, pillar: 'Tech', priority: 'P3', owner: { type: 'team', id: '101', departmentId: '1' } },
        { id: '1102', title: 'Migrate to a new cloud provider', type: 'keyResult', progress: 60, parentId: '1101', notes: 'AWS migration is 60% complete.', priority: 'P2', owner: { type: 'team', id: '101', departmentId: '1' } },
        { id: '1103', title: 'Reduce API latency by 30%', type: 'keyResult', progress: 90, parentId: '1101', notes: '', priority: 'P1', owner: { type: 'team', id: '101', departmentId: '1' } },

        // Product Department
        { id: '2001', title: 'Launch New Product Line', type: 'objective', progress: 0, parentId: null, pillar: 'Product', priority: 'P2', owner: { type: 'department', id: '2' } },
        { id: '2002', title: 'Achieve $1M in revenue', type: 'keyResult', progress: 75, parentId: '2001', notes: 'Initial revenue target is for Q3.', priority: 'P1', owner: { type: 'department', id: '2' } },
    ],
};


interface OkrState {
  data: AppData;
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

export const useOkrStore = create<OkrState>((set) => ({
    data: initialData,
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
