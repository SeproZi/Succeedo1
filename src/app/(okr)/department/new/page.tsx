
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

'use client';
import dynamic from 'next/dynamic'

const NewDepartmentClientPage = dynamic(
  () => import('@/components/app/new-department-client-page'),
  { ssr: false }
)

export default function Page() {
  return <NewDepartmentClientPage />
}
