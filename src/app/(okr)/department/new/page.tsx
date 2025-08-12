'use client';

import dynamic from 'next/dynamic'

const NewDepartmentLoader = dynamic(
  () => import('@/components/app/new-department-loader'),
  { ssr: false }
)

export default function Page() {
  return <NewDepartmentLoader />
}
