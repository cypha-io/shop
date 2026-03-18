import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Delivery Info' };
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
