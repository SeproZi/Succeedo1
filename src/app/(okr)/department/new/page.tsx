
'use client';
import dynamic from 'next/dynamic'

const NewDepartmentClientPage = dynamic(
  () => import('@/components/app/new-department-client-page'),
  { ssr: false }
)

export default function Page() {
  return <NewDepartmentClientPage />
}
