export type OkrPillar = 'People' | 'Product' | 'Tech';

export type OkrItem = {
  id: string;
  title: string;
  type: 'objective' | 'keyResult';
  progress: number;
  parentId: string | null;
  notes?: string;
  pillar?: OkrPillar;
};
