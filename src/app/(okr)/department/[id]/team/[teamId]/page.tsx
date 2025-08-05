'use client';
import { OkrDashboard } from '@/components/app/okr-dashboard';
import { useOkrStore } from '@/hooks/use-okr-store';

export default function TeamOkrPage({ params }: { params: { id: string; teamId: string }}) {
    const team = useOkrStore(state => state.data.teams.find(t => t.id === params.teamId && t.departmentId === params.id));

    if (!team) {
        return <div>Team not found.</div>;
    }

    return (
        <OkrDashboard
            owner={{ type: 'team', id: params.teamId, departmentId: params.id }}
            title={`${team.title} Team`}
        />
    );
}
