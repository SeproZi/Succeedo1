
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
  { id: 'teamA2', title: 'Backend', departmentId: 'deptA' },
  { id: 'teamB1', title: 'Enterprise', departmentId: 'deptB' },
];

const mockOkrs: OkrItem[] = [
  // Department A ("Product") - linked by team A1 obj 3 & team A2 obj 1
  { id: 'okrA', title: 'Dept A Objective', year: 2025, period: 'P1', owner: { type: 'department', id: 'deptA' }, progress: 0, type: 'objective', parentId: null, pillar: 'Product' },
  { id: 'krA1', title: 'KR A1', year: 2025, period: 'P1', parentId: 'okrA', owner: { type: 'department', id: 'deptA' }, progress: 50, type: 'keyResult' },
  
  // Department B ("Sales") - For other test cases
  { id: 'okrB', title: 'Dept B Objective (Direct KRs only)', year: 2025, period: 'P1', owner: { type: 'department', id: 'deptB' }, progress: 0, type: 'objective', parentId: null, pillar: 'People' },
  { id: 'krB1', title: 'KR B1', year: 2025, period: 'P1', parentId: 'okrB', owner: { type: 'department', id: 'deptB' }, progress: 80, type: 'keyResult' },
  { id: 'krB2', title: 'KR B2', year: 2025, period: 'P1', parentId: 'okrB', owner: { type: 'department', id: 'deptB' }, progress: 40, type: 'keyResult' },
  { id: 'okrC', title: 'Dept B Empty Objective', year: 2025, period: 'P1', owner: { type: 'department', id: 'deptB' }, progress: 0, type: 'objective', parentId: null, pillar: 'People' },


  // Team A1 ("Frontend")
  { id: 'okrA1-1', title: 'Team A1 Objective 1', year: 2025, period: 'P1', owner: { type: 'team', id: 'teamA1', departmentId: 'deptA' }, progress: 0, type: 'objective', parentId: null, pillar: 'Tech' },
  { id: 'krA1-1a', title: 'KR A1-1a', year: 2025, period: 'P1', parentId: 'okrA1-1', owner: { type: 'team', id: 'teamA1', departmentId: 'deptA' }, progress: 100, type: 'keyResult' },
  { id: 'okrA1-2', title: 'Team A1 Objective 2', year: 2025, period: 'P1', owner: { type: 'team', id: 'teamA1', departmentId: 'deptA' }, progress: 0, type: 'objective', parentId: null, pillar: 'Tech' }, // Progress should be 0, has no KR
  { id: 'okrA1-3', title: 'Team A1 Objective 3 (Linked)', year: 2025, period: 'P1', owner: { type: 'team', id: 'teamA1', departmentId: 'deptA' }, progress: 0, type: 'objective', parentId: null, pillar: 'Tech', linkedDepartmentOkrId: 'okrA' },
  { id: 'krA1-3a', title: 'KR A1-3a', year: 2025, period: 'P1', parentId: 'okrA1-3', owner: { type: 'team', id: 'teamA1', departmentId: 'deptA' }, progress: 90, type: 'keyResult' },
  
  // Team A2 ("Backend")
  { id: 'okrA2-1', title: 'Team A2 Objective 1 (Linked)', year: 2025, period: 'P1', owner: { type: 'team', id: 'teamA2', departmentId: 'deptA' }, progress: 0, type: 'objective', parentId: null, pillar: 'Tech', linkedDepartmentOkrId: 'okrA' },
  { id: 'krA2-1a', title: 'KR A2-1a', year: 2025, period: 'P1', parentId: 'okrA2-1', owner: { type: 'team', id: 'teamA2', departmentId: 'deptA' }, progress: 70, type: 'keyResult' },
  
  // Team B1 ("Enterprise")
  { id: 'okrB1-team', title: 'Team B1 Objective', year: 2025, period: 'P1', owner: { type: 'team', id: 'teamB1', departmentId: 'deptB' }, progress: 0, type: 'objective', parentId: null, pillar: 'People' },
  { id: 'krB1a-team', title: 'KR B1a', year: 2025, period: 'P1', parentId: 'okrB1-team', owner: { type: 'team', id: 'teamB1', departmentId: 'deptB' }, progress: 20, type: 'keyResult' },
  { id: 'krB1b-team', title: 'KR B1b', year: 2025, period: 'P1', parentId: 'okrB1-team', owner: { type: 'team', id: 'teamB1', departmentId: 'deptB' }, progress: 30, type: 'keyResult' },
  
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

    it('should calculate dashboard data correctly for a department with mixed children', () => {
      const { topLevelOkrs, overallProgress } = useOkrStore.getState().selectDashboardData({ type: 'department', id: 'deptA' });
      
      expect(topLevelOkrs.length).toBe(1);
      expect(topLevelOkrs[0].title).toBe('Dept A Objective');
      // Prog = (KR A1 progress + Linked OKR A1-3 prog + Linked OKR A2-1 prog) / 3 
      //      = (50% + 90% + 70%) / 3 = 210 / 3 = 70%
      expect(overallProgress).toBe(70);
    });

    it('should calculate dashboard data correctly for a team', () => {
      const { topLevelOkrs, overallProgress, pillarProgress } = useOkrStore.getState().selectDashboardData({ type: 'team', id: 'teamA1', departmentId: 'deptA' });

      expect(topLevelOkrs.length).toBe(3);
      expect(topLevelOkrs.some(o => o.title === 'Team A1 Objective 1')).toBe(true);
      // Prog = (OKR A1-1 + OKR A1-2 + OKR A1-3) / 3 = (100% + 0% + 90%) / 3 = 63.33 -> 63
      expect(overallProgress).toBe(63);
      expect(pillarProgress.Tech).toBe(63); // All 3 objectives are 'Tech'
      expect(pillarProgress.People).toBe(0);
    });

    it('should calculate dashboard data for a department with only linked children', () => {
      const okrsWithOnlyLinkedChild: OkrItem[] = [
        { id: 'deptOnlyObj', title: 'Dept Only Objective', year: 2025, period: 'P1', owner: { type: 'department', id: 'deptA' }, progress: 0, type: 'objective', parentId: null, pillar: 'Product' },
        { id: 'teamObjLinked', title: 'Team Linked Obj', year: 2025, period: 'P1', owner: { type: 'team', id: 'teamA1', departmentId: 'deptA' }, progress: 0, type: 'objective', parentId: null, pillar: 'Tech', linkedDepartmentOkrId: 'deptOnlyObj' },
        { id: 'teamKrForLinked', title: 'KR for Linked', year: 2025, period: 'P1', parentId: 'teamObjLinked', owner: { type: 'team', id: 'teamA1', departmentId: 'deptA' }, progress: 88, type: 'keyResult' },
      ];
      act(() => {
        useOkrStore.setState({
          data: { departments: mockDepartments, teams: mockTeams, okrs: okrsWithOnlyLinkedChild },
        });
      });

      const { overallProgress } = useOkrStore.getState().selectDashboardData({ type: 'department', id: 'deptA' });
      expect(overallProgress).toBe(88); // Progress comes entirely from the one linked child
    });
  });

  describe('calculateProgress utility', () => {
      it('should calculate the average progress of key results', () => {
          const progress = calculateProgress('okrB1-team', mockOkrs);
          expect(progress).toBe(25); // (20 + 30) / 2
      });

      it('should return 0 if there are no key results', () => {
          const progress = calculateProgress('okrA1-2', mockOkrs);
          expect(progress).toBe(0);
      });

      it('should correctly average direct KRs and a single linked Team OKR', () => {
        const singleLinkedOkrList = mockOkrs.filter(o => o.id !== 'okrA2-1' && o.id !== 'krA2-1a');
        const progress = calculateProgress('okrA', singleLinkedOkrList);
        // Average = (direct KR 'krA1' 50% + linked OKR 'okrA1-3' 90%) / 2 = 70
        expect(progress).toBe(70);
      });
      
      it('should return 0 for an objective with no direct KRs or linked OKRs', () => {
          const progress = calculateProgress('okrC', mockOkrs);
          expect(progress).toBe(0);
      });

      it('should calculate progress for an objective with only direct KRs', () => {
          const progress = calculateProgress('okrB', mockOkrs);
          // Average of krB1 (80%) and krB2 (40%) = 60
          expect(progress).toBe(60);
      });

      it('should correctly average direct KRs and multiple linked Team OKRs', () => {
          const progress = calculateProgress('okrA', mockOkrs);
          // Direct KR 'krA1': 50%
          // Linked OKR 'okrA1-3' has KR 'krA1-3a': 90%
          // Linked OKR 'okrA2-1' has KR 'krA2-1a': 70%
          // Average = (50 + 90 + 70) / 3 = 210 / 3 = 70
          expect(progress).toBe(70);
      });
  });
});
