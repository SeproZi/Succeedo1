
'use client';
import dynamic from 'next/dynamic'

const DepartmentOkrClientPage = dynamic(
  () => import('@/components/app/department-okr-client-page'),
  { ssr: false }
)

export default function Page() {
  return <DepartmentOkrClientPage />
}
