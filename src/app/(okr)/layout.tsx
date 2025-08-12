
'use client';
import dynamic from 'next/dynamic';

const OkrLayoutClient = dynamic(
  () => import('@/components/app/okr-layout-client'),
  { ssr: false }
);

export default function OkrLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <OkrLayoutClient>{children}</OkrLayoutClient>;
}
