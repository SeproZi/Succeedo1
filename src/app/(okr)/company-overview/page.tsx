
'use client';
import dynamic from 'next/dynamic'

const CompanyOverviewClientPage = dynamic(
  () => import('@/components/app/company-overview-client-page'),
  { ssr: false }
)

export default function Page() {
  return <CompanyOverviewClientPage />
}
