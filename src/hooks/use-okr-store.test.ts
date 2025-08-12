import useOkrStore, { getTimelineDefaults, calculateProgress } from './use-okr-store';
import { act } from '@testing-library/react';
import { OkrItem, Department, Team } from '@/lib/types';

// Mock the db interaction
jest.mock('@/lib/firebase', () => ({
  db: {}, // Provide a mock db object
}));
jest.mock('firebase/firestore', () => ({
  getDocs: jest.fn(() => Promise.resolve({ docs: [] })),
  query: jest.fn(),
  collection: jest.fn(),
}));

const mockDepartments: Department[] = [
  { id: 'deptA', title: 'Product' },
  { id: 'deptB', title: 'Sales' },
];

const mockTeams: Team[] = [
  { id: 'teamA1', title: 'Frontend', departmentId: 'deptA' },
  { id: 'teamB1', title: 'Enterprise', departmentId: 'deptB' },
];

const mockOkrs: OkrItem[] = [
  // Department A ("Product")
  { id: 'okrA', title: 'Dept A Objective', year: 2025, period: 'P1', owner: { type: 'department', id: 'deptA' }, progress: 0, type: 'objective', parentId: null, pillar: 'Product' },
  { id: 'krA1', title: 'KR A1', year: 2025, period: 'P1', parentId: 'okrA', owner: { type: 'department', id: 'deptA' }, progress: 50, type: 'keyResult' },
  // Team A1 ("Frontend")
  { id: 'okrA1-1', title: 'Team A1 Objective 1', year: 2025, period: 'P1', owner: { type: 'team', id: 'teamA1', departmentId: 'deptA' }, progress: 0, type: 'objective', parentId: null, pillar: 'Tech' },
  { id: 'krA1-1a', title: 'KR A1-1a', year: 2025, period: 'P1', parentId: 'okrA1-1', owner: { type: 'team', id: 'teamA1', departmentId: 'deptA' }, progress: 100, type: 'keyResult' },
  { id: 'okrA1-2', title: 'Team A1 Objective 2', year: 2025, period: 'P1', owner: { type: 'team', id: 'teamA1', departmentId: 'deptA' }, progress: 0, type: 'objective', parentId: null, pillar: 'Tech' }, // Progress should be 0, has no KR
  // Team B1 ("Enterprise")
  { id: 'okrB1', title: 'Team B1 Objective', year: 2025, period: 'P1', owner: { type: 'team', id: 'teamB1', departmentId: 'deptB' }, progress: 0, type: 'objective', parentId: null, pillar: 'People' },
  { id: 'krB1a', title: 'KR B1a', year: 2025, period: 'P1', parentId: 'okrB1', owner: { type: 'team', id: 'teamB1', departmentId: 'deptB' }, progress: 20, type: 'keyResult' },
  { id: 'krB1b', title: 'KR B1b', year: 2025, period: 'P1', parentId: 'okrB1', owner: { type: 'team', id: 'teamB1', departmentId: 'deptB' }, progress: 30, type: 'keyResult' },
  // Data for another timeline to test filtering
  { id: 'okrOld', title: 'Old OKR', year: 2024, period: 'P3', owner: { type: 'department', id: 'deptA' }, progress: 100, type: 'objective', parentId: null, pillar: 'Product' },
];


describe('useOkrStore', () => {

  describe('timeline logic', () => {
    beforeEach(() => {
      act(() => {
        const { latestYear, latestPeriod, availableYears } = getTimelineDefaults({ okrs: mockOkrs, departments: [], teams: [] });
        useOkrStore.setState({
          data: { departments: [], teams: [], okrs: mockOkrs },
          loading: false,
          currentYear: latestYear,
          currentPeriod: latestPeriod,
          availableYears: availableYears,
        });
      });
    });

    it('should initialize with the latest year and period from data', () => {
      const state = useOkrStore.getState();
      expect(state.currentYear).toBe(2025);
      expect(state.currentPeriod).toBe('P1');
      expect(state.availableYears).toEqual([2024, 2025]);
    });

    it('should allow changing the year and period', () => {
      act(() => {
        useOkrStore.getState().setYear(2024);
        useOkrStore.getState().setPeriod('P3');
      });

      const state = useOkrStore.getState();
      expect(state.currentYear).toBe(2024);
      expect(state.currentPeriod).toBe('P3');
    });
  });

  describe('aggregation selectors', () => {
    beforeEach(() => {
      act(() => {
        useOkrStore.setState({
          data: { departments: mockDepartments, teams: mockTeams, okrs: mockOkrs },
          loading: false,
          currentYear: 2025,
          currentPeriod: 'P1',
        });
      });
    });

    it('should calculate company overview progress correctly', () => {
      const { overallProgress, departmentProgress } = useOkrStore.getState().selectCompanyOverview();
      
      const deptA = departmentProgress.find(d => d.id === 'deptA');
      const deptB = departmentProgress.find(d => d.id === 'deptB');

      expect(deptA?.progress).toBe(50);
      expect(deptB?.progress).toBe(25);
      expect(overallProgress).toBe(38);
    });

    it('should calculate dashboard data correctly for a department', () => {
      const { topLevelOkrs, overallProgress } = useOkrStore.getState().selectDashboardData({ type: 'department', id: 'deptA' });
      
      expect(topLevelOkrs.length).toBe(1);
      expect(topLevelOkrs[0].title).toBe('Dept A Objective');
      expect(overallProgress).toBe(50); // Progress comes from its one KR
    });

    it('should calculate dashboard data correctly for a team', () => {
      const { topLevelOkrs, overallProgress, pillarProgress } = useOkrStore.getState().selectDashboardData({ type: 'team', id: 'teamA1' });

      expect(topLevelOkrs.length).toBe(2);
      expect(topLevelOkrs.some(o => o.title === 'Team A1 Objective 1')).toBe(true);
      // Prog = (OKR A1-1 + OKR A1-2) / 2 = (100% + 0%) / 2 = 50%
      expect(overallProgress).toBe(50);
      expect(pillarProgress.Tech).toBe(50); // Both objectives are 'Tech'
      expect(pillarProgress.People).toBe(0);
    });
  });

  describe('calculateProgress utility', () => {
      it('should calculate the average progress of key results', () => {
          const progress = calculateProgress('okrB1', mockOkrs);
          expect(progress).toBe(25); // (20 + 30) / 2
      });

      it('should return 0 if there are no key results', () => {
          const progress = calculateProgress('okrA1-2', mockOkrs);
          expect(progress).toBe(0);
      });
  });
});
