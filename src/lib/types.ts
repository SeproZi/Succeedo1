export type OkrItem = {
  id: string;
  title: string;
  type: 'objective' | 'keyResult';
  progress: number;
  parentId: string | null;
};
