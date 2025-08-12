
'use client';
import dynamic from 'next/dynamic'

const TeamOkrClientPage = dynamic(
  () => import('@/components/app/team-okr-client-page'),
  { ssr: false }
)

export default function Page() {
  return <TeamOkrClientPage />
}
