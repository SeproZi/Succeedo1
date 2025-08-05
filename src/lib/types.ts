export type OkrPillar = 'People' | 'Product' | 'Tech';
export type OkrPriority = 'P1' | 'P2' | 'P3';

export type OkrItem = {
  id: string;
  title: string;
  type: 'objective' | 'keyResult';
  progress: number;
  parentId: string | null;
  notes?: string;
  pillar?: OkrPillar;
  priority?: OkrPriority;
};
