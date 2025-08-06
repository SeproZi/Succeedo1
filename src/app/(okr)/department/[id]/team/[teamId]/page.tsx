'use client';
import { OkrDashboard } from '@/components/app/okr-dashboard';
import useOkrStore from '@/hooks/use-okr-store';
import { useParams } from 'next/navigation';

export default function TeamOkrPage() {
    const params = useParams();
    const departmentId = params.id as string;
    const teamId = params.teamId as string;
    const { data: { teams }, loading } = useOkrStore();
    const team = teams.find(t => t.id === teamId && t.departmentId === departmentId);

    const title = loading ? "Loading..." : team ? `${team.title} Team` : "Team";
    
    return (
        <OkrDashboard
            owner={{ type: 'team', id: teamId, departmentId: departmentId }}
            title={title}
        />
    );
}
