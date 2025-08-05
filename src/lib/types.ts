export type OkrPillar = 'People' | 'Product' | 'Tech';
export type OkrPriority = 'P1' | 'P2' | 'P3';
export type TimelinePeriod = 'P1' | 'P2' | 'P3';

export interface BaseItem {
    id: string;
    title: string;
}

export interface Department extends BaseItem {}

export interface Team extends BaseItem {
    departmentId: string;
}

export type OkrOwner = 
    | { type: 'company' }
    | { type: 'department', id: string }
    | { type: 'team', id: string, departmentId: string };

export type OkrItem = BaseItem & {
  type: 'objective' | 'keyResult';
  progress: number;
  parentId: string | null;
  owner: OkrOwner;
  notes?: string;
  pillar?: OkrPillar;
  priority?: OkrPriority;
  year: number;
  period: TimelinePeriod;
};

export type AppData = {
    departments: Department[];
    teams: Team[];
    okrs: OkrItem[];
};
