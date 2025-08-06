
'use client';
import { OkrDashboard } from '@/components/app/okr-dashboard';
import useOkrStore from '@/hooks/use-okr-store';
import { useParams } from 'next/navigation';

export default function TeamOkrPage() {
    const params = useParams();
    const id = params.id as string;
    const teamId = params.teamId as string;
    const team = useOkrStore(state => state.data.teams.find(t => t.id === teamId && t.departmentId === id));

    if (!team) {
        return <div>Team not found.</div>;
    }

    return (
        <OkrDashboard
            owner={{ type: 'team', id: teamId, departmentId: id }}
            title={`${team.title} Team`}
        />
    );
}
