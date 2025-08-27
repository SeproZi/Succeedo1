import { z } from 'zod';

export type OkrPillar = 'People' | 'Product' | 'Tech';
export type OkrPriority = 'P1' | 'P2' | 'P3';
export type TimelinePeriod = 'P1' | 'P2' | 'P3';

export interface BaseItem {
    id: string;
    title: string;
}

export interface Department extends BaseItem {
    pillarDescriptions?: Partial<Record<OkrPillar, string>>;
}

export interface Team extends BaseItem {
    departmentId: string;
    pillarDescriptions?: Partial<Record<OkrPillar, string>>;
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
  order: number;
  notes?: string;
  pillar?: OkrPillar;
  priority?: OkrPriority;
  year: number;
  period: TimelinePeriod;
  linkedDepartmentOkrId?: string | null;
};

export type AppData = {
    departments: Department[];
    teams: Team[];
    okrs: OkrItem[];
};

// AI Flow Schemas
export const SuggestKeyResultsInputSchema = z.object({
  objectiveTitle: z.string().describe('The title of the objective.'),
});
export type SuggestKeyResultsInput = z.infer<typeof SuggestKeyResultsInputSchema>;

export const SuggestKeyResultsOutputSchema = z.object({
    keyResults: z.array(z.string()).describe('An array of 3-5 suggested key results.'),
});
export type SuggestKeyResultsOutput = z.infer<typeof SuggestKeyResultsOutputSchema>;

export const CheckUserInputSchema = z.object({
    email: z.string().email().describe('The email address to check.'),
});
export type CheckUserInput = z.infer<typeof CheckUserInputSchema>;

export const CheckUserOutputSchema = z.object({
    authorized: z.boolean().describe('Whether the user is authorized.'),
});
export type CheckUserOutput = z.infer<typeof CheckUserOutputSchema>;
