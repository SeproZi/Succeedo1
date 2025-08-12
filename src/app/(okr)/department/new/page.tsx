
// SERVER FILE – OK to export route options here
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import NewDepartmentClientPage from '@/components/app/new-department-client-page';

export default function Page() {
  return <NewDepartmentClientPage />;
}
