
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
import { auth, db } from '@/lib/firebase';
import { useEffect } from 'react';

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
  addDepartment: (title: string, id?: string) => Promise<string | undefined>;
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
}

const getInitialYears = (data: AppData) => {
    const year = new Date().getFullYear();
    const years = new Set<number>();
    years.add(year - 1);
    years.add(year);
    years.add(year + 1);
    data.okrs.forEach(okr => years.add(okr.year));
    return Array.from(years).sort((a,b) => a-b);
}

const initialState = {
    data: { departments: [], teams: [], okrs: [] },
    loading: true,
    currentYear: new Date().getFullYear(),
    currentPeriod: 'P1' as TimelinePeriod,
    availableYears: [],
};

const useOkrStoreImpl = create<OkrState>((set, get) => ({
    ...initialState,
    initData: async () => {
        set({ loading: true });
        try {
            const departmentsSnapshot = await getDocs(collection(db, "departments"));
            const departments = departmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Department)).sort((a,b) => a.title.localeCompare(b.title));

            const teamsSnapshot = await getDocs(collection(db, "teams"));
            const teams = teamsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team)).sort((a,b) => a.title.localeCompare(b.title));
            
            const okrsSnapshot = await getDocs(collection(db, 'okrs'));
            const okrs = okrsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as OkrItem));

            const newData = { departments, teams, okrs };
            
            set({ data: newData, loading: false, availableYears: getInitialYears(newData) });
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
    addDepartment: async (title, id) => {
        try {
            if (id) {
                const newDepartment = { id, title };
                 set(state => ({
                    data: { ...state.data, departments: [...state.data.departments, newDepartment].sort((a,b) => a.title.localeCompare(b.title)) }
                }));
                return id;
            }
            const docRef = await addDoc(collection(db, 'departments'), { title });
            const newDepartment = { id: docRef.id, title };
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
            const teamIds = teamsSnapshot.docs.map(d => d.id);
            teamsSnapshot.forEach(doc => batch.delete(doc.ref));

            const deptOkrsQuery = query(collection(db, 'okrs'), where('owner.type', '==', 'department'), where('owner.id', '==', id));
            const deptOkrsSnapshot = await getDocs(deptOkrsQuery);
            deptOkrsSnapshot.forEach(doc => batch.delete(doc.ref));

            if (teamIds.length > 0) {
                const teamOkrsQuery = query(collection(db, 'okrs'), where('owner.type', '==', 'team'), where('owner.id', 'in', teamIds));
                const teamOkrsSnapshot = await getDocs(teamOkrsQuery);
                teamOkrsSnapshot.forEach(doc => batch.delete(doc.ref));
            }

            await batch.commit();

            set(state => {
                const teamsToDelete = state.data.teams.filter(t => t.departmentId === id).map(t => t.id);
                const okrIdsToDelete = state.data.okrs
                    .filter(okr => (okr.owner.type === 'department' && okr.owner.id === id) || (okr.owner.type === 'team' && teamsToDelete.includes(okr.owner.id)))
                    .map(okr => okr.id);

                return {
                    data: {
                        departments: state.data.departments.filter(d => d.id !== id),
                        teams: state.data.teams.filter(t => t.departmentId !== id),
                        okrs: state.data.okrs.filter(o => !okrIdsToDelete.includes(o.id) && o.parentId && !okrIdsToDelete.includes(o.parentId)),
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
            
            const okrsQuery = query(collection(db, 'okrs'), where('owner.type', '==', 'team'), where('owner.id', '==', id));
            const okrsSnapshot = await getDocs(okrsQuery);
            okrsSnapshot.forEach(doc => batch.delete(doc.ref));

            await batch.commit();

            set(state => {
                 const okrIdsToDelete = state.data.okrs
                    .filter(okr => okr.owner.type === 'team' && okr.owner.id === id)
                    .map(okr => okr.id);
                return {
                    data: {
                        ...state.data,
                        teams: state.data.teams.filter(t => t.id !== id),
                        okrs: state.data.okrs.filter(o => !okrIdsToDelete.includes(o.id) && o.parentId && !okrIdsToDelete.includes(o.parentId)),
                    }
                }
            });
        } catch (error) {
            console.error("Error deleting team:", error);
        }
    },
    addOkr: async (okr) => {
        try {
            const newOkrData: Omit<OkrItem, 'id'> = { ...okr, progress: 0 };
             if (newOkrData.pillar === undefined) {
                (newOkrData as Partial<OkrItem>).pillar = null as any;
            }
             if (newOkrData.priority === undefined) {
                (newOkrData as Partial<OkrItem>).priority = null as any;
            }
             if (newOkrData.notes === undefined) {
                (newOkrData as Partial<OkrItem>).notes = '';
            }

            const docRef = await addDoc(collection(db, 'okrs'), newOkrData);
            set(state => ({
                data: { ...state.data, okrs: [...state.data.okrs, { ...newOkrData, id: docRef.id } as OkrItem] }
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
}));

// This effect will run once, setting up the auth listener.
auth.onAuthStateChanged(user => {
    if (user) {
        useOkrStoreImpl.getState().initData();
    } else {
        useOkrStoreImpl.getState().clearData();
    }
});


export const useOkrStore = (selector?: (state: OkrState) => any) => {
    const state = useOkrStoreImpl(selector);
    return state;
};

useOkrStore.getState = useOkrStoreImpl.getState;
